const NsqMessanger = require('./common');
const moment = require('moment');
const nsq = require('nsqjs');

const requestTopic = 'request_topic';
const responseTopic = 'response_topic';

class NsqReceiver extends NsqMessanger {
    constructor(listenTopic) {
        super(listenTopic);
        const nsq_addres = process.env.NSQ_ADDRESS || '127.0.0.1';
        const lookup_address = process.env.LOOKUP_ADDRESS || '127.0.0.1:4161';
        this.writer = new nsq.Writer(nsq_addres, 4150);
        this.reader = new nsq.Reader(this.listenTopic, 'test_channel', {
            lookupdHTTPAddresses: lookup_address,
            lookupdPollInterval: 5,
            heartbeatInterval: 5
        });
    }

    handleMessage() {
        this.reader.on('message', (msg) => {
            console.log(`${moment().format('YYYY-MM-DD hh:mm:ss.SSS')} Received message [${msg.id}] nr ${msg.body.toString()}`);
            msg.finish();
            if (this.writer.ready) {
                console.log(`${moment().format('YYYY-MM-DD hh:mm:ss.SSS')} Send response on message [${msg.id}] nr ${msg.body.toString()}`);
                this.writer.publish(responseTopic, msg.body.toString());
            }
        })
    }
}

const nsqReceiver = new NsqReceiver(requestTopic);
nsqReceiver.init().then(() => {
    nsqReceiver.handleMessage();
});