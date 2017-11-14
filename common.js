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

    onWriterInit() {
        return new Promise((resolve) => {
            this.writer.on('ready', () => { resolve(); });
        });
    }
}

module.exports = Nsq;

