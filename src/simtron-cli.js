#!/usr/bin/env node

/* eslint no-console: off */

import chalk from 'chalk';
import simtron from './simtron';
import pkg from '../package.json';
import portFactory from './port-factory';
import logger from './logger';

if (['help', '--help', '-h', 'version', '--version', '-v'].includes(process.argv[2])) {
    logger.info(`
    ${chalk.bgMagenta(`simtron v${pkg.version}`)}

    Usage:

    ${chalk.cyan('simtron')}

    Configuration through environment variables:

    ${chalk.cyan('BOT_TOKEN')}         - ${chalk.grey(
        '(Mandatory)'
    )} The Slack Bot User OAuth Access Token for your organisation/team
  `);
    process.exit(0);
}

const options = {
    logger,
    botIds: ['simtron', '@simtron', '<@U9EEFTDKL>'],
    admins: ['U6XTUAV7X', 'U41NYS5EZ'],
};
if (!process.env.BOT_TOKEN) {
    logger.error('You must setup the BOT_TOKEN environment variable before running the bot');
    process.exit(1);
}
portFactory.then(
    port => {
        const bot = simtron(process.env.BOT_TOKEN, options, port);
        bot.start();
    },
    () => {
        logger.error('Exiting simtron');
        process.exit(0);
    }
);
