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
      //Si l'utilisateur est authentifié
     if (request.auth.isAuthenticated) {
       //verifie si l'utilisateur est un client
       if(request.auth.credentials.scope==('clientOui'||'clientNon')){
         return h.redirect('/profil');
       }
       //verifie si l'utilisateur est un psychologue
       else{
         return h.redirect('/profil_psychologue');
       }
      }
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
  method: 'POST',
  path: '/register',
  config:{
    auth:false,
    handler: async (request, h) =>{
      //récupération des données entrées dans le formulaire
      const payload = request.payload;
      console.log(payload);
      var parent1,parent2,enfant;
      var password_parent1=null;
      var password_parent2=null;
      var password_enfant=null;
      var courriel_enfant=null;
      //encription du mot de passe
      var password=md5(payload.mot_de_passe[1]);
      if(payload.courriel_utilise1=='parent1')password_parent1=password;
      if(payload.courriel_utilise2=='parent2')password_parent2=password;
      if(payload.courriel_utilise3=='enfant')password_enfant=password;
      if(payload.courrielcheckenfant!=true){
        courriel_enfant=payload.courriel_enfant;
        password_enfant=password;
      }
      //creation de l'objet enfant
      enfant = await Client.build({
        nom:payload.nom_enfant,
        prenom:payload.prenom_enfant,
        date_de_naissance:payload.date_de_naissance_enfant,
        sexe:payload.sexe_enfant,
        courriel:courriel_enfant,
        num_telephone:payload.num_telephone_parent1,
        permission:false,
        mot_de_passe:password_enfant,
        id_parent1:null,
        id_parent2:null
      })
      enfant.save();

      //creation de l'objet parent1
      parent1 = await Client.build({
        nom:payload.nom_parent1,
        prenom:payload.prenom_parent1,
        date_de_naissance:payload.date_de_naissance_parent1,
        sexe:payload.sexe_parent1,
        courriel:payload.courriel_parent1,
        num_telephone:payload.num_telephone_parent1,
        permission:false,
        mot_de_passe:password_parent1
      })
      parent1.save().then(function(id1){
        enfant.update({
          id_parent1:id1.id_client
        })
      });

      if(payload.famillecheck==false){
      //creation de l'objet parent2
        parent2 = await Client.build({
          nom:payload.nom_parent2,
          prenom:payload.prenom_parent2,
          date_de_naissance:payload.date_de_naissance_parent2,
          sexe:payload.sexe_parent2,
          courriel:payload.courriel_parent2,
          num_telephone:payload.num_telephone_parent2,
          permission:false,
          mot_de_passe:password_parent2
        })
        parent2.save().then(function(id2){
          enfant.update({
            id_parent2:id2.id_client
          })
        });
      }

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

      //Si l'utilisateur est authentifié
     if (request.auth.isAuthenticated) {
       //verifie si l'utilisateur est un client
       if(request.auth.credentials.scope==('clientOui'||'clientNon')){
         return h.redirect('/profil');
       }
       //verifie si l'utilisateur est un psychologue
       else{
         return h.redirect('/profil_psychologue');
       }
      }

      var scope="";
      var inputCourriel = request.payload.inputCourriel;
      var inputPassword = md5(request.payload.inputPassword);

      //cherche un utilisateur dans la table client avec le courriel entré
      var user=await Client.findOne({
        where:{courriel: inputCourriel}
      });

      //verifie s'il la requete précédente donne un résultat null
      if(!user){
        //cherche un utilisateur dans la table psychologue avec le courriel entré
        user=await Psychologue.findOne({
          where:{courriel:inputCourriel}
        })
        //verifie s'il la requete précédente donne un résultat null
        if(!user){
          return Boom.notFound('Personne avec ce courriel')
        }
      }
      //verifie s'il le mot de passe entré est le même que celui dans la base de donnée
      if(inputPassword==user.mot_de_passe){
        request.server.log('info','user authentication successful')
        //verifie si l'utilisateur est un client
        if(user.prefix=='C'){
          //verifie la permission du client
          if(user.permission==false)scope="clientNon";
          else scope="clientOui";
          //set le cookie
          request.cookieAuth.set({
            id : user.id_client,
            scope : scope
          });
          return h.redirect('/profil');
        }
        //verifie si l'utilisateur est un psychologue
        if(user.prefix=='PS'){
          //set le cookie
          request.cookieAuth.set({
            id : user.id_psychologue,
            scope: "psychologue"
          });
          return h.redirect('/profil_psychologue');
        }
      }
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
      //verifie si l'utilisateur est un client
      if(request.auth.credentials.scope==('clientOui'||'clientNon')){
        return h.redirect('/profil');
      }
      //verifie si l'utilisateur est un psychologue
      else{
        return h.redirect('/profil_psychologue');
      }
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
