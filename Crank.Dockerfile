FROM node:16
WORKDIR /
COPY package*.json ./
RUN npm install --ignore-scripts
COPY . .
CMD [ "npm", "run", "crank:watch" ]