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
module.exports = {
  grille,
};
