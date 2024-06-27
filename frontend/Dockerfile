# Verwendung des Node-Images 22-alpine3.19 als Basis
FROM node:22-alpine3.19

# Setzen des Arbeitsverzeichnis im Container
WORKDIR /app

# Kopieren der 'package.json'-Datei und 'package-lock.json' (falls vorhanden)
COPY package*.json ./

# Installieren der Projektabhängigkeiten
RUN npm install

# Kopieren des Projektcodes in das Arbeitsverzeichnis
COPY . .

# Bauen der Anwendung
RUN npm run build

# Installieren eines Webservers, um das Frontend auszuliefern
RUN npm install -g serve

# Start des Webservers
CMD ["serve", "-s", "build"]
