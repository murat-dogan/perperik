const config = {
    logLevel: process.env.LOG_LEVEL || 'debug',
    wsPort: process.env.WS_PORT || 8080,
    certPath: process.env.CERT_PATH || 'test-certificate/localhost.crt',
    keyPath: process.env.KEY_PATH || 'test-certificate/localhost.key',
};

export default config;
