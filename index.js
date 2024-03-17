var express = require("express")
var bodyParser = require("body-parser")
var mongoose = require("mongoose")
var path = require('path')
const app = express()
const session = require('express-session');
const Excel = require('exceljs');
const e = require("express")
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const { Console } = require("console")

app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true }));
app.use(bodyParser.json())
app.use(express.static('public'))
app.use('/img', express.static('img'));
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public/'))
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname + '/public/')));
app.use(bodyParser.urlencoded({ extended: true }))
mongoose.connect('mongodb://127.0.0.1:27017/Netcode', { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', () => console.log("Error in Connecting to Database"));
db.once('open', () => console.log("Connected to Database"))
app.use(bodyParser.urlencoded({ extended: false }));

//********************************************************function*************************************************************************** */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dah21019@gmail.com',
    pass: 'izkzmfpgsavsioul'
  }
});
function sendEmail(fromName, to, subject, text) {
  const mailOptions = {
    from: `"${fromName}" <dah21019@gmail.com>`,
    to: to,
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
    } else {
      console.log('E-mail envoyé :', info.response);
    }
  });
}

// Fonction pour envoyer un e-mail à plusieurs destinataires
function sendEmails(fromName, toList, subject, text) {
  const mailOptions = {
    from: `"${fromName}" <dah21019@gmail.com>`,
    to: toList.join(', '),
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
    } else {
      console.log('E-mail envoyé :', info.response);
    }
  });
}

// Fonction pour générer un code aléatoire
function generateRandomCode(length) {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
}

// Fonction pour envoyer un code aléatoire
async function sendRandomCode(fromName, email) {
  try {
    // Générer un code aléatoire de 6 caractères
    const randomCode = generateRandomCode(6);

    // Envoyer l'e-mail avec le code aléatoire à l'adresse e-mail spécifiée
    sendEmail(fromName, email, 'Code aléatoire', `Votre code aléatoire est : ${randomCode}`);

    // Retourner le randomCode pour le stocker dans la session
    return randomCode;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du code aléatoire :', error);
    throw error;
  }
}
function getColorClass(value) {
  switch (value) {
    case 'V':
      return 'green-bg';
    case 'CE':
      return 'yellow-bg';
    case 'CI':
      return 'green-dg';
    case 'NV':
      return 'red-bg';
    case 'NC':
      return 'red-dg';
    case 'VC':
      return 'red-db';
    default:
      return '';
  }
}



async function handleReclamation(req, res) {
  console.log("in")
  try {
    let niveauFilter = {}; // Declare niveauFilter outside the conditional statement

    if (req.body.action != undefined) {
      niveauFilter = { niveau: req.body.action };
    }
    const datta = await db.collection('date').find().toArray();

    if (datta.length >= 1) {
      const dat = datta[0].date + "T" + datta[0].time + ":00";
      const today = new Date();
      const date = new Date(dat);

      let filter;

      if (today < date) {
        if (datta[0] != undefined && datta[0].action == 'SR') {
          filter = { reclamations: { $exists: true, $not: { $elemMatch: { 'NSR': { $exists: true } } } } };
        }
        if (datta[0] != undefined && datta[0].action == 'SN') {
          filter = { reclamations: { $exists: false } };
        }

        const data = await db.collection('pv').find({ ...niveauFilter, ...filter, date: datta[0].date, matricule: parseInt(req.params.id) }).toArray();
        console.log("DSFSFSDFSDFDFSDF", data.length)
        if (data.length == 1) {
          console.log(data);
          let result = [];
          data.forEach(entry => {
            const matiereData = entry.matieres;
            matiereData.forEach(matiere => {
              let code = matiere.codeMatiere;
              let obj = {
                code: code,
                NCC: matiere.NCC,
                NSR: matiere.NSR,
                NSN: matiere.NSN,
              };
              result.push(obj);
            });
          });
          const niveau = [data[0].niveau, data[0].semestre]
          const action = datta[0].action;
          console.log(niveau)
          var types = (action === 'SN') ? ['NSN', 'NCC'] : (action === 'SR') ? ['NSR'] : [];
          const mat = req.params.id;
          const dd = datta[0].date + " " + datta[0].time + ":00";
          return res.render('env_reclamation1', { users: result, nivea: niveau, matricule: mat, reclamation: "open", dd, formCount: datta[0].formCount, types: types });
        }
        else if (data.length == 2) {
          const niveauArray = data.map(doc => doc.niveau);
          console.log(niveauArray)
          return res.render('env_reclamation1', { matricule: req.params.id, reclamation: "2", niveauArra: niveauArray });
        } else {
          const mat = req.params.id;
          return res.render('env_reclamation1', { matricule: req.params.id, reclamation: "deja" });
        }
      } else {
        const mat = req.params.id;
        return res.render('env_reclamation1', { matricule: mat, reclamation: "termine", formCount: 0 });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
}



module.exports = { sendRandomCode };
module.exports = router;

//*****************************************************log in and sing up******************************************************************
app.get("/", (req, res) => {

  const imagePath = "public/logo.png";
  db.collection('pv').find({}).toArray(function (err, donnees) {
    if (err) {
      console.error('Erreur lors de la récupération des données :', err);
    }

    else {
      return res.render('login', { Error: "a", imagePath: imagePath, donnees });
    }
  })

}).listen(3002);
app.get("/log", (req, res) => {
  res.set({
    "Allow-access-Allow-Origin": '*'
  })
  return res.render('login', { Error: " " });
})
app.post('/registre', async (req, res) => {
  const nom = req.body.nom;
  const email = req.body.email;
  const mat = email.slice(0, 5);
  const password = req.body.password;
  const cpassword = req.body.cpassword;
  const niveau = req.body.niveau; // Retrieve selected niveau
  const specialite = req.body.specialite;

  console.log("Nom:", nom);
  console.log("Email:", email);
  console.log("Matricule:", mat);
  console.log("Password:", password);
  console.log("Confirm Password:", cpassword);
  console.log("Niveau:", niveau);
  console.log("Specialite:", specialite);

  if (password === cpassword) {
      console.log("Passwords match.");

      try {
          // Check if the email already exists in the "users" collection
          const existingUser = await db.collection('users').findOne({ "email": email });
          if (existingUser) {
              console.log("Existing user found.");
              return res.render('login', { Error: "L'adresse email est déjà utilisée. Veuillez choisir une autre adresse email." });
          }

          // Verify the email and matricule in the appropriate collections
          const etudiant = await db.collection('etudiants').findOne({ "matricule": parseInt(mat), "specialite": specialite, "niveau": niveau });
          console.log(etudiant)
          if (email.slice(-9) !== "supnum.mr" || !etudiant) {
              console.log("Invalid email or matricule.");
              return res.render('login', { Error: "Cet e-mail ou matricule n'est pas valide." });
          }

          // Hash the password with bcrypt
          const hashedPassword = await bcrypt.hash(password, 10);

          // Generate and send a random code by email
          const randomCode = await sendRandomCode("Gestion de reclamation", email);

          // Store session data
          req.session.nom = nom;
          req.session.mat = mat;
          req.session.email = email;
          req.session.password = hashedPassword;
          req.session.randomCode = randomCode;

          // Render the page with a form to enter the code
          return res.render('enter_code', { email, Suc: "Un code aléatoire a été envoyé à votre adresse e-mail. Veuillez le saisir pour vérification." });
      } catch (error) {
          console.error('Erreur lors de l\'inscription :', error);
          return res.render('login', { Error: "Une erreur s'est produite lors de l'inscription." });
      }
  } else {
      console.log("Passwords do not match.");
      return res.render('login', { Error: "Les mots de passe ne sont pas identiques." });
  }
});


// Route pour vérifier le code aléatoire et insérer l'utilisateur
app.post('/verify_code_registre', async (req, res) => {
  const enteredCode = req.body.enteredCode;
  const storedCode = req.session.randomCode;
  const email = req.session.email;

  if (enteredCode === storedCode) {
    try {
      // Insérer l'utilisateur dans la collection 'users'
      const user = {
        "name": req.session.nom,
        "matricul": req.session.mat,
        "email": email,
        "password": req.session.password,
        "types": req.session.types
      };

      await db.collection('users').insertOne(user);

      // Effacer les données de session après l'insertion réussie
      delete req.session.nom;
      delete req.session.mat;
      delete req.session.email;
      delete req.session.password;
      delete req.session.types;
      delete req.session.randomCode;

      return res.render('login', { Success: "Votre enregistrement a été effectué avec succès" });
    } catch (error) {
      console.error('Erreur lors de l\'insertion de l\'utilisateur :', error);
      return res.render('enter_code', { email, Error: "Une erreur s'est produite lors de l'insertion de l'utilisateur." });
    }
  } else {
    return res.render('enter_code', { email, Error: "Le code entré est incorrect. Veuillez réessayer." });
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
console.log(password)
  // Rechercher l'utilisateur dans la base de données par son adresse e-mail
  db.collection('users').findOne({ "email": email }, (err, user) => {
    if (err) {
      console.error("Erreur lors de la recherche de l'utilisateur :", err);
      return res.render('login', { Error: "Une erreur s'est produite lors de la tentative de connexion." });
    }

    if (user) {
      console.log("ddfhds")
      // Comparer le mot de passe saisi avec le mot de passe haché stocké dans la base de données
      bcrypt.compare(password, user.password, (err, passwordMatch) => {
        if (err) {
          console.error("Erreur lors de la comparaison des mots de passe :", err);
          return res.render('login', { Error: "Une erreur s'est produite lors de la tentative de connexion." });
        }

        if (passwordMatch) {
          req.session.matriculeEtudiant = user.types;
          req.session.matricule = user.email.slice(0, 5);
          req.session.email = user.email;
          console.log("ghjiko", req.session.email);

          if (user.types == "admin" || user.types == "prof") {
            return res.redirect('/home1');
          } else {
            return res.redirect(`/home1?mat=${user.email.slice(0, 5)}`);
            //  return res.render("equipe")
          }
        } else {
          // Mot de passe incorrect
          return res.render('login', { Eror: "Adresse e-mail ou mot de passe incorrect." });
        }
      });
    } else {
      // Utilisateur non trouvé
      return res.render('login', { Eror: "Adresse e-mail ou mot de passe incorrect." });
    }
  });
});
app.get('/forgot-password', (req, res) => {
  res.render('forgot-password'); // Assurez-vous d'avoir un fichier de modèle correspondant
});
app.post('/forgot-password', async (req, res) => {
  const email = req.body.email;

  // Vérifier si l'email existe dans la collection users
  const user = await db.collection("users").findOne({ email });

  if (!user) {
    // L'email n'existe pas dans la collection users
    console.log("L'email n'existe pas dans la collection users");
    res.render('forgot-password', { eror: 'Email non trouvé' });
    return;
  }

  // L'email existe dans la collection users, continuez avec l'envoi du code aléatoire
  const randomCode = await sendRandomCode("Gestion de reclamation ",email);

  // Stockez l'email et le randomCode dans la session
  req.session.email = email;
  req.session.randomCode = randomCode;

  console.log('randomCode stocké dans la session :', randomCode);
  console.log(req.session.email);

  // Redirigez vers le formulaire de vérification du code
  res.redirect('/verify-code');
});
app.get('/verify-code', (req, res) => {
  res.render('verify-code'); // Assurez-vous d'avoir un fichier de modèle correspondant
});
app.post('/verify-code', (req, res) => {
  const { code, email } = req.body;
  const randomCode = req.session.randomCode;

  console.log('Code entré :', code);
  console.log('randomCode stocké :', randomCode);

  // Vérifiez si le code est valide
  if (code === randomCode) {
    console.log('Le code est valide. Redirection vers /reset-password');
    // Redirigez vers le formulaire de réinitialisation du mot de passe en transmettant l'email
    res.render('reset-password', { email });
  } else {
    // Le code est invalide, affichez un message d'erreur par exemple
    console.log('Le code est invalide. Rendu de verify-code avec une erreur');
    res.render('verify-code', { eror: 'Code invalide' });
  }
});
app.get('/reset-password', (req, res) => {
  res.render('reset-password'); // Assurez-vous d'avoir un fichier de modèle correspondant
});
app.post('/reset-password', (req, res) => {
  const { newPassword } = req.body;

  // Sélectionner l'e-mail de l'utilisateur à partir de la session
  const email = req.session.email;

  console.log("L'e-mail est : ", email);

  // Hasher le nouveau mot de passe
  bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Erreur lors du hachage du mot de passe :', err);
      res.status(500).send('Une erreur s\'est produite lors de la réinitialisation du mot de passe');
      return;
    }

    // Paramètres de mise à jour
    const query = { email };
    const update = { $set: { password: hashedPassword } };

    // Effectuer la mise à jour
    db.collection("users").updateOne(query, update, (error, result) => {
      if (error) {
        console.error('Utilisateur non trouvé :', error);
        res.status(500).send('Utilisateur non trouvé');
        return;
      }

      if (result.modifiedCount === 0) {
        console.log('Aucun document mis à jour. Utilisateur non trouvé.');
        res.status(404).send('Erreur lors de la mise à jour du mot de passe');
      } else {
        console.log('Mot de passe mis à jour avec succès.');
        return res.render('login', { Success: "Mot de passe mis à jour avec succès" });
      }
    });
  });
});
app.get('/logout', (req, res) => {
  req.session.matriculeEtudiant = "";
  req.session.matricule = "";
  req.session.email = "";
  res.redirect('/log')
});

//**************************************************************student*********************************************************************
app.get('/equipe', (req, res) => {
  // Fetch all documents from the 'etudiants' collection
  db.collection('etudiants').find({}).toArray((err, students) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // Fetch all documents from the 'equipe' collection
    db.collection('equipe').find({}).toArray((err, equipes) => {
      if (err) {
        console.error('Error fetching equipe:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      // Get all member matricules from equipes
      const equipeMatricules = equipes.reduce((acc, equipe) => {
        return acc.concat(equipe.members);
      }, []);
      
      // Get lead and adjoint matricules
      const leadMatricule = equipes.map(equipe => equipe.lead);
      const adjointMatricule = equipes.map(equipe => equipe.adjoint);
      
      // Filter students by those not in equipeMatricules and not equal to leadMatricule or adjointMatricule
      const filteredStudents = students.filter(student => {
        return !equipeMatricules.includes(student.matricule.toString()) && 
               !leadMatricule.includes(student.matricule.toString()) && 
               !adjointMatricule.includes(student.matricule.toString());
      });
      
      // Map the filtered documents to include only 'matricule'
      const studentArray = filteredStudents.map(student => ({
        matricule: student.matricule
      }));
      req.session.array=studentArray
      return res.render("equipe", { array: studentArray ,error:" "});
    });
  });
});

app.get('/equipe_insert', async (req, res) => {
    // Extract data from the query parameters
    const { name, lead, adjoint, nombreMembres, ...members } = req.query;

    // Construct the document to be inserted
    const equipeDoc = {
      name: name,
      lead: lead,
      adjoint: adjoint,
      nombreMembres: parseInt(nombreMembres), // Ensure nombreMembres is converted to a number
      members: Object.values(members) // Convert members object to an array of member matricules
    };
console.log(equipeDoc)
// Convertir les membres, lead et adjoint en un ensemble pour détecter les doublons
const allValuesSet = new Set([...equipeDoc.members, equipeDoc.lead, equipeDoc.adjoint]);

// Vérifier s'il y a des doublons en comparant la taille de l'ensemble avec le nombre total de valeurs
const totalValues = equipeDoc.members.length + 2; // 2 pour lead et adjoint
const hasDuplicates = allValuesSet.size !== totalValues;

if (hasDuplicates) {
  console.log("Il y a des valeurs dupliquées dans l'équipe (membres, lead ou adjoint).");
  return res.render("equipe",{error:"Il y a des valeurs dupliquées dans l'équipe (membres, lead ou adjoint).",array:req.session.array})
} else {
  console.log("Aucune valeur dupliquée trouvée dans l'équipe.");
}
// Récupérer les niveaux du lead et de l'adjoint depuis la collection "etudiants"
const leadEtudiant = await db.collection('etudiants').findOne({ "matricule": parseInt(equipeDoc.lead) });
const adjointEtudiant = await db.collection('etudiants').findOne({ "matricule": parseInt(equipeDoc.adjoint) });

// Vérifier si les documents du lead et de l'adjoint existent et obtenir leurs niveaux
const leadNiveau = leadEtudiant ? leadEtudiant.niveau : null;
const adjointNiveau = adjointEtudiant ? adjointEtudiant.niveau : null;

console.log("Lead niveau:", leadNiveau);
console.log("Adjoint niveau:", adjointNiveau);

// Récupérer les niveaux des membres depuis la collection "etudiants"
const membresNiveaux = await Promise.all(equipeDoc.members.map(async (matricule) => {
    const etudiant = await db.collection('etudiants').findOne({ "matricule":parseInt(matricule) });
    const etudiantNiveau = etudiant ? etudiant.niveau : null;
    console.log("Niveau de l'étudiant avec matricule", matricule, ":", etudiantNiveau);
    return etudiantNiveau;
}));

console.log("Niveaux des membres:", membresNiveaux);

// Vérifier si le lead et l'adjoint ont des niveaux différents
if (leadNiveau && adjointNiveau) {
    const leadAdjointNiveauxDifferents = leadNiveau !== adjointNiveau;

    // Compter le nombre de membres de niveau L2
    const nombreMembresL2 = membresNiveaux.filter(niveau => niveau === "L2").length;
    console.log("Nombre de membres de niveau L2:", nombreMembresL2);

    // Vérifier si le lead et l'adjoint ont des niveaux différents et s'il y a trois membres de niveau L2
    if (leadAdjointNiveauxDifferents && nombreMembresL2 === 3) {
        console.log("Le lead et l'adjoint ont des niveaux différents, et il y a trois membres de niveau L2.");
        db.collection('equipe').insertOne(equipeDoc);
        return res.render("equipe",{error:"Equipe inserted successfully",array:req.session.array})
    } else {
        console.log("Les conditions requises ne sont pas remplies.");
      return res.render("equipe",{error:"Les conditions requises ne sont pas remplies.",array:req.session.array})

    }
} 
});
app.get("/open_upload", (req, res) => {
  res.set({
    "Allow-access-Allow-Origin": '*'
  })
  return res.render('drop_p', { Error: " " });
})

app.post("/upload", (req, res) => {
  
  return res.render('drop_p', { Error: " " });
})


//******************************************************admin*******************************************************************************

app.post("/import", (req, res) => {
  function importDataFromExcel(filePath) {
    const workbook = xlsx.readFile(filePath);
    const matieresSheet = workbook.Sheets['matieres'];
    const matieresData = xlsx.utils.sheet_to_json(matieresSheet);
    return matieresData;
  }

  const filePath = req.body.fileInput;
  console.log(filePath);

  // Import data from Excel
  const importedData = importDataFromExcel(filePath);
  console.log(importedData); // Log imported data to verify

  // Check if importedData is not empty
  if (!importedData || importedData.length === 0) {
    return res.status(400).send('No data found in the Excel file.');
  }

  // Insert data into MongoDB
  db.collection('etudiants').insertMany(importedData, (err, result) => {
    if (err) {
      console.error('Error inserting data into database:', err);
      return res.status(500).send('Error inserting data into database.');
    }
    console.log('Data inserted successfully:', result.insertedCount);
    return res.redirect('/home1');
  });
});
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
  // if (req.session.matriculeEtudiant !== "admin") {
  //   return res.render('404');
  // }
  const date = req.query.date;
  const time = req.query.time;
 

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
                db.collection('etudiants').find({}, { "matricule": 1, "_id": 0 }).toArray(function(err, result) {
                  if (err) throw err;
              
                  // Maintenant, result contient la liste des matricules
                  let emails = [];
              
                  result.forEach(function(etudiant) {
                      let matricule = etudiant.matricule;
                      let email = matricule + "@supnum.mr";
                      emails.push(email);
                  });
                sendEmail("netcode", emails, 'Reclamation Date ', 'La réclamation est ouverte. Pour traiter les notes, veuillez visiter notre site.');
                return res.redirect('/eleve');
            });});
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
                db.collection('etudiants').find({}, { "matricule": 1, "_id": 0 }).toArray(function(err, result) {
                  if (err) throw err;
              
                  // Maintenant, result contient la liste des matricules
                  let emails = [];
              
                  result.forEach(function(etudiant) {
                      let matricule = etudiant.matricule;
                      let email = matricule + "@supnum.mr";
                      emails.push(email);
                  });
                sendEmail("Gestion de réclamation", emails, 'Reclamation Date', 'La date de réclamation a été modifiée. Pour plus d\'informations, visitez notre site.');
                return res.redirect('/eleve');
            });});
        }
    });
});


//************************************************************prof************************************************************************** */

//*************************************************************prof and admin and sutend***************************************************************/
app.get("/home1", (req, res) => {
  res.set({
    "Allow-access-Allow-Origin": '*'
  })
  const imagePath = "public/logo.png";
  return res.render('home1', { Error: req.session.matriculeEtudiant, imagePath: imagePath });
});

//*************************************************************prof and admin ***************************************************************/
