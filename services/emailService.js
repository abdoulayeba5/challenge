const nodemailer = require("nodemailer");

// Services pour l'envoi d'e-mails
async function sendRandomCode(fromName, email) {
  // Logique pour envoyer un e-mail avec un code aléatoire
  try {
    // Générer un code aléatoire de 6 caractères
    const randomCode = "1DBXyT";
    console.log("randomCode", randomCode);

    // Envoyer l'e-mail avec le code aléatoire à l'adresse e-mail spécifiée
    sendEmail(
      fromName,
      email,
      "Code aléatoire",
      `Votre code aléatoire est : ${randomCode}`
    );

    // Retourner le randomCode pour le stocker dans la session
    return randomCode;
  } catch (error) {
    console.error("Erreur lors de l'envoi du code aléatoire :", error);
    throw error;
  }
}

async function sendEmail(fromName, to, subject, text) {
  // Logique pour envoyer un e-mail à plusieurs destinataires
  const mailOptions = {
    from: `"${fromName}" <dah21019@gmail.com>`,
    to: to,
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error("Erreur lors de l'envoi de l'e-mail :", error);
    } else {
      console.log("E-mail envoyé :", info.response);
    }
  });
}

async function generateRandomCode(length) {
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
}
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dah21019@gmail.com",
    pass: "izkzmfpgsavsioul",
  },
});
module.exports = {
  sendRandomCode,
  sendEmail,
};

// // const nodemailer = require("nodemailer");

// // const transporter = nodemailer.createTransport({
// //   service: "gmail",
// //   auth: {
// //     user: "dah21019@gmail.com",
// //     pass: "izkzmfpgsavsioul",
// //   },
// // });

// // function sendEmail(fromName, to, subject, text) {
// //   const mailOptions = {
// //     from: `"${fromName}" <dah21019@gmail.com>`,
// //     to: to,
// //     subject: subject,
// //     text: text,
// //   };

// //   transporter.sendMail(mailOptions, function (error, info) {
// //     if (error) {
// //       console.error("Erreur lors de l'envoi de l'e-mail :", error);
// //     } else {
// //       console.log("E-mail envoyé :", info.response);
// //     }
// //   });
// // }

// // function sendEmails(fromName, toList, subject, text) {
// //   const mailOptions = {
// //     from: `"${fromName}" <dah21019@gmail.com>`,
// //     to: toList.join(", "),
// //     subject: subject,
// //     text: text,
// //   };

// //   transporter.sendMail(mailOptions, function (error, info) {
// //     if (error) {
// //       console.error("Erreur lors de l'envoi de l'e-mail :", error);
// //     } else {
// //       console.log("E-mail envoyé :", info.response);
// //     }
// //   });
// // }

// // module.exports = { sendEmail, sendEmails };
