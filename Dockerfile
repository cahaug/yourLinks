FROM node:10
WORKDIR /cahaug/lambda git/yourLinks/
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ["npm","start"]