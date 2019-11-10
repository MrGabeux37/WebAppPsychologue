'use strict'

const Handlers = require('./handler');
const Mysql = require('mysql');
const Boom = require('boom');
const Jsdom = require('jsdom');

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

const Routes = [/*
{
  method: 'GET',
  path: '/',
  handler: (request, h) => {
    return h.view('main/login');
  }
},*/

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
},

{
  method: 'POST',
  path: '/register',
  handler: (request, h) =>{
    const payload = request.payload;
    console.log(payload);

    var parent1,parent2;
    var courriel_enfant = payload.courriel_enfant;
 //creation of parent1 in DB
    connection.query('INSERT INTO client (nom, prenom, date_de_naissance, sexe, courriel, num_telephone, permission, mot_de_passe) VALUES ("' + payload.nom_parent1 + '","' + payload.prenom_parent1 + '","' + payload.date_de_naissance_parent1 + '","' + payload.sexe_parent1 + '","' + payload.courriel_parent1 + '","' + payload.num_telephone_parent1 + '","' + "0" + '",MD5(\'"' + payload.mot_de_passe[1] + '"\'))', function (error, results, fields) {
      if (error) throw error;
      console.log(results.insertId);
      parent1=results.insertId;
    })

 //creation of parent2 in DB
    if(payload.famillecheck){
      connection.query('INSERT INTO client (nom, prenom, date_de_naissance, sexe, courriel, num_telephone, permission, mot_de_passe) VALUES ("' + payload.nom_parent2 + '","' + payload.prenom_parent2 + '","' + payload.date_de_naissance_parent2 + '","' + payload.sexe_parent2 + '","' + payload.courriel_parent2 + '","' + payload.num_telephone_parent2 + '","' + "0" + '",MD5(\'"' + payload.mot_de_passe[1] + '"\'))', function (error, results, fields) {
        if (error) throw error;
        console.log(results.insertId);
        parent2=results.insertId;
      })
    }
 //creation of enfant in DB
  if(payload.courrielcheckenfant){
    courriel_enfant=NULL;
  }
  connection.query('INSERT INTO client (nom, prenom, date_de_naissance, sexe, courriel, num_telephone, permission, mot_de_passe,id_parent1,id_parent2) VALUES ("' + payload.nom_enfant + '","' + payload.prenom_enfant + '","' + payload.date_de_naissance_enfant + '","' + payload.sexe_enfant + '","' + courriel_enfant + '","' + payload.num_telephone_parent1 + '","' + "0" + '",MD5(\'"' + payload.mot_de_passe[1] + '"\'),"' + parent1 + '","' + parent2 + '")', function (error, results, fields) {
      if (error) throw error;
      console.log(results.insertId);
  })

    return payload;
  }
},
  {
    method: 'POST',
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
      handler: function (request, reply) {
        if (request.auth.isAuthenticated) {
          return reply.view('Profile')
        }

        var username = request.payload.username
        var user = Users[ username ]

        if (!user) {
          return reply(Boom.notFound('No user registered with given credentials'))
        }

        var password = request.payload.password

        return Bcrypt.compare(password, user.password, function (err, isValid) {
          if (isValid) {
            request.server.log('info', 'user authentication successful')
            request.cookieAuth.set(user);
            return reply.view('profile')
          }

          return reply.view('main/login')
        })
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
    handler: function (request, reply) {
      if (request.auth.isAuthenticated) {
        return reply.view('profile')
      }

      return reply.view('main/login')
    }
  }
}

];


module.exports = Routes
