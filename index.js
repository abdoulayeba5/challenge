// app.js
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const app = express();
const routes = require("./routes/authRoutes");
const db = require("./config/databaseConfig");

app.use(
  session({ secret: "your-secret-key", resave: false, saveUninitialized: true })
);
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/img", express.static("img"));
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public/"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname + "/public/")));
app.use(bodyParser.urlencoded({ extended: true }));

// Monter les routes
app.use("/", routes);

const adminRoutes = require("./routes/adminRoutes");

// Utiliser les routes administratives
app.use("/admin", adminRoutes);

// Démarrer le serveur
const PORT = process.env.PORT || 3002;
app.listen(PORT, () =>
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`)
);
