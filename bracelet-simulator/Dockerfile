FROM node:20-alpine
WORKDIR /app

# Copie des fichiers et installation
COPY package.json ./
COPY index.js ./
RUN npm install

# lancement
CMD ["npm", "start"]
