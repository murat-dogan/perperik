import * as log4js from 'log4js';

export function initLogger(logLevel: string): void {
    // Configure Logger
    log4js.configure({
        appenders: { console: { type: 'console' } },
        categories: {
            default: {
                appenders: ['console'],
                level: logLevel,
            },
        },
    });
}
