const nsq = require('nsqjs');
const moment = require('moment');
const EventEmitter = require('events');




class Nsq {
    constructor(listenTopic) {
        this.listenTopic = listenTopic;
        this.writer = new nsq.Writer('127.0.0.1', 4150);
        this.reader = new nsq.Reader(this.listenTopic, 'test_channel', {
            lookupdHTTPAddresses: '127.0.0.1:4161'
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
            this.onConnect().then(() => {
                resolve();
            });
        });
    }

    onConnect() {
        return new Promise((resolve) => {
            this.reader.on('nsqd_connected', host => {
                console.log(`${moment().format('YYYY-MM-DD hh:mm:ss.SSS')} Connteted to nsq ${host}.`);
                clearInterval(this.readerReconnectInterval);
                this.readerReconnectInterval = null;
                this.emitter.emit('readerInit');
                resolve();
            });
        });
    }

    onCloseReader() {
        this.reader.on('nsqd_closed', ()  => {
            console.log(`${moment().format('YYYY-MM-DD hh:mm:ss.SSS')} Closed reader.`);
            this.readerReconnectInterval = setInterval(() => {
                this.reader.connect();
            }, 10000);
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
            if (!this.writerConnectionInterval) {
                console.log(`${moment().format('YYYY-MM-DD hh:mm:ss.SSS')} Closed writer. Will try to connect again.`);
                this.writerConnectionInterval = setInterval(() => {
                    this.writer.connect();
                }, 10000);
            }
        });
    }

    onWriterError() {
        this.writer.on('error', () => {
            if (!this.writerConnectionInterval) {
                console.log(`${moment().format('YYYY-MM-DD hh:mm:ss.SSS')} Writer error. Will try to connect again.`);
                this.writerConnectionInterval = setInterval(() => {
                    this.writer.connect();
                }, 10000);
            }
        });
    }
}

module.exports = Nsq;

