
ARG NODE_VERSION=22.14.0

FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app

# Copy the rest of the source files into the image.

COPY package*.json /usr/src/app
RUN npm install


COPY . .



# Expose the port that the application listens on.
EXPOSE 5173

# Run the application.
CMD npm run dev
