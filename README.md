# nsqjs-example
example usage of nsqjs library


# Install dependencies
yarn install

# Install nsq
http://nsq.io/deployment/installing.html

# Run nsq
a) type command -> nsqlookupd & nsqd --lookupd-tcp-address=127.0.0.1:4160  --broadcast-address=127.0.0.1<br /> 
b) use docker

# Run
Open terminal and type -> node reveiver.js <br />
Open second terminal and tyle -> node sender.js

# Run docker (work with compose)

Build -> docker build -t nsqjs_app . <br /> 
Save -> docker save nsqjs_app | gzip -1 > nsqjs_myapp.tar.gz <br /> 
Load -> docker load --input nsqjs_myapp.tar.gz <br /> 
Edit docker compose -> <br /> 
```
  nsq_sender:
    image: nsqjs_app
    command: node sender.js
    environment:
      - SEND_MESSAGE_TIMEOUT=1000
      - NSQ_ADDRESS=nsqd
      - LOOKUP_ADDRESS=nsqlookupd:4161
    networks:
      - app
    depends_on:
      - nsqlookupd
  nsq_receiver:
    image: nsqjs_app
    command: node receiver.js
    environment:
      - NSQ_ADDRESS=nsqd
      - LOOKUP_ADDRESS=nsqlookupd:4161
    networks:
      - app
    depends_on:
      - nsqlookupd
  ```
