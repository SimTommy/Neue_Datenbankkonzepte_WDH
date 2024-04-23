// Startet einen simplen Server
// Building the environment
// docker-compose up --build

// Starting it w/o building it every time
// docker-compose up 
// http://localhost:3000

// Stopping
// docker-compose down
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
