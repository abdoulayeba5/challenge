// const nodemailer = require('nodemailer');

// // Services pour l'envoi d'e-mails
// async function sendRandomCode(fromName, to, subject, text) {
//   // Logique pour envoyer un e-mail avec un code aléatoire
// }

// async function sendEmail(fromName, toList, subject, text) {
//   // Logique pour envoyer un e-mail à plusieurs destinataires
// }

// module.exports = {
//   sendRandomCode,
//   sendEmail
// };





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
