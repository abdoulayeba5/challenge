const db = require("../config/databaseConfig");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");

const xlsx = require("xlsx");
// const { importDataFromExcel } = require('../services/adminService');

// Afficher la page d'accueil de l'administrateur
async function renderAdminHomePage(req, res) {
  try {
    res.set({
      "Allow-access-Allow-Origin": "*",
    });
    const imagePath = "public/logo.png";
    return res.render("welcome", {
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

// Ajouter les membre de jury
async function newJuryMember(req, res) {
  const { nom, prenom, email, password, cpassword } = req.body;

  try {
    const existingUser = await db.collection("users").findOne({ email: email });

    if (existingUser) {
      return res.render("login", {
        Error:
          "L'adresse email est déjà utilisée. Veuillez choisir une autre adresse email.",
      });
    }
    if (password !== cpassword) {
      return res.render("login", {
        Error: "Les mots de passe ne sont pas identiques.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      fname: nom,
      lname: prenom,
      email: email,
      password: hashedPassword,
      challengeAssigne: [],
      types: "jury",
    };
    await db.collection("users").insertOne(user);

    res.redirect("add_jury");
  } catch (error) {
    console.error(
      "Erreur lors de l'affichage de la page de gestion des données :",
      error
    );
    res.render("error");
  }
}

// Ajouter les membre de jury
async function grille(req, res) {
  idChallenge = "65f73b2420c956110f927bfc";

  try {
    const existingGrille = await db
      .collection("grille")
      .findOne({ idChallenge: new ObjectId(idChallenge) });
    console.log(existingGrille.section);

    res.render("addCritere", { data: existingGrille.section });
  } catch (error) {
    console.error("Erreur lors de l'ajout du critère :", error);
    res.render("error");
  }
}

// Ajouter les membre de jury
async function grilleEvaluation(req, res) {
  const { nom, prenom, email, password, cpassword } = req.body;

  try {
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.render("login", {
        Error:
          "L'adresse email est déjà utilisée. Veuillez choisir une autre adresse email.",
      });
    }
    if (password !== cpassword) {
      return res.render("login", {
        Error: "Les mots de passe ne sont pas identiques.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      fname: nom,
      lname: prenom,
      email: email,
      password: hashedPassword,
      types: "jury",
    };
    await db.collection("users").insertOne(user);

    res.redirect("/ajout_jury");
  } catch (error) {
    console.error(
      "Erreur lors de l'affichage de la page de gestion des données :",
      error
    );
    res.render("error");
  }
}

// Ajouter les membre de jury
async function addjuryMember(req, res) {
  res.render("form_jury");
}

// Ajouter une critere
async function addCriter(req, res) {
  const { critere, coef, idChallenge } = req.body;

  try {
    const newSection = { critere: critere, coef: coef };

    // Recherche du document de grille correspondant au défi
    const existingGrille = await db
      .collection("grille")
      .findOne({ idChallenge: new ObjectId(idChallenge) });
    console.log(existingGrille);
    // Si la grille existe, nous ajoutons la nouvelle section
    if (existingGrille) {
      existingGrille.section.push(newSection);
      await db
        .collection("grille")
        .updateOne(
          { _id: existingGrille._id },
          { $set: { section: existingGrille.section } }
        );
    } else {
      // Si la grille n'existe pas, nous créons un nouveau document de grille avec la nouvelle section
      const grille = {
        idChallenge: new ObjectId(idChallenge),
        section: [newSection],
      };
      await db.collection("grille").insertOne(grille);
    }

    res.redirect("grille");
  } catch (error) {
    console.error("Erreur lors de l'ajout du critère :", error);
    res.render("error");
  }
}

// Les autres fonctions du contrôleur administrateur peuvent être remplies de manière similaire


app.get("/date_prof_update", (req, res) => {
  if (req.session.matriculeEtudiant !== "admin") {
    return res.render('404');
  }
  db.collection('date_prof').find().toArray((err, datta) => {
    years = datta[0].date;
    times = datta[0].time;
    return res.render('open_&&_date_prof', { date: "close", years, times });

  })

});
app.get("/date_prof", (req, res) => {
  if (req.session.matriculeEtudiant !== "admin") {
    return res.render('404');
  }
  db.collection('date_prof').find().toArray((err, datta) => {
    if (datta.length >= 1) {
      const dat = datta[0].date + "T" + datta[0].time + ":00";
      const today = new Date();
      const date = new Date(dat);
      if (today < date) {
        const dd = datta[0].date + " " + datta[0].time + ":00";
        years = datta[0].date;
        times = datta[0].time;
        return res.render('open_&&_date_prof', { date: "open", dd, years, times });
      } else {
        console.log("termine");
        return res.render('open_&&_date_prof', { date: "termine", years: "", times: "" });
      }
    } else { return res.render('open_&&_date_prof', { date: "close", years: "", times: "" }); }
  });
});
app.get('/date_open_prof', (req, res) => {
  if (req.session.matriculeEtudiant !== "admin") {
    return res.render('404');
  }
  const date = req.query.date;
  const time = req.query.time;

  // Récupérer tous les emails des enseignants dans la collection 'enseignant'
  db.collection('enseignant').find({}, { projection: { autresprof: 1, email: 1 } }).toArray((err, enseignants) => {
    if (err) {
        console.error("Erreur lors de la récupération des enseignants :", err);
        return res.render('error');
    }

    // Liste de tous les emails des enseignants
    const emails = [];

    // Récupérer tous les emails de la liste autresprof de chaque enseignant
    enseignants.forEach(enseignant => {
        if (enseignant.autresprof && enseignant.autresprof.length > 0) {
            enseignant.autresprof.forEach(prof => {
                if (prof.email_autre) {
                    emails.push(prof.email_autre);
                }
            });
        }
        
        // Ajouter l'email principal de l'enseignant s'il existe
        if (enseignant.email) {
            emails.push(enseignant.email);
        }
    });

    // Insérer ou mettre à jour la date dans la base de données
    db.collection('date_prof').find().toArray((err, data) => {
        if (data.length === 0) {
            const newData = {
                "date": date,
                "time": time,
                "reclamation": "open"
            };

            db.collection('date_prof').insertOne(newData, (err, collection) => {
                if (err) {
                    console.error("Erreur lors de l'insertion de la date :", err);
                    return res.render('error');
                }
                console.log("Les emails ont été envoyés :", emails);
                sendEmail("Gestion de réclamation", emails, 'Reclamation Date ', 'La réclamation est ouverte. Pour traiter les notes, veuillez visiter notre site.');
                return res.redirect('/eleve');
            });
        } else {
            const updateData = {
                $set: {
                    "date": date,
                    "time": time,
                    "reclamation": "open"
                }
            };

            db.collection('date_prof').updateMany({ reclamation: "open" }, updateData, function (err, data) {
                if (err) {
                    console.error("Erreur lors de la mise à jour de la date :", err);
                    return res.render('error');
                }
                console.log("Les emails ont été envoyés :", emails);
                sendEmail("Gestion de réclamation", emails, 'Reclamation Date', 'La date de réclamation a été modifiée. Pour plus d\'informations, visitez notre site.');
                return res.redirect('/eleve');
            });
        }
    });
});


});
module.exports = {
  renderAdminHomePage,
  importDataFromExcel,
  renderManageUsersPage,
  renderManageDataPage,
  addjuryMember,
  newJuryMember,
  grille,
  addCriter,
};
