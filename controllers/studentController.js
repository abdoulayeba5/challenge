const db = require('../config/databaseConfig');
// const { handleReclamation } = require('../services/studentService');

async function renderStudentPage(req, res) {
  // Logique pour afficher la page des étudiants
  
}

async function selectEquipe(req, res) {
    // Logique pour afficher la page des étudiants
    db.collection("etudiants")
    .find({})
    .toArray((err, students) => {
      if (err) {
        console.error("Error fetching students:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      // Map the fetched documents to include only 'matricule', 'specialite', and 'niveau'
      const studentArray = students.map((student) => ({
        matricule: student.matricule,
        niveau: student.niveau,
      }));
      console.log(studentArray);
      return res.render("equipe", { array: studentArray });
    });
  }
module.exports = {
  renderStudentPage,
  selectEquipe,
};
