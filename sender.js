const Nsq = require('./common');
const moment = require('moment');
const Timeouts = require('./lib/timeoutContants');

const requestTopic = 'request_topic';
const responseTopic = 'response_topic';



class NsqSender extends Nsq {

    constructor(listenTopic) {
        super(listenTopic);
        this.messageNumber = 1;
        this.inverval = null;
        this.handleWriterInit();
    }

    handleMessage() {
        this.reader.on('message', msg => {
            msg.finish();
            console.log(`${moment().format('YYYY-MM-DD hh:mm:ss.SSS')} Received response on message nr ${msg.body.toString()}`);
        });
    }

    sendMessage() {
        if (this.writer.ready) {
            console.log(`${moment().format('YYYY-MM-DD hh:mm:ss.SSS')} Send message nr ${this.messageNumber}`);
            this.writer.publish(requestTopic, `${this.messageNumber}`);
            this.messageNumber++;
        } else {
            clearInterval(this.inverval);
            this.inverval = null;
        }
    }

    sendMessages() {
        console.log(`${moment().format('YYYY-MM-DD hh:mm:ss.SSS')} Writer is ready. Will send messages.`);
        this.inverval = setInterval(() => {
            this.sendMessage();
        }, Timeouts.sendMessage);
    }

    handleWriterInit() {
        this.emitter.on('writerInit', () => {
            this.sendMessages();
        });
    }
}

const nsqSender = new NsqSender(responseTopic);
nsqSender.init().then(() => {
    nsqSender.handleMessage();
});



