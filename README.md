# simtron

## Installation

As simple as installing any other global node package. Be sure to have npm and node (`>= 4.3.2` version) installed and launch:

```bash
$ npm install simtron
```

## Running the Simtron

To run the Simtron you must have a valid Slack [BOT token](#getting-the-bot-token-for-your-slack-channel) to authenticate the bot on your slack organization. Once you get it (instructions on the next paragraph) you just have to run:


```bash
BOT_TOKEN=somesecretkey
```

Once the bot is up and running, you need to invite him into the channels you want it to be available in.


## Getting the BOT token for your Slack channel

To allow the Simtron to connect your Slack channel you must provide him a BOT token. To retrieve it you need to add a new Bot in your Slack organization by visiting the following url: https://*yourorganization*.slack.com/services/new/bot, where *yourorganization* must be substituted with the name of your organization (e.g. https://**loige**.slack.com/services/new/bot). Ensure you are logged to your Slack organization in your browser and you have the admin rights to add a new bot.

You will find your BOT token under the field `API Token`, copy it in a safe place and get ready to use it.

As an alternative you can create a bot by creating a custom application in the [Slack developer portal](https://api.slack.com/apps). Inside the application settings you will be able to add a bot user and retrieve a OAUTH BOT token for it.

#Attributions
Fundamentals based on #norrisbot [https://github.com/lmammino/norrisbot] Copyright (c) 2015 Luciano Mammino

## License

Licensed under [MIT License](LICENSE).
