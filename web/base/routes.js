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

//Servir fichier Static
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
  }
},

{
  method: 'POST',
  path: '/register',
  handler: (request, h) =>{
    const payload = request.payload;
    console.log(payload);

    //encription du mot de passe
    var password=md5(payload.mot_de_passe[1]);

    return h.view('main/login');

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
    handler: async function (request,h){
     if (request.auth.isAuthenticated) {
        return h.view('client/profil')
      }
      var inputCourriel = request.payload.inputCourriel;
      var inputPassword = md5(request.payload.inputPassword);

      var user = await Client.findOne({
        where:{courriel: inputCourriel}
      });

      if(!user){
        console.log(user);
        return Boom.notFound('Personne avec ce courriel')
      }
      if(inputPassword==user.mot_de_passe){
        console.log(user);
        console.log(inputPassword);
        request.server.log('info','user authentication successful')
        request.cookieAuth.set(user);
        console.log(request.auth.isAuthenticated);
        return h.redirect('/profil').rewritable().temporary();
      }
      console.log(request.auth.isAuthenticated);
      return h.view('main/login');
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
        return h.redirect('/profil').rewritable().temporary();

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

      return h.redirect('/').rewritable().temporary();
    }
  }
}

];


module.exports = Routes
