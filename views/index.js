
app.get("/open_upload", (req, res) => {
  res.set({
    "Allow-access-Allow-Origin": '*'
  })
  return res.render('drop_p', { Error: " " });
})

app.post("/upload", (req, res) => {
  
  return res.render('drop_p', { Error: " " });
})


//*******************admin**************************


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


//*********************prof************************* */

//********************prof and admin and sutend**********************/
app.get("/home1", (req, res) => {
  res.set({
    "Allow-access-Allow-Origin": '*'
  })
  const imagePath = "public/logo.png";
  return res.render('home1', { Error: req.session.matriculeEtudiant, imagePath: imagePath });
});

//********************prof and admin **********************/