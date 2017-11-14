# nsqjs-example
example usage of nsqjs library


# Install dependencies
yarn install

# Install nsq
http://nsq.io/deployment/installing.html

# Run nsq
a) type command -> nsqlookupd & nsqd --lookupd-tcp-address=127.0.0.1:4160  --broadcast-address=127.0.0.1 OR use docker

# Run
Open terminal and type -> node reveiver.js <br />
Open second terminal and tyle -> node sender.js
