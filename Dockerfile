FROM node:20-alpine

WORKDIR /app


COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

EXPOSE 2021

CMD ["npm", "run", "start:dev"]