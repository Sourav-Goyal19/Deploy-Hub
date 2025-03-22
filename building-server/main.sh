#!/bin/sh  

export GIT_REPO_URL="$GIT_REPO_URL"
git clone "$GIT_REPO_URL" /home/app/output

export FRAMEWORK="$FRAMEWORK" 
if [ "$FRAMEWORK" = "NodeJS" ]; then
    node dist/node.js
else
    node dist/script.js
fi