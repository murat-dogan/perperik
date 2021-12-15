import * as dotenv from 'dotenv';
import { getLogger } from 'log4js';
import config from './config';
import { initLogger } from './logger/logger';
import { createWSServer } from './ws-server/ws-server';

start();

function start(): void {
    // Load env file
    dotenv.config();

    // init logger
    initLogger(config.logLevel);

    const logger = getLogger('app');

    logger.info('Starting ...');

    // start ws server
    createWSServer(config.certPath, config.keyPath, config.wsPort);
}
