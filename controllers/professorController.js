const db = require("../config/databaseConfig");
const { ObjectId } = require("mongodb");

async function renderProfessorPage(req, res) {
  // Logique pour afficher la page du professeur
}

async function noter(req, res) {
  const id = req.params.id;

  const matiere = db.collection("");
}

// Ajouter les membre de jury
async function grille(req, res) {
  idChallenge = "65f73b2420c956110f927bfc";

  try {
    const existingGrille = await db
      .collection("grille")
      .findOne({ idChallenge: new ObjectId(idChallenge) });
    console.log(existingGrille.section);

    res.render("jury/grille", { data: existingGrille.section });
  } catch (error) {
    console.error("Erreur lors de l'ajout du critère :", error);
    res.render("error");
  }
}
async function equipes(req, res) {
 

  try {
    const existingGrille = await db
      .collection("equipe")
      .find().toArray();
    console.log(existingGrille);

    res.render("jury/equipe", { data: existingGrille });
  } catch (error) {
    console.error("Erreur lors de l'ajout du critère :", error);
    res.render("error");
  }
}

async function acceuil(req, res) {
 

  try {
    const existingGrille = await db
      .collection("challenge")
      .find().toArray();
    console.log(existingGrille);

    res.render("jury/acceuil", { data: existingGrille });
  } catch (error) {
    console.error("Erreur lors de l'ajout du critère :", error);
    res.render("error");
  }
}
async function newEvaluation(req, res) {
  const { con, tec, Fd, EG, Gs,Qp,TS,OC } = req.body;

  try {
   


    const note = {
      jury: new ObjectId("65f743d299f823333ca11417"),
      submission: new ObjectId(),
      score:{
        con:con,
        tec: tec,
        Fd:Fd,
        EG: EG,
        Gs:Gs,
        Qp: Qp,
        TS:TS,
        OC: OC,
        
      }
    };
    await db.collection("evaluation").insertOne(note);

    res.redirect("equipe");
  } catch (error) {
    console.error(
      "Erreur lors de l'affichage de la page de gestion des données :",
      error
    );
    res.render("error");
  }
}

module.exports = {
  grille,
  equipes,
  acceuil,
  newEvaluation
};
