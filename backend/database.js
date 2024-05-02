const mongoose = require('mongoose');

async function connect() {
    try {
        // Verwenden der MONGO_URL aus den Umgebungsvariablen oder Standardwert
        const url = process.env.MONGO_URL || "mongodb://mongodb:27017/mydb";
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        };

        // Verbindung zu MongoDB herstellen
        await mongoose.connect(url, options);
        console.log("Connected to MongoDB at:", url);
    } catch (e) {
        console.error("Could not connect to MongoDB", e);
        process.exit(1);
    }
}

module.exports = { connect };
