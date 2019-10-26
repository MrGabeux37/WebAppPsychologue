'use strict'
const Mysql = require('mysql');
const Handlers = require('./handler');
/*
//connection de la base de données
var connection = Mysql.createConnection({
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
*/
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
{
  method: 'GET',
  path: '/{param*}',
  handler:Handlers.servePublicDirectory
}
];

module.exports = Routes
