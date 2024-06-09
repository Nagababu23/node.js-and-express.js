var app = require('express');  
const bodyParser = require('body-parser');

var express = require('express')  

var app = express()  
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore} = require('firebase-admin/firestore');


 
var serviceAccount = require("./servieAccountKey.json");
 
initializeApp({
   credential: cert(serviceAccount)
});
 
const db = getFirestore(); 
app.get('/', function (req, res) {  
    res.sendFile( __dirname + "/loginpage.html" );
}) 


app.get('/signUp', function(req, res) {
    const obj = req.query;
    const { username, email, password } = obj;
    if (username && email && password) {
        db.collection('final').add({
            username: username,
            email: email, // Corrected the field name
            password: password
        })
        .then(docRef => {
            console.log("Document written with ID: ", docRef.id);
            res.render("home",{name:username});
        })
        .catch(error => {
            console.error("Error adding document: ", error);
            res.status(500).send("Internal server error");
        });
    } else {
        res.status(400).send("Missing required parameters");
    }
});

app.post('/logingUp', function(req, res) {
    const { email, password } = req.body;
    if (email && password) {
        // Check if email exists in the collection
        db.collection("final")
            .where("email", "==", email)
            .get()
            .then(snapshot => {
                if (snapshot.empty) {
                    // Email does not exist, return an error
                    res.status(400).send("Email not found");
                } else {
                    // Email exists, check password
                    const userDoc = snapshot.docs[0];
                    const userData = userDoc.data();
                    if (userData.password === password) {
                        // Password matches, login successful
                        res.render("home",{name:userData.username});
                    } else {
                        // Password does not match, return an error
                        res.status(400).send("Incorrect password");
                    }
                }
            })
            .catch(error => {
                console.error("Error checking email existence: ", error);
                res.status(500).send("Internal server error");
            });
    } else {
        res.status(400).send("Missing required parameters");
    }
});

app.listen(4000, function () {  
console.log('Example app  on port 2000!')  
})