FROM node:alpine
FROM node:10
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
COPY . .
RUN yarn
RUN yarn build-app
RUN yarn build
WORKDIR /usr/src/app/build
ENV NODE_ENV=production
CMD ["node", "index.js"]
