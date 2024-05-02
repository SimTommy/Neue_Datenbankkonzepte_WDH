# Verwenden Sie ein offizielles Node-Image als Basis
FROM node:21.7.3-alpine3.18

# Setzen Sie das Arbeitsverzeichnis im Container
WORKDIR /app

# Kopieren Sie die 'package.json'-Datei und 'package-lock.json' (falls vorhanden)
COPY package*.json ./

# Installieren Sie die Projektabhängigkeiten
RUN npm install

# Kopieren Sie den Projektcode in das Arbeitsverzeichnis
COPY . .

# Bauen Sie die Anwendung
RUN npm run build

# Installieren Sie einen Webserver, um das Frontend auszuliefern
RUN npm install -g serve

# Starten Sie den Webserver
CMD ["serve", "-s", "build"]

