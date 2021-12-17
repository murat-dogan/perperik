# What is `perperik` ![logo](https://github.com/murat-dogan/perperik/raw/main/image/logo_64.png) ?

`perperik` is a signaling server that could be useful especially for WebRTC clients.

 WebRTC clients need an external signaling server in order to exchange information like ICE Candidates. This is why we need `perperik`!

 * Easy to use
 * Scalable
 * Lightweight

 # Public Instance

 You can use and test running instance of the server from addresses below;
 
 - `ws://perperik.fly.dev:80` (Non TLS)
 - `wss://perperik.fly.dev:443` (TLS)

# Rate Limits

 In order to prevent abuse usement, rate limit applied as follows;

-  **New Connection Limit per IP** : New connections is limited per IP basis. (Default 60 connection/minute, can be changed by using IP_RATE_LIMIT_POINTS enviroment variable)

-  **Send Message Limit per ID**   : Sent message counts is limited per ID basis. (Default 60 messages/minute, can be changed by using MSG_RATE_LIMIT_POINTS enviroment variable)

# How to Deploy an Instance?

## As a NodeJS Application

> NodeJS must be installed

```sh
git clone https://github.com/murat-dogan/perperik.git
cd perperik
npm i
npm run start
```

## Docker

> docker must be installed

```sh
git clone https://github.com/murat-dogan/perperik.git
cd perperik
docker build -t perperik:latest .
docker run -p 8080:8080 perperik

```

 # perperik-client

 Easy to use client library for NodeJS. 
 
 Please check [perperik-client](https://github.com/murat-dogan/perperik-client) project page for details.
