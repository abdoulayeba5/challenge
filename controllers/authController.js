const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { sendRandomCode } = require("../services/emailService");

const db = require("../config/databaseConfig");
// const User = require("../models/User");

const User = db.collection("users");

async function renderLoginPage(req, res) {
  res.render("login", { Error: "" });
}

async function logoutUser(req, res) {
  req.session.destroy();
  res.redirect("/");
}

async function loginUser(req, res) {
  const { email, password } = req.body;
  console.log(User);

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.render("login", {
        Error: "Adresse e-mail ou mot de passe incorrect.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.render("login", {
        Error: "Adresse e-mail ou mot de passe incorrect.",
      });
    }

    req.session.user = user;

    if(user.types == "admin"){
      res.redirect("/admin/dashboard");
    }else{
      if(user.types == "student"){
        res.redirect("/student/dashboard");
      }else{
        res.redirect("/jury/dashboard");
      }
    }
// Redirige vers la page de tableau de bord après connexion réussie
  } catch (error) {
    console.error("Erreur lors de la tentative de connexion :", error);
    res.render("login", {
      Error: "Une erreur s'est produite lors de la tentative de connexion.",
    });
  }
}

async function registerUser(req, res) {
  const { nom, email, password, cpassword, niveau, specialite } = req.body;
  const mat = email.slice(0, 5);
  console.log("here", mat);

  try {
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.render("login", {
        Error:
          "L'adresse email est déjà utilisée. Veuillez choisir une autre adresse email.",
      });
    }
    const etudiant = await db.collection("etudiants").findOne({
      matricule: parseInt(mat),
      specialite: specialite,
      niveau: niveau,
    });
    console.log(etudiant);
    if (email.slice(-9) !== "supnum.mr" || !etudiant) {
      console.log("Invalid email or matricule.");
      return res.render("login", {
        Error: "Cet e-mail ou matricule n'est pas valide.",
      });
    }

    if (password !== cpassword) {
      return res.render("login", {
        Error: "Les mots de passe ne sont pas identiques.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const randomCode = await sendRandomCode("Gestion de reclamation", email);

    // Store session data
    req.session.nom = nom;
    req.session.mat = mat;
    req.session.email = email;
    req.session.password = hashedPassword;
    req.session.randomCode = randomCode;

    // Render the page with a form to enter the code
    return res.render("enter_code", {
      email,
      Suc: "Un code aléatoire a été envoyé à votre adresse e-mail. Veuillez le saisir pour vérification.",
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'utilisateur :", error);
    res.render("login", {
      Error: "Une erreur s'est produite lors de l'inscription.",
    });
  }
}

// Les autres fonctions du contrôleur authentification (oubli de mot de passe, réinitialisation de mot de passe) peuvent être remplies de manière similaire

async function verifyRegistre(req, res) {
  const enteredCode = req.body.enteredCode;
  const storedCode = req.session.randomCode;
  const email = req.session.email;

  if (enteredCode === storedCode) {
    try {
      // Insérer l'utilisateur dans la collection 'users'
      const user = {
        name: req.session.nom,
        matricul: req.session.mat,
        email: email,
        password: req.session.password,
        types: req.session.types,
      };

      await db.collection("users").insertOne(user);

      // Effacer les données de session après l'insertion réussie
      delete req.session.nom;
      delete req.session.mat;
      delete req.session.email;
      delete req.session.password;
      delete req.session.types;
      delete req.session.randomCode;

      return res.render("login", {
        Success: "Votre enregistrement a été effectué avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de l'insertion de l'utilisateur :", error);
      return res.render("enter_code", {
        email,
        Error:
          "Une erreur s'est produite lors de l'insertion de l'utilisateur.",
      });
    }
  } else {
    return res.render("enter_code", {
      email,
      Error: "Le code entré est incorrect. Veuillez réessayer.",
    });
  }
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dah21019@gmail.com",
    pass: "izkzmfpgsavsioul",
  },
});

// Fonction pour générer un code aléatoire
function generateRandomCode(length) {
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
}

function renderForgotPasswordPage (req, res){
  res.render('forgot-password'); // Assurez-vous d'avoir un fichier de modèle correspondant
};

async function sendResetPasswordEmail (req, res) {
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
};
function verifypasswordcodePage(req, res)  {
  res.render('verify-code'); // Assurez-vous d'avoir un fichier de modèle correspondant
};
function verifypasswordcode (req, res){
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
};
function renderResetPasswordPage(req, res){
  res.render('reset-password'); // Assurez-vous d'avoir un fichier de modèle correspondant
};
function resetPassword(req, res) {
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
};
module.exports = {
  renderLoginPage,
  logoutUser,
  loginUser,
  registerUser,
  verifyRegistre,
  renderForgotPasswordPage,
  sendResetPasswordEmail,
  renderResetPasswordPage,
  resetPassword,
  verifypasswordcodePage,
  verifypasswordcode
};
