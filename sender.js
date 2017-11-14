const Nsq = require('./common');
const moment = require('moment');

const requestTopic = 'request_topic';
const responseTopic = 'response_topic';

class NsqSender extends Nsq {

    constructor(listenTopic) {
        super(listenTopic);
        this.messageNumber = 1;
    }

    handleMessage() {
        this.reader.on('message', msg => {
            msg.finish();
            console.log(`${moment().format('YYYY-MM-DD hh:mm:ss.SSS')} Received response on message nr ${msg.body.toString()}`);
        });
    }

    sendMessage() {
        console.log(`${moment().format('YYYY-MM-DD hh:mm:ss.SSS')} Send message nr ${this.messageNumber}`);
        this.writer.publish(requestTopic, `${this.messageNumber}`);
        this.messageNumber++;
    }

    sendMessages() {
        setInterval(() => {
            this.sendMessage();
        }, 10000);
    }
}

const nsqSender = new NsqSender(responseTopic);
nsqSender.init().then(() => {
    nsqSender.handleMessage();
    nsqSender.sendMessages();
});
