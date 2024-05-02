# Verwenden des offiziellen Node.js 22-Images
FROM node:21.7.3-alpine3.18

# Setzen des Arbeitsverzeichnisses im Container
WORKDIR /app

# Kopieren der 'package.json'-Datei und 'package-lock.json' (falls vorhanden)
COPY package*.json ./

# Installieren der Projektabhängigkeiten
RUN npm install

# Kopieren des Projektcodes in das Arbeitsverzeichnis
COPY . .

# Starten der Anwendung
CMD ["npm", "start"]
