'use strict'

const Handlers = require('./handler');
const Mysql = require('mysql');
const Boom = require('boom');

//connection de la base de données
const connection = Mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'password',
  database:'manon_psychologie'
});

connection.connect(function(err){
  if(err){
    console.error('error connecting: ' + err.stack);
    return
  }
  console.log('connected as id ' + connection.threadId);
});

const Routes = [
{
  method: 'GET',
  path: '/',
  handler: (request, h) => {
    return h.view('main/login');
  }
},

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
{
  method: 'GET',
  path: '/{param*}',
  handler:Handlers.servePublicDirectory
},
{
  method: 'GET',
  path: '/toutclients',
  handler: function (request, reply){
    const promise = new Promise((resolve,reject)=>{
      connection.query('SELECT nom,prenom,sexe FROM client',
      function (error, results, fields){
        if(!results) throw Boom.notFound(`No Client found`);
        resolve(results);
      });
    })
    return promise
  }
}
/*
{
  method: 'POST',
  path: '/register',
  handler: (request, h) =>{
    const payload = request.query;
    console.log(payload.first);

    connection.query('INSERT INTO psychologue (nom,prenom,courriel,num_telephone,mot_de_passe) VALUES ("' + payload.last + '","' + payload.first + '","' + payload.email + '","' + payload.phone + '",MD5(\'"' + payload.password + '"\'))', function (error, results, fields) {
      if (error) throw error;
      console.log(results);
      return results;
    })
    return payload
  }
},
*/
];

module.exports = Routes
