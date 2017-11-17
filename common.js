const nsq = require('nsqjs');
const moment = require('moment');
const EventEmitter = require('events');
const Timeouts = require('./lib/timeoutContants');

class NsqMessanger {
    constructor(listenTopic) {
        this.listenTopic = listenTopic;
        this.writer = new nsq.Writer('127.0.0.1', 4150);
        this.reader = new nsq.Reader(this.listenTopic, 'test_channel', {
            lookupdHTTPAddresses: '127.0.0.1:4161',
            lookupdPollInterval: 5,
            heartbeatInterval: 5
        });
        this.emitter = new EventEmitter();
        this.writerConnectionInterval = null;
        this.readerReconnectInterval = null;
    }

    init() {
        return new Promise((resolve) => {
            this.reader.connect();
            this.writer.connect();
            this.onWriterInit();
            this.onWriterClose();
            this.onWriterError();
            this.onCloseReader();
            this.onErrorReader();
            this.onConnect().then(() => {
                resolve();
            });
            this.readerConnecting = true;
        });
    }

    onConnect() {
        return new Promise((resolve) => {
            this.reader.on('nsqd_connected', host => {
                console.log(`${moment().format('YYYY-MM-DD hh:mm:ss.SSS')} Connected to nsq ${host}.`);
                clearInterval(this.readerReconnectInterval);
                this.readerReconnectInterval = null;
                this.emitter.emit('readerInit');
                this.readerConnecting = false;
                resolve();
            });
        });
    }

    onCloseReader() {
        this.reader.on('nsqd_closed', ()  => {
            console.log(`${moment().format('YYYY-MM-DD hh:mm:ss.SSS')} Closed reader. Will try to connect.`);
            if (!this.readerConnecting) {
                setTimeout(() => {
                    this.reader.connect();
                }, Timeouts.reconnect);
                this.readerConnecting = true;
            }
        });
    }

    onErrorReader() {
        this.reader.on('error', ()  => {
            console.log(`${moment().format('YYYY-MM-DD hh:mm:ss.SSS')} Reader error.`);
        });
    }

    onWriterInit() {
        this.writer.on('ready', () => {
            console.log(`${moment().format('YYYY-MM-DD hh:mm:ss.SSS')} Writer ready.`);
            clearInterval(this.writerConnectionInterval);
            this.writerConnectionInterval = null;
            this.emitter.emit('writerInit');
        });
    }

    onWriterClose() {
        this.writer.on('closed', () => {
            console.log(`${moment().format('YYYY-MM-DD hh:mm:ss.SSS')} Closed writer. Will try to connect again.`);
            setTimeout(() => {
                this.writer.connect();
            }, Timeouts.reconnect);
        });
    }

    onWriterError() {
        this.writer.on('error', () => {
            console.log(`${moment().format('YYYY-MM-DD hh:mm:ss.SSS')} Writer error. Will try to connect again.`);
        });
    }
}

module.exports = NsqMessanger;