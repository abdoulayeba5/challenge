const db = require("../config/databaseConfig");
// const { handleReclamation } = require('../services/studentService');

async function renderStudentPage(req, res) {
  // Logique pour afficher la page des étudiants
}

async function selectEquipe(req, res) {
  // Fetch all documents from the 'etudiants' collection
  db.collection("etudiants")
    .find({})
    .toArray((err, students) => {
      if (err) {
        console.error("Error fetching students:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Fetch all documents from the 'equipe' collection
      db.collection("equipe")
        .find({})
        .toArray((err, equipes) => {
          if (err) {
            console.error("Error fetching equipe:", err);
            return res.status(500).json({ error: "Internal server error" });
          }

          // Get all member matricules from equipes
          const equipeMatricules = equipes.reduce((acc, equipe) => {
            return acc.concat(equipe.members);
          }, []);

          // Get lead and adjoint matricules
          const leadMatricule = equipes.map((equipe) => equipe.lead);
          const adjointMatricule = equipes.map((equipe) => equipe.adjoint);

          // Filter students by those not in equipeMatricules and not equal to leadMatricule or adjointMatricule
          const filteredStudents = students.filter((student) => {
            return (
              !equipeMatricules.includes(student.matricule.toString()) &&
              !leadMatricule.includes(student.matricule.toString()) &&
              !adjointMatricule.includes(student.matricule.toString())
            );
          });

          // Map the filtered documents to include only 'matricule'
          const studentArray = filteredStudents.map((student) => ({
            matricule: student.matricule,
          }));
          req.session.array = studentArray;
          return res.render("equipe", { array: studentArray, error: " " });
        });
    });
}

async function equipe_insert(req, res) {
  // Extract data from the query parameters
  const { name, lead, adjoint, nombreMembres, ...members } = req.query;

  // Construct the document to be inserted
  const equipeDoc = {
    name: name,
    lead: lead,
    adjoint: adjoint,
    nombreMembres: parseInt(nombreMembres), // Ensure nombreMembres is converted to a number
    members: Object.values(members), // Convert members object to an array of member matricules
  };
  console.log(equipeDoc);
  // Convertir les membres, lead et adjoint en un ensemble pour détecter les doublons
  const allValuesSet = new Set([
    ...equipeDoc.members,
    equipeDoc.lead,
    equipeDoc.adjoint,
  ]);

  // Vérifier s'il y a des doublons en comparant la taille de l'ensemble avec le nombre total de valeurs
  const totalValues = equipeDoc.members.length + 2; // 2 pour lead et adjoint
  const hasDuplicates = allValuesSet.size !== totalValues;

  if (hasDuplicates) {
    console.log(
      "Il y a des valeurs dupliquées dans l'équipe (membres, lead ou adjoint)."
    );
    return res.render("equipe", {
      error:
        "Il y a des valeurs dupliquées dans l'équipe (membres, lead ou adjoint).",
      array: req.session.array,
    });
  } else {
    console.log("Aucune valeur dupliquée trouvée dans l'équipe.");
  }
  // Récupérer les niveaux du lead et de l'adjoint depuis la collection "etudiants"
  const leadEtudiant = await db
    .collection("etudiants")
    .findOne({ matricule: parseInt(equipeDoc.lead) });
  const adjointEtudiant = await db
    .collection("etudiants")
    .findOne({ matricule: parseInt(equipeDoc.adjoint) });

  // Vérifier si les documents du lead et de l'adjoint existent et obtenir leurs niveaux
  const leadNiveau = leadEtudiant ? leadEtudiant.niveau : null;
  const adjointNiveau = adjointEtudiant ? adjointEtudiant.niveau : null;

  console.log("Lead niveau:", leadNiveau);
  console.log("Adjoint niveau:", adjointNiveau);

  // Récupérer les niveaux des membres depuis la collection "etudiants"
  const membresNiveaux = await Promise.all(
    equipeDoc.members.map(async (matricule) => {
      const etudiant = await db
        .collection("etudiants")
        .findOne({ matricule: parseInt(matricule) });
      const etudiantNiveau = etudiant ? etudiant.niveau : null;
      console.log(
        "Niveau de l'étudiant avec matricule",
        matricule,
        ":",
        etudiantNiveau
      );
      return etudiantNiveau;
    })
  );

  console.log("Niveaux des membres:", membresNiveaux);

  // Vérifier si le lead et l'adjoint ont des niveaux différents
  if (leadNiveau && adjointNiveau) {
    const leadAdjointNiveauxDifferents = leadNiveau !== adjointNiveau;

    // Compter le nombre de membres de niveau L2
    const nombreMembresL2 = membresNiveaux.filter(
      (niveau) => niveau === "L2"
    ).length;
    console.log("Nombre de membres de niveau L2:", nombreMembresL2);

    // Vérifier si le lead et l'adjoint ont des niveaux différents et s'il y a trois membres de niveau L2
    if (leadAdjointNiveauxDifferents && nombreMembresL2 === 3) {
      console.log(
        "Le lead et l'adjoint ont des niveaux différents, et il y a trois membres de niveau L2."
      );
      db.collection("equipe").insertOne(equipeDoc);
      return res.render("equipe", {
        error: "Equipe inserted successfully",
        array: req.session.array,
      });
    } else {
      console.log("Les conditions requises ne sont pas remplies.");
      return res.render("equipe", {
        error: "Les conditions requises ne sont pas remplies.",
        array: req.session.array,
      });
    }
  }
}
module.exports = {
  renderStudentPage,
  selectEquipe,
};
