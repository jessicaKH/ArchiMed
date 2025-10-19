FROM node:20-alpine
WORKDIR /app

# Copie des fichiers et installation
COPY package*.json ./
RUN npm install

# Copie du code
COPY . .

# Compilation TypeScript
RUN npx tsc

# Exposition et lancement
EXPOSE 5000
CMD ["node", "dist/server.js"]
