#!/usr/bin/env sh
http POST $COMFY_URL/prompt @prompt.json Cookie:"connect.sid=$COMFY_COOKIE"
