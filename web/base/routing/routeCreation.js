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

module.exports = [
  //route vers la page de creation de compte
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
  //route creation de compte
  {
    method: 'POST',
    path: '/register',
    config:{
      auth:false,
      handler: async (request, h) =>{
        //récupération des données entrées dans le formulaire
        const payload = request.payload;
        //initialisation des variables
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
        //sauvegarde dans la bd et ajout de id_parent1 à l'enfant
        parent1.save().then(function(id1){
          enfant.update({
            id_parent1:id1.id_client
          })
        });

        if(!payload.famillecheck){
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
          //sauvegarde dans la bd et ajout de id_parent2 à l'enfant
          parent2.save().then(function(id2){
            enfant.update({
              id_parent2:id2.id_client
            })
          });
        }

        return h.redirect('/');
      }
    },
  }
];
