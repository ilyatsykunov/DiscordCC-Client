# Discord Closed Captions - Client

Electron app for visualizing Discord voice-chat transcriptions generated with the [DCC-Server](https://github.com/ilyatsykunov/DiscordCC-Server).


## Setup

The [server-side](https://github.com/ilyatsykunov/DiscordCC-Server) needs to be setup first in order for DCC-Client to receive voice-chat transcriptions. 

In index.js, add your PubNub publish, subscribe and secret keys in the following fields:
```javascript
const pubnub = new PubNub({
    publishKey: "ADD PUBLISH KEY",
    subscribeKey: "ADD SUBSCRIBE KEY",
    secretKey: "ADD SECRET KEY"
});
```
