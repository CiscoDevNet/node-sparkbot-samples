# Start from argon (latest long term supported version of node)
# - argon : Full node dev env (640 MB) : python inside
# - argon-slim : Light node env (200 MB) : no python, can be an issue for npm installs / builds
FROM node:argon-slim

MAINTAINER Stève Sfartz

EXPOSE 8080

# create 'not priviledged' user
RUN useradd -c 'Node.js user' -m -d /home/node -s /bin/bash node

# isolate code distribution
RUN mkdir -p /home/node/sparkbot
WORKDIR /home/node/sparkbot

# build application 
# [TIP] minimize image rebuilds needs by isolating dependencies from declarative aspects  
COPY package.json /home/node/sparkbot/package.json
RUN npm install

# check the .dockerignore file 
COPY . /home/node/sparkbot

# Switch to user mode
RUN chown -R node:node /home/node/sparkbot
USER node
ENV HOME /home/node
ENV SCRIPT templates/onEvent-all-all.js

# Run default sample
CMD /usr/local/bin/node $SCRIPT

