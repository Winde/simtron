#!/usr/bin/env node

/* eslint no-console: off */

import winston from 'winston';
import chalk from 'chalk';
import simtron from './simtron';
import pkg from '../package.json';

if (['help', '--help', '-h', 'version', '--version', '-v'].includes(process.argv[2])) {
  console.log(`
    ${chalk.bgMagenta(`simtron v${pkg.version}`)}

    Usage:

    ${chalk.cyan('simtron')}

    Configuration through environment variables:

    ${chalk.cyan('BOT_TOKEN')}         - ${chalk.grey(
    '(Mandatory)',
  )} The Slack Bot User OAuth Access Token for your organisation/team
  `);
  process.exit(0);
}

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      timestamp() {
        return new Date().toISOString();
      },
    }),
  ],
});

logger.cli();

const options = { logger };
if (!process.env.BOT_TOKEN) {
  logger.error('You must setup the BOT_TOKEN environment variable before running the bot');
  //  process.exit(1);
}

const bot = simtron('xoxb-320491931666-ZMpfRE6XRaB6h3dvY967siqZ', options);
bot.start();
