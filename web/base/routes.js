'use strict'

const Handlers = require('./handler');
const Mysql = require('mysql');
const Boom = require('boom');
const Jsdom = require('jsdom');
const md5 = require('md5');
const Client = require('./models/client.js');
const Psychologue = require('./models/psychologue.js');
const PlageHoraire = require('./models/plagehoraire.js');
const RendezVous = require('./models/rendezvous.js');

const Routes = [
/*
{
  method: 'GET',
  path: '/',
  handler: (request, h) => {
    return h.view('main/login');
  }
},
*/
{
  method: 'GET',
  path: '/createaccount',
  handler: (request, h) => {
    return h.view('main/createaccount');
  }
},
{
  method: 'GET',
  path: '/profil',
  handler:(request,h) =>{
    return h.view('client/profil');
  }
},
{
  method: 'GET',
  path: '/reservation',
  handler:(request,h) =>{
    return h.view('client/reservation');
  }
},
{
  method: 'GET',
  path: '/calendrier',
  handler:(request,h) =>{
    return h.view('client/calendar');
  }
},
{
  method: 'GET',
  path: '/profil_psychologue',
  handler:(request,h) =>{
    return h.view('psychologue/profil');
  }
},
{
  method: 'GET',
  path: '/clients',
  handler:(request,h) =>{
    return h.view('psychologue/clients_recherche');
  }
},
{
  method: 'GET',
  path: '/calendrier_psychologue',
  handler:(request,h) =>{
    return h.view('psychologue/calendar');
  }
},
//Serving Static files
{
  method: 'GET',
  path: '/{param*}',
  options:{
    auth: false
  },
  handler:Handlers.servePublicDirectory
},
{
  method: 'GET',
  path: '/toutclients',
  handler: function (request, reply){

    return Client.findAll()
  /*
    const promise = new Promise((resolve,reject)=>{
      connection.query('SELECT nom,prenom,sexe FROM client',
      function (error, results, fields){
        if(!results) throw Boom.notFound(`No Client found`);
        resolve(results);
      });
    })
    return promise
    */
  }
},

{
  method: 'POST',
  path: '/register',
  handler: (request, h) =>{
/*    const payload = request.payload;
    console.log(payload);

    //encription du mot de passe
    var password=md5(payload.mot_de_passe[1]);
/*
    var parent1 = 'SELECT id_client FROM (SELECT * FROM client) AS parental1 WHERE courriel="'+payload.courriel_parent1+'"' ;
    var parent2 = null;
    var courriel_enfant = payload.courriel_parent1;

    //creation of parent1 in DB
    connection.query('INSERT INTO client (nom, prenom, date_de_naissance, sexe, courriel, num_telephone, permission, mot_de_passe) VALUES ("' + payload.nom_parent1 + '","' + payload.prenom_parent1 + '","' + payload.date_de_naissance_parent1 + '","' + payload.sexe_parent1 + '","' + payload.courriel_parent1 + '","' + payload.num_telephone_parent1 + '","' + "0" + '","'+ password + '")', function (error, results, fields) {
        if (error) throw error;
        console.log(results.insertId);
      })

    //creation of parent2 in DB
    if(!payload.famillecheck){
        parent2 = 'SELECT id_client FROM (SELECT * FROM client) AS parental2 WHERE courriel="'+payload.courriel_parent2+'"' ;
        connection.query('INSERT INTO client (nom, prenom, date_de_naissance, sexe, courriel, num_telephone, permission, mot_de_passe) VALUES ("' + payload.nom_parent2 + '","' + payload.prenom_parent2 + '","' + payload.date_de_naissance_parent2 + '","' + payload.sexe_parent2 + '","' + payload.courriel_parent2 + '","' + payload.num_telephone_parent2 + '","' + "0" + '","' + password + '")', function (error, results, fields) {
          if (error) throw error;
          console.log(results.insertId);
        })
    }

    //creation of enfant in DB
    if(payload.courrielcheckenfant){
      console.log(parent1 +" et "+parent2);
      courriel_enfant=NULL;
      connection.query('INSERT INTO client (nom, prenom, date_de_naissance, sexe, courriel, num_telephone, permission, mot_de_passe,id_parent1,id_parent2) VALUES ("' + payload.nom_enfant + '","' + payload.prenom_enfant + '","' + payload.date_de_naissance_enfant + '","' + payload.sexe_enfant + '","' + courriel_enfant + '","' + payload.num_telephone_parent1 + '","' + "0" + '","' + password + '",(' + parent1 + '),(' + parent2 + '))', function (error, results, fields) {
        if (error) throw error;
          console.log(results.insertId);
           })
        }
    else{
      connection.query('INSERT INTO client (nom, prenom, date_de_naissance, sexe, courriel, num_telephone, permission, mot_de_passe,id_parent1,id_parent2) VALUES ("' + payload.nom_enfant + '","' + payload.prenom_enfant + '","' + payload.date_de_naissance_enfant + '","' + payload.sexe_enfant + '","' + payload.courriel_enfant + '","' + payload.num_telephone_parent1 + '","' + "0" + '","' + password + '",(' + parent1 + '),(' + parent2 + '))', function (error, res, fields) {
      if (error) throw error;
        console.log(res.insertId);
      })
    }

    return h.view('main/login');
    */
  }
},
{
  method: 'POST',
  path: '/login',
  config: {
    auth: {
      mode: 'try',
      strategy: 'session'
    },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: function (request,h){
  /*    if (request.auth.isAuthenticated) {
        return h.view('client/profil')
      }
      var courriel = request.payload.inputCourriel;
      var password = md5(request.payload.inputPassword);
      var user=[];

      var getInformationFromDB = function(callback){
        connection.query('SELECT id_client, prefix, nom, prenom, courriel, permission, mot_de_passe FROM client WHERE courriel="' + courriel + '"', function (error, results, fields) {
          if (error) return callback(error);
          if(results.length){
              user.push(results[0]);
          }
          callback(null,user);
        });
      }

      getInformationFromDB(function(err,user){
        if(err) console.log("Database error!");
        else {

          if(!user || !user.lenght){
            return Boom.notFound('Personne avec ce courriel')
          }
          if(password==user[0].mot_de_passe){
            console.log(user[0]);
            console.log(user[0].mot_de_passe);
            console.log(password);
            request.server.log('info','user authentication successful')
            request.cookieAuth.set(user[0]);
            console.log(request.auth.isAuthenticated);
            return h.view('client/profil')
          }
        }
      })

      console.log(request.auth.isAuthenticated);
      return h.view('main/login');
*/
    }
  }
},
{
  method: 'GET',
  path: '/',
  config: {
    auth: {
      mode: 'try',
      strategy: 'session'
    },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: function (request, h) {
    if (request.auth.isAuthenticated) {
        return h.view('client/profile')

      }

      return h.view('main/login')
    }
  }
},
{
  method: 'GET',
  path: '/private-route',
  config: {
    auth: 'session',
    handler: (request, h) => {
      // clear the session data
      request.cookieAuth.clear()

      return 'Logged out. See you around :)'
    }
  }
}

];


module.exports = Routes
