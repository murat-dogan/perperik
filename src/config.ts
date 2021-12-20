export default {
    logLevel: process.env.LOG_LEVEL || 'info',
    wsPort: process.env.WS_PORT || 8080,
    ipRateLimitPoints: process.env.IP_RATE_LIMIT_POINTS || 10,
    msgRateLimitPoints: process.env.MSG_RATE_LIMIT_POINTS || 60,
};
