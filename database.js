const { MongoClient } = require('mongodb');

// URL aus Umgebungsvariable für Sicherheit und Flexibilität
const url = process.env.MONGO_URL || "mongodb://mongodb:27017/";

const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

async function connect() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db(process.env.MONGO_DB_NAME || "mydb");
        return db;
    } catch (e) {
        console.error("Could not connect to MongoDB", e);
        process.exit(1);
    }
}

module.exports = { connect };
