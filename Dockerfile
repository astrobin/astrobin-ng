FROM node:23

# Set the working directory
WORKDIR /code
COPY . /code

EXPOSE 4400

CMD ["sh", "-c", "npm ci && npm run start"]
