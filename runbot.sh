#!/usr/bin/env bash

# Credentials doc here: https://docs.google.com/document/d/1eNrNwXu70mzltr2OaIhDG8Ef4qmwd_Gq-PLgJB7h_EI/edit
# Please, use the token provided on this document, replacing the placeholder on next line

export BOT_TOKEN="_TOKEN_HERE_";

sudo -E ./build.sh
sudo -E node lib/simtron-cli.js

