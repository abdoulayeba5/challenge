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
    res.redirect("/admin/dashboard"); // Redirige vers la page de tableau de bord après connexion réussie
  } catch (error) {
    console.error("Erreur lors de la tentative de connexion :", error);
    res.render("login", {
      Error: "Une erreur s'est produite lors de la tentative de connexion.",
    });
  }
}

async function registerUser(req, res) {
  const { nom, email, password, cpassword } = req.body;

  try {
    const existingUser = await User.findOne({ email });

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

    const newUser = new User({
      nom,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.render("login", {
      Success: "Votre enregistrement a été effectué avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'utilisateur :", error);
    res.render("login", {
      Error: "Une erreur s'est produite lors de l'inscription.",
    });
  }
}

// Les autres fonctions du contrôleur authentification (oubli de mot de passe, réinitialisation de mot de passe) peuvent être remplies de manière similaire

module.exports = {
  renderLoginPage,
  logoutUser,
  loginUser,
  registerUser,
};
