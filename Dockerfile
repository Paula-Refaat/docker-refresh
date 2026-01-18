FROM node:latest

WORKDIR /app

COPY package.json .  

ARG NODE_ENV
RUN if ["$NODE_ENV" = "production"]; \
    then npm install --only=production; \
    else npm install; \
    fi

RUN npm install

COPY . .

EXPOSE 4000

CMD [ "npm", "run", "start:dev" ]