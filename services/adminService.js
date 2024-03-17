const xlsx = require('xlsx');
const db = require('../config/databaseConfig');

async function importDataFromExcel(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets['Nom de la feuille de calcul'];
    const data = xlsx.utils.sheet_to_json(sheet);
    return data;
  } catch (error) {
    console.error("Erreur lors de l'importation des données depuis Excel :", error);
    throw error;
  }
}

module.exports = {
  importDataFromExcel
};
