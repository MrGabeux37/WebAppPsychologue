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
  config:{
    auth:false,
    handler: (request, h) => {
      return h.view('main/createaccount');
    }
  }
},
{
  method: 'GET',
  path: '/profil',
  config:{
    auth:{
      strategy:'session',
      scope:['clientOui','clientNon']
    },
    handler:(request,h) =>{
      console.log(request.auth.credentials);
      console.log(request.auth.isAuthenticated);
      if(request.auth.credentials.scope=='clientOui') return h.view('client/profil',null,{layout:'clientOui'});
      else return h.view('client/profil',null,{layout:'clientNon'});
    }
  }
},
{
  method: 'GET',
  path: '/reservation',
  config:{
    auth:{
      strategy:'session',
      scope:['clientOui','clientNon']
    },
    handler:(request,h) =>{
      if(request.auth.credentials.scope=='clientOui') return h.view('client/reservation',null,{layout:'clientOui'});
      else return h.view('client/reservation',null,{layout:'clientNon'});
    }
  }
},
{
  method: 'GET',
  path: '/calendrier',
  config:{
    auth:{
      strategy:'session',
      scope:['clientOui']
    },
    handler:(request,h) =>{
      return h.view('client/calendar',null,{layout:'clientOui'});
    }
  }
},
{
  method: 'GET',
  path: '/profil_psychologue',
  config:{
    auth:{
      strategy:'session',
      scope:['psychologue']
    },
    handler:(request,h) =>{
      return h.view('psychologue/profil',null,{layout:'psychologue'});
    }
  }
},
{
  method: 'GET',
  path: '/clients',
  config:{
    auth:{
      strategy:'session',
      scope:['psychologue']
    },
    handler:(request,h) =>{
      return h.view('psychologue/clients_recherche',null,{layout:'psychologue'});
    }
  }
},
{
  method: 'GET',
  path: '/calendrier_psychologue',
  config:{
    auth:{
      strategy:'session',
      scope:['psychologue']
    },
    handler:(request,h) =>{
      return h.view('psychologue/calendar',null,{layout:'psychologue'});
    }
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
  config:{
    auth:false,
    handler: (request, h) =>{
      const payload = request.payload;
      console.log(payload);

      //encription du mot de passe
      var password=md5(payload.mot_de_passe[1]);

      return h.view('main/login');

    }
  },
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
      var scope="";
      var inputCourriel = request.payload.inputCourriel;
      var inputPassword = md5(request.payload.inputPassword);

      var user=await Client.findOne({
        where:{courriel: inputCourriel}
      });

      if(!user){
        user=await Psychologue.findOne({
          where:{courriel:inputCourriel}
        })
        if(!user){
          return Boom.notFound('Personne avec ce courriel')
        }
      }

      if(inputPassword==user.mot_de_passe){
        console.log(user.mot_de_passe);
        console.log(inputPassword);
        if(user.prefix=='C'){
          request.server.log('info','user authentication successful')
          if(user.permission==false)scope="clientNon";
          else scope="clientOui";
          request.cookieAuth.set({
            id : user.id_client,
            scope : scope
          });
          return h.redirect('/profil');
        }
        if(user.prefix=='PS'){
          request.server.log('info','user authentication successful')
          request.cookieAuth.set({
            id : user.id_psychologue,
            scope: "psychologue"
          });
          return h.redirect('/profil_psychologue');
        }
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
        return h.redirect('/profil');

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

      return h.redirect('/');
    }
  }
}

];


module.exports = Routes
