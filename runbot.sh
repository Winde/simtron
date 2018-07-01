#!/usr/bin/env bash

# Credentials doc here: https://docs.google.com/document/d/1eNrNwXu70mzltr2OaIhDG8Ef4qmwd_Gq-PLgJB7h_EI/edit
# Please, use the token provided on this document, replacing the placeholder on next line

if [ $# -eq 0 ]
  then
    echo "Error: you should specify the bot token";
    exit;
fi

export BOT_TOKEN=$1;

sudo -E ./build.sh
sudo -E node lib/simtron-cli.js

