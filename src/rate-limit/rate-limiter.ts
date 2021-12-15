import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';

// TODO: This could be stored on redis in the future
const ipNewConnectionLimiter = new RateLimiterMemory({
    points: 60, // 60 connections
    duration: 60, // 60 seconds
});

// TODO: This could be stored on redis in the future
const idMessageSendLimiter = new RateLimiterMemory({
    points: 60, // 60 messages
    duration: 60, // 60 seconds
});

export function consumeNewConnectionByIPLimit(ip: string): Promise<RateLimiterRes> {
    return ipNewConnectionLimiter.consume(ip);
}

export function consumeMessageSendLimit(id: string): Promise<RateLimiterRes> {
    return idMessageSendLimiter.consume(id);
}
