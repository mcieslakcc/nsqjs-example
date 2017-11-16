const Nsq = require('./common');
const moment = require('moment');

const requestTopic = 'request_topic';
const responseTopic = 'response_topic';

class NsqReceiver extends Nsq {
    constructor(listenTopic) {
        super(listenTopic);
    }

    handleMessage() {
        this.reader.on('message', (msg) => {
            if (this.writer.ready) {
                console.log(`${moment().format('YYYY-MM-DD hh:mm:ss.SSS')} Received message [${msg.id}] nr ${msg.body.toString()}`);
                msg.finish();
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