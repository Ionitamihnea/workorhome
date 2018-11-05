FROM node:10-slim
WORKDIR /workorhome
COPY package.json /workorhome
RUN npm install
COPY . /workorhome
CMD ["npm", "start"]