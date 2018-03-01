#!/usr/bin/env node

/* eslint no-console: off */

import winston from "winston";
import chalk from "chalk";
import simtron from "./simtron";
import pkg from "../package.json";
import portPromise from "./port-mock";

if (
  ["help", "--help", "-h", "version", "--version", "-v"].includes(
    process.argv[2]
  )
) {
  console.log(`
    ${chalk.bgMagenta(`simtron v${pkg.version}`)}

    Usage:

    ${chalk.cyan("simtron")}

    Configuration through environment variables:

    ${chalk.cyan("BOT_TOKEN")}         - ${chalk.grey(
    "(Mandatory)"
  )} The Slack Bot User OAuth Access Token for your organisation/team
  `);
  process.exit(0);
}

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      timestamp() {
        return new Date().toISOString();
      }
    })
  ]
});

logger.cli();

process.env.BOT_TOKEN = "xoxb-320491931666-okTGBQpklDoBLiTrskV0GFm5";

const options = { logger };
if (!process.env.BOT_TOKEN) {
  logger.error(
    "You must setup the BOT_TOKEN environment variable before running the bot"
  );
  //  process.exit(1);
}
portPromise.then(port => {
  const bot = simtron(process.env.BOT_TOKEN, options, port);
  bot.start();
});
