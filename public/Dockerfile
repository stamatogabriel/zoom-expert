FROM node:14.5.0

WORKDIR /usr/server

COPY package*.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

EXPOSE 8080

CMD ["yarn", "start"]