
const mongoose = require('mongoose');

// Configuration de la connexion à la base de données
mongoose.connect('mongodb://127.0.0.1:27017/Netcode', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', () => console.log("Error in Connecting to Database"));
db.once('open', () => console.log("Connected to Database"));

module.exports = db;
