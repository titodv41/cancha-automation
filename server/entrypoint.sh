#!/bin/sh
set -eu
# A newly mounted persistent disk can be root-owned. Only initialize its
# directory here; the HTTP service and SQLite files run as the node user.
mkdir -p /data
chown node:node /data
chmod 700 /data
exec su -s /bin/sh -c 'exec /usr/local/bin/node /app/server/submissions.mjs' node
