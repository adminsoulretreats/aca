FROM node:18.18.0

WORKDIR '/api'

COPY package.json package-lock.json ./

RUN npm install

# Install forever globally
RUN npm install -g forever
COPY ./ ./

EXPOSE 5000

CMD ["forever", "run", "index.js"]
