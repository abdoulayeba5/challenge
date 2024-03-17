const db = require("../config/databaseConfig");
const xlsx = require("xlsx");
// const { importDataFromExcel } = require('../services/adminService');

// Afficher la page d'accueil de l'administrateur
async function renderAdminHomePage(req, res) {
  try {
    res.set({
      "Allow-access-Allow-Origin": "*",
    });
    const imagePath = "public/logo.png";
    return res.render("home1", {
      Error: req.session.matriculeEtudiant,
      imagePath: imagePath,
    });
    // Logique pour récupérer les données nécessaires à afficher sur la page d'accueil de l'administrateur depuis la base de données
    // res.render('admin/home', { title: 'Admin Home Page', data: data }); // data est la donnée récupérée de la base de données
  } catch (error) {
    console.error(
      "Erreur lors de l'affichage de la page d'accueil de l'administrateur :",
      error
    );
    res.render("error");
  }
}

// Importer des données à partir d'un fichier Excel
async function importDataFromExcel(req, res) {
  const filePath = req.body.fileInput;

  try {
    function importFromExcel(filePath) {
      const workbook = xlsx.readFile(filePath);
      const matieresSheet = workbook.Sheets["matieres"];
      const matieresData = xlsx.utils.sheet_to_json(matieresSheet);
      return matieresData;
    }
    const filePath = req.body.fileInput;
    console.log(filePath);

    // Import data from Excel
    const importedData = importFromExcel(filePath);
    console.log(importedData); // Log imported data to verify

    // Check if importedData is not empty
    if (!importedData || importedData.length === 0) {
      return res.status(400).send("No data found in the Excel file.");
    }

    // Insert data into MongoDB
    db.collection("etudiants").insertMany(importedData, (err, result) => {
      if (err) {
        console.error("Error inserting data into database:", err);
        return res.status(500).send("Error inserting data into database.");
      }
      console.log("Data inserted successfully:", result.insertedCount);
      return res.redirect("dashboard");
    });
    // Logique pour insérer les données importées dans la base de données
  } catch (error) {
    console.error(
      "Erreur lors de l'importation des données depuis Excel :",
      error
    );
    res.render("error");
  }
}

// Afficher la page de gestion des utilisateurs
async function renderManageUsersPage(req, res) {
  try {
    // Logique pour récupérer les utilisateurs depuis la base de données
    res.render("admin/manageUsers", {
      title: "Manage Users Page",
      users: users,
    }); // users sont les utilisateurs récupérés de la base de données
  } catch (error) {
    console.error(
      "Erreur lors de l'affichage de la page de gestion des utilisateurs :",
      error
    );
    res.render("error");
  }
}

// Afficher la page de gestion des données
async function renderManageDataPage(req, res) {
  try {
    // Logique pour récupérer les données depuis la base de données
    res.render("admin/manageData", { title: "Manage Data Page", data: data }); // data est la donnée récupérée de la base de données
  } catch (error) {
    console.error(
      "Erreur lors de l'affichage de la page de gestion des données :",
      error
    );
    res.render("error");
  }
}

// Les autres fonctions du contrôleur administrateur peuvent être remplies de manière similaire

module.exports = {
  renderAdminHomePage,
  importDataFromExcel,
  renderManageUsersPage,
  renderManageDataPage,
};
