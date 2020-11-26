'use strict'

const Mysql = require('mysql');
const Boom = require('boom');
const Jsdom = require('jsdom');
const md5 = require('md5');
const Sequelize =require('sequelize');
const Op = Sequelize.Op;
const Handlers = require('../handler');
const Client = require('../models/client.js');
const Psychologue = require('../models/psychologue.js');
const PlageHoraire = require('../models/plagehoraire.js');
const RendezVous = require('../models/rendezvous.js');

module.exports=[
  //test
  {
    method: 'GET',
    path:'/testing',
    options:{
      auth:false
    },
    handler:function (request, h) {


      return h.view('psychologue/calendar')
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
  //route de connection
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
  //route page d'accueil
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
  //route de deconnection
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
]
