const nsq = require('nsqjs');
const moment = require('moment');

class Nsq {
    constructor(listenTopic) {
        this.listenTopic = listenTopic;
        this.writer = new nsq.Writer('127.0.0.1', 4150);
        this.reader = new nsq.Reader(this.listenTopic, 'test_channel', {
            lookupdHTTPAddresses: '127.0.0.1:4161'
        });
    }

    init() {
        return new Promise((resolve) => {
            this.writer.connect();
            this.reader.connect();
            this.onCloseReader();
            this.onConnect();
            this.onWriterInit().then(() => {
               resolve();
            });
        });
    }

    onConnect() {
        this.reader.on('nsqd_connected', host => {
            console.log(`${moment().format('YYYY-MM-DD hh:mm:ss.SSS')} Connteted to nsq ${host}`);
        });
    }

    onCloseReader() {
        this.reader.on('nsqd_closed', ()  => {
            console.log(`${moment().format('YYYY-MM-DD hh:mm:ss.SSS')} Closed reader.`);
            this.writer.close();
            this.readerReconnectInterval = setInterval(() => {
                try {
                    this.reader.connect();
                    // this.init();
                    console.log('try to connect');
                } catch (e) {
                    console.log(e)
                }
            }, 5000);
        });
    }

    onWriterInit() {
        return new Promise((resolve) => {
            this.writer.on('ready', () => { resolve(); });
        });
    }
}

module.exports = Nsq;

