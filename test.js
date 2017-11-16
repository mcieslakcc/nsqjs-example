const nsq = require('nsqjs')

const reader = new nsq.Reader('45', 'test_channel', {
    lookupdHTTPAddresses: '127.0.0.1:4161'
})

reader.connect()

reader.on('message', msg => {
    console.log('Received message [%s]: %s', msg.id, msg.body.toString())
    msg.finish()
})

reader.on('nsqd_connected', host => {
    console.log(`Connteted to nsq ${host}`);
});