
ARG NODE_VERSION=22.14.0

FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app


COPY package*.json /usr/src/app

RUN npm install 

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 9000

# Run the application.
CMD npm run dev
