require('dotenv').config();
// Startet einen simplen Server
// Building the environment
// docker-compose up --build

// Starting it w/o building it every time
// docker-compose up 
// http://localhost:3000

// Stopping
// docker-compose down
// server.js
const express = require('express');
const cors = require('cors');
const { connect } = require('./database'); // Pfad zur database.js-Datei

const app = express();
const PORT = process.env.PORT || 4000;

const corsOptions = {
  origin: 'http://localhost:3000', // Passen Sie dies an die URL Ihres Frontends an
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); // CORS für alle Routen verwenden
app.use(express.json()); // Ermöglicht das Parsen von JSON-body Requests

// Verbindung zur Datenbank herstellen, bevor der Server startet
connect().then(db => {
  // Datenbank ist jetzt verbunden und kann verwendet werden
  app.get('/', (req, res) => res.send('Hello World!'));

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
