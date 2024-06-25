require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connect } = require('./database'); 
const routes = require('./routes'); // Import der Routen

const app = express();
const PORT = process.env.PORT || 4000;

// CORS-Konfiguration
const corsOptions = {
  origin: 'http://localhost:3000', // URL des Frontends
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json()); // Ermöglicht das Parsen von JSON-body Requests

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routen verwenden
app.use('/api', routes); // Alle API-Routen sind jetzt unter dem Präfix /api verfügbar

// Verbindung zur Datenbank herstellen, bevor der Server startet
connect().then(db => {
  // Datenbank ist jetzt verbunden und kann verwendet werden
  app.get('/', (req, res) => res.send('Hello World!')); // Einfacher Test-Endpoint

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
