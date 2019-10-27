FROM node:12-alpine
WORKDIR /usr/src/app
RUN mkdir tmp
COPY . ./tmp
RUN cd tmp && yarn && yarn build-app && yarn build
RUN mv ./tmp/build/* .
RUN mv ./tmp/node_modules node_modules
RUN rm -rf tmp
RUN mkdir data
ENV NODE_ENV=production
CMD ["node", "index.js"]
