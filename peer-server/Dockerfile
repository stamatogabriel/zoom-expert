FROM node:14.5.0

WORKDIR /usr/peer

COPY package*.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

EXPOSE 9000

CMD ["yarn", "dev"]