FROM node:carbon

WORKDIR /app

COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .