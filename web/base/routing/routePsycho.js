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
  //route du profil du psychologue
  {
    method: 'GET',
    path: '/profil_psychologue',
    config:{
      auth:{
        strategy:'session',
        scope:['psychologue']
      },
      handler:async (request,h) =>{
        var data,nom,prenom,courriel,telephone;
        var psychologue = await Psychologue.findOne({where:{id_psychologue:request.auth.credentials.id}});

        data={
          nom:'<input type="text" class="form-control" name="nom_psycologue" value="'+ psychologue.nom +'">',
          prenom:'<input type="text" class="form-control" name="prenom_psychologue" value="'+ psychologue.prenom +'">',
          courriel:'<input type="email" class="form-control" name="courriel_psychologue" value="'+ psychologue.courriel +'">',
          telephone:'<input type="tel" class="form-control" name="num_telephone_psychologue" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" value="'+ psychologue.num_telephone +'">'
        }


        return h.view('psychologue/profil',data,{layout:'psychologue'});
      }
    }
  },
  //update profil psychologue
  {
    method: 'POST',
    path: '/profil_psychologue/update',
    config:{
      auth:{
        strategy:'session',
        scope:['psychologue']
      },
      handler:async (request,h) =>{
        var psychologue = await Psychologue.findOne({where:{id_psychologue:request.auth.credentials.id}});
        const payload = request.payload;

        psychologue.nom=payload.nom_psycologue;
        psychologue.prenom=payload.prenom_psychologue;
        psychologue.courriel=payload.courriel_psychologue;
        psychologue.num_telephone=payload.num_telephone_psychologue;

        psychologue.save();
        return h.redirect('/profil_psychologue');
      }
    }
  },
  //page recherche des clients
  {
    method: 'GET',
    path: '/clients',
    config:{
      auth:{
        strategy:'session',
        scope:['psychologue']
      },
      handler:async(request,h) =>{
        const payload = request.query;
        var data,name,resultat;
        var variable = payload.nom_enfant;
        var clients = await Client.findAll({
          where:{
            id_parent1:
              {
                [Op.not]:null
              }
          },
          order:[
            ['nom','ASC']
          ]
        })

        resultat='';

        //construit le html pour chaque client resultat de la requete plus haute
        for(var i=0;i<clients.length;i++){
          resultat+='<div class="row "><div class="col">';
          resultat+='<a href="/clients/'+ clients[i].id_client +'" style="color: black; text-decoration: none;">ID: '+clients[i].id_client+'</a></div></div>';

          resultat+='<div class="row mt-2"><div class="col">';
          resultat+='<a href="/clients/'+ clients[i].id_client +'" style="color: black; text-decoration: none;">Nom: '+clients[i].nom+'</a></div>';
          resultat+='<div class="col"><a href="/clients/'+ clients[i].id_client +'" style="color: black; text-decoration: none;">Prénom: '+clients[i].prenom+'</a></div> </div>';
          resultat+='<div class="row mt-2"><div class="col">';
          resultat+='<a href="/clients/'+ clients[i].id_client +'" style="color: black; text-decoration: none;">Date de naissance: '+clients[i].date_de_naissance+' </a></div>'

          var permission='';
          if(clients[i].permission)permission='Oui';
          else permission='Non';

          resultat+='<div class="col"><a href="/clients/'+ clients[i].id_client +'" style="color: black; text-decoration: none;">Permisson: '+permission+' </a>'
          resultat+='</div></div><hr class="mt-4">';
        }

        var data={
          name:"",
          resultat:resultat
        }
        return h.view('psychologue/clients_recherche',data,{layout:'psychologue'});
      }
    }
  },
  //interface du profil client du cote psychologue
  {
    method: 'GET',
    path: '/clients/{id*}',
    config:{
      auth:{
        strategy:'session',
        scope:['psychologue']
      },
      handler:async(request,h) =>{
        const payload=request.params || {};
        console.log(payload.id);

        //initialisation du code html.
        var data,htmlParent2;
        //initialisation des objets
        var enfant,parent1,parent2
        var htmlResultat='<h6 class="text-center mb-3">Réservations</h6>';
        htmlResultat+='<div class="col"><a href="/client/ancien/'+ payload.id +'" type="button" class="btn btn-primary m-2">Rendez-vous Anciens</a><a href="/client/future/'+ payload.id +'" type="button" class="btn btn-primary m-2">Rendez-vous Futures</a></div><hr class="mt-4">';
        //trouve le client dans la bd
        enfant = await Client.findOne({where:{id_client:payload.id}});
        parent1 = await Client.findOne({where:{id_client:enfant.id_parent1}});
        parent2 = await Client.findOne({where:{id_client:enfant.id_parent2}});
        var reservation = await RendezVous.findAll({
          where:{id_client:enfant.id_client},
          order:[
            ['date','ASC']
          ]
        });
        if(reservation.length==0)htmlResultat+="<div class='text-center'>Ce client n'a pas de réservations</div>";
        else{
          var psychologue = await Psychologue.findOne({where:{id_psychologue:reservation[0].id_psychologue}});
          var today=new Date();
          //construire le html de de chaque rendezvous
          for(var i=0;i<reservation.length;i++){
            var plage= await PlageHoraire.findOne({where:{id_plage_horaire:reservation[i].id_plage_horaire}});
            var month;
            var annee = reservation[i].date.substring(0,4);
            var mois = reservation[i].date.substring(5,7);
            var jour = reservation[i].date.substring(8);
            var heureDebut = plage.heure_debut.substring(0,5);
            var heureFin = plage.heure_fin.substring(0,5);

            switch(mois){
              case '01':month='Janvier';break;
              case '02':month='Février';break;
              case '03':month='Mars';break;
              case '04':month='Avril';break;
              case '05':month='Mai';break;
              case '06':month='Juin';break;
              case '07':month='Juillet';break;
              case '08':month='Août';break;
              case '09':month='Septembre';break;
              case '10':month='Octobre';break;
              case '11':month='Novembre';break;
              case '12':month='Décembre';break;
              default:'does not exist';
            }
            var date = jour + ' ' + month + ' ' + annee ;

            htmlResultat+='<div class="row ml-4"><div class="col-4"><p>ID Rendez-Vous: '+ reservation[i].id_rendez_vous +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Psychologue: '+ psychologue.prenom +' '+ psychologue.nom +'</p></div></div>';
            htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Date: '+ date +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Heure: '+ heureDebut +' à '+ heureFin +'</p></div></div>';
            htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Ville: '+ reservation[i].ville +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Adresse: '+ reservation[i].adresse +'</p></div></div><hr class="mt-4">';
          }
        }

        if(parent2){
          htmlParent2='<hr class="mt-4"><h6 class="text-center mb-3">Parent 2</h6><div class="row"><div class="col"><label for="nom_parent2">Nom:</label><input type="text" class="form-control" name="nom_parent2" value="'+parent2.nom+'"></div><div class="col"><label for="prenom_parent2">Prénom:</label><input type="text" class="form-control" name="prenom_parent2" value="'+parent2.prenom+'"></div></div><div class="row mt-2"><div class="col-6"><label for="date_de_naissance_parent2">Date de naissance: </label><input type="date" class="form-control" name="date_de_naissance_parent2" value="'+parent2.date_de_naissance+'"></div></div><div class="row mt-2"><div class="col"><label for="courriel_parent2">Courriel:</label><input type="email" class="form-control" name="courriel_parent2" value="'+parent2.courriel+'"></div><div class="col"><label for="prenom_parent2">Téléphone:</label><input type="tel" class="form-control" name="num_telephone_parent2" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"value="'+parent2.num_telephone+'"></div></div>'
        }

        var reference='/profil_update/'+ enfant.id_client;
        var check='';

        if(enfant.permission)check='checked';
        else check='';

        data={
          enfantNom:'<input type="text" class="form-control" name="nom_enfant" value="'+enfant.nom+'">',
          enfantPrenom:'<input type="text" class="form-control" name="prenom_enfant" value="'+enfant.prenom+'">',
          dateEnfant:'<input type="date" class="form-control" name="date_de_naissance_enfant" value="'+enfant.date_de_naissance+'">',
          courrielEnfant:'<input type="email" class="form-control" name="courriel_enfant" value="'+enfant.courriel+'">',
          parent1Nom:'<input type="text" class="form-control" name="nom_parent1" value="'+parent1.nom+'">',
          parent1Prenom:'<input type="text" class="form-control" name="prenom_parent1" value="'+parent1.prenom+'">',
          dateParent1:'<input type="date" class="form-control" name="date_de_naissance_parent1" value="'+parent1.date_de_naissance+'">',
          courrielParent1:'<input type="email" class="form-control" name="courriel_parent1" value="'+parent1.courriel+'">',
          numTelParent1:'<input type="tel" class="form-control" name="num_telephone_parent1" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" value="'+parent1.num_telephone+'">',
          htmlParent2:htmlParent2,
          reference:reference,
          permissionEnfant:'<div class="custom-control custom-switch"><input type="checkbox" name="permission" class="custom-control-input" id="customSwitch1" value="oui" '+ check +'><label class="custom-control-label" for="customSwitch1">Si activé, ce client a la permission de prendre rendez-vous</label></div>',
          reservations:htmlResultat
        }


        return h.view('psychologue/clients_profil',data,{layout:'psychologue'});
      }
    }
  },
  //réservation future du client
  {
    method: 'GET',
    path: '/client/future/{id*}',
    config:{
      auth:{
        strategy:'session',
        scope:['psychologue']
      },
      handler:async(request,h) =>{
        const payload=request.params || {};
        console.log(payload.id);
        var today=new Date();
        //initialisation du code html.
        var data,htmlParent2;
        //initialisation des objets
        var enfant,parent1,parent2
        var htmlResultat='<h6 class="text-center mb-3">Réservations</h6><hr class="mt-4">';
        htmlResultat+='<div class="col"><a href="/client/ancien/'+ payload.id +'" type="button" class="btn btn-primary m-2">Rendez-vous Anciens</a><a href="/client/future/'+ payload.id +'" type="button" class="btn btn-primary m-2">Rendez-vous Futures</a></div><hr class="mt-4">';
        //trouve le client dans la bd
        enfant = await Client.findOne({where:{id_client:payload.id}});
        parent1 = await Client.findOne({where:{id_client:enfant.id_parent1}});
        parent2 = await Client.findOne({where:{id_client:enfant.id_parent2}});
        var reservation = await RendezVous.findAll({
          where:{
            [Op.and]:[
              {id_client:enfant.id_client},
              {date:{[Op.gte]:today}}
            ]
          },
          order:[
            ['date','ASC']
          ]
        });

        if(reservation.length<=0)htmlResultat+="<div class='text-center'>Ce client n'a pas de réservations</div>";
        else{
          var psychologue = await Psychologue.findOne({where:{id_psychologue:reservation[0].id_psychologue}});
          //construire le html de de chaque rendezvous
          for(var i=0;i<reservation.length;i++){
            var plage= await PlageHoraire.findOne({where:{id_plage_horaire:reservation[i].id_plage_horaire}});
            var month;
            var annee = reservation[i].date.substring(0,4);
            var mois = reservation[i].date.substring(5,7);
            var jour = reservation[i].date.substring(8);
            var heureDebut = plage.heure_debut.substring(0,5);
            var heureFin = plage.heure_fin.substring(0,5);

            switch(mois){
              case '01':month='Janvier';break;
              case '02':month='Février';break;
              case '03':month='Mars';break;
              case '04':month='Avril';break;
              case '05':month='Mai';break;
              case '06':month='Juin';break;
              case '07':month='Juillet';break;
              case '08':month='Août';break;
              case '09':month='Septembre';break;
              case '10':month='Octobre';break;
              case '11':month='Novembre';break;
              case '12':month='Décembre';break;
              default:'does not exist';
            }
            var date = jour + ' ' + month + ' ' + annee ;

            htmlResultat+='<div class="row ml-4"><div class="col-4"><p>ID Rendez-Vous: '+ reservation[i].id_rendez_vous +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Psychologue: '+ psychologue.prenom +' '+ psychologue.nom +'</p></div></div>';
            htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Date: '+ date +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Heure: '+ heureDebut +' à '+ heureFin +'</p></div></div>';
            htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Ville: '+ reservation[i].ville +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Adresse: '+ reservation[i].adresse +'</p></div></div>';
            htmlResultat+='<div class="row ml-4"><div class="col text-center"><a href="/client/future/annule/'+ reservation[i].id_rendez_vous +'" class="btn btn-primary" role="button">Annuler</a></div></div><hr class="mt-4">';
          }
        }

        if(parent2){
          htmlParent2='<hr class="mt-4"><h6 class="text-center mb-3">Parent 2</h6><div class="row"><div class="col"><label for="nom_parent2">Nom:</label><input type="text" class="form-control" name="nom_parent2" value="'+parent2.nom+'"></div><div class="col"><label for="prenom_parent2">Prénom:</label><input type="text" class="form-control" name="prenom_parent2" value="'+parent2.prenom+'"></div></div><div class="row mt-2"><div class="col-6"><label for="date_de_naissance_parent2">Date de naissance: </label><input type="date" class="form-control" name="date_de_naissance_parent2" value="'+parent2.date_de_naissance+'"></div></div><div class="row mt-2"><div class="col"><label for="courriel_parent2">Courriel:</label><input type="email" class="form-control" name="courriel_parent2" value="'+parent2.courriel+'"></div><div class="col"><label for="prenom_parent2">Téléphone:</label><input type="tel" class="form-control" name="num_telephone_parent2" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"value="'+parent2.num_telephone+'"></div></div>'
        }

        var reference='/profil_update/'+ enfant.id_client;
        var check='';

        if(enfant.permission)check='checked';
        else check='';

        data={
          enfantNom:'<input type="text" class="form-control" name="nom_enfant" value="'+enfant.nom+'">',
          enfantPrenom:'<input type="text" class="form-control" name="prenom_enfant" value="'+enfant.prenom+'">',
          dateEnfant:'<input type="date" class="form-control" name="date_de_naissance_enfant" value="'+enfant.date_de_naissance+'">',
          courrielEnfant:'<input type="email" class="form-control" name="courriel_enfant" value="'+enfant.courriel+'">',
          parent1Nom:'<input type="text" class="form-control" name="nom_parent1" value="'+parent1.nom+'">',
          parent1Prenom:'<input type="text" class="form-control" name="prenom_parent1" value="'+parent1.prenom+'">',
          dateParent1:'<input type="date" class="form-control" name="date_de_naissance_parent1" value="'+parent1.date_de_naissance+'">',
          courrielParent1:'<input type="email" class="form-control" name="courriel_parent1" value="'+parent1.courriel+'">',
          numTelParent1:'<input type="tel" class="form-control" name="num_telephone_parent1" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" value="'+parent1.num_telephone+'">',
          htmlParent2:htmlParent2,
          reference:reference,
          permissionEnfant:'<div class="custom-control custom-switch"><input type="checkbox" name="permission" class="custom-control-input" id="customSwitch1" value="oui" '+ check +'><label class="custom-control-label" for="customSwitch1">Si activé, ce client a la permission de prendre rendez-vous</label></div>',
          reservations:htmlResultat
        }


        return h.view('psychologue/clients_profil',data,{layout:'psychologue'});
      }
    }
  },
  //annule rendez-vous future du client
  {
    method: 'GET',
    path: '/client/future/annule/{id*}',
    config:{
      auth:{
        strategy:'session',
        scope:['psychologue']
      },
      handler:async(request,h) =>{
        var param = request.params || {};
        var reservation = await RendezVous.findOne({where:{id_rendez_vous:param.id}});
        var enfant = await Client.findOne({where:{id_client:reservation.id_client}});

        reservation.destroy();

        return h.redirect('/client/future/'+enfant.id_client);
      }
    }
  },
  //réservation ancienne du client
  {
    method: 'GET',
    path: '/client/ancien/{id*}',
    config:{
      auth:{
        strategy:'session',
        scope:['psychologue']
      },
      handler:async(request,h) =>{
        const payload=request.params || {};
        console.log(payload.id);

        //initialisation du code html.
        var data,htmlParent2;
        //initialisation des objets
        var enfant,parent1,parent2
        var htmlResultat='<h6 class="text-center mb-3">Réservations</h6><hr class="mt-4">';
        htmlResultat+='<div class="col"><a href="/client/ancien/'+ payload.id +'" type="button" class="btn btn-primary m-2">Rendez-vous Anciens</a><a href="/client/future/'+ payload.id +'" type="button" class="btn btn-primary m-2">Rendez-vous Futures</a></div><hr class="mt-4">';
        //trouve le client dans la bd
        enfant = await Client.findOne({where:{id_client:payload.id}});
        parent1 = await Client.findOne({where:{id_client:enfant.id_parent1}});
        parent2 = await Client.findOne({where:{id_client:enfant.id_parent2}});

        var today=new Date();
        var reservation = await RendezVous.findAll({
          where:{
            [Op.and]:[
              {id_client:enfant.id_client},
              {date:{[Op.lt]:today}}
            ]
          },
          order:[
            ['date','DESC']
          ]
        });

        if(reservation.length<=0)htmlResultat+="<div class='text-center'>Ce client n'a pas de réservations</div>";
        else{
          var psychologue = await Psychologue.findOne({where:{id_psychologue:reservation[0].id_psychologue}});
          var today=new Date();
          //construire le html de de chaque rendezvous
          for(var i=0;i<reservation.length;i++){
            var plage= await PlageHoraire.findOne({where:{id_plage_horaire:reservation[i].id_plage_horaire}});
            var month;
            var annee = reservation[i].date.substring(0,4);
            var mois = reservation[i].date.substring(5,7);
            var jour = reservation[i].date.substring(8);
            var heureDebut = plage.heure_debut.substring(0,5);
            var heureFin = plage.heure_fin.substring(0,5);

            switch(mois){
              case '01':month='Janvier';break;
              case '02':month='Février';break;
              case '03':month='Mars';break;
              case '04':month='Avril';break;
              case '05':month='Mai';break;
              case '06':month='Juin';break;
              case '07':month='Juillet';break;
              case '08':month='Août';break;
              case '09':month='Septembre';break;
              case '10':month='Octobre';break;
              case '11':month='Novembre';break;
              case '12':month='Décembre';break;
              default:'does not exist';
            }
            var date = jour + ' ' + month + ' ' + annee ;

            htmlResultat+='<div class="row ml-4"><div class="col-4"><p>ID Rendez-Vous: '+ reservation[i].id_rendez_vous +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Psychologue: '+ psychologue.prenom +' '+ psychologue.nom +'</p></div></div>';
            htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Date: '+ date +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Heure: '+ heureDebut +' à '+ heureFin +'</p></div></div>';
            htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Ville: '+ reservation[i].ville +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Adresse: '+ reservation[i].adresse +'</p></div></div><hr class="mt-4">';
          }
        }

        if(parent2){
          htmlParent2='<hr class="mt-4"><h6 class="text-center mb-3">Parent 2</h6><div class="row"><div class="col"><label for="nom_parent2">Nom:</label><input type="text" class="form-control" name="nom_parent2" value="'+parent2.nom+'"></div><div class="col"><label for="prenom_parent2">Prénom:</label><input type="text" class="form-control" name="prenom_parent2" value="'+parent2.prenom+'"></div></div><div class="row mt-2"><div class="col-6"><label for="date_de_naissance_parent2">Date de naissance: </label><input type="date" class="form-control" name="date_de_naissance_parent2" value="'+parent2.date_de_naissance+'"></div></div><div class="row mt-2"><div class="col"><label for="courriel_parent2">Courriel:</label><input type="email" class="form-control" name="courriel_parent2" value="'+parent2.courriel+'"></div><div class="col"><label for="prenom_parent2">Téléphone:</label><input type="tel" class="form-control" name="num_telephone_parent2" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"value="'+parent2.num_telephone+'"></div></div>'
        }

        var reference='/profil_update/'+ enfant.id_client;
        var check='';

        if(enfant.permission)check='checked';
        else check='';

        data={
          enfantNom:'<input type="text" class="form-control" name="nom_enfant" value="'+enfant.nom+'">',
          enfantPrenom:'<input type="text" class="form-control" name="prenom_enfant" value="'+enfant.prenom+'">',
          dateEnfant:'<input type="date" class="form-control" name="date_de_naissance_enfant" value="'+enfant.date_de_naissance+'">',
          courrielEnfant:'<input type="email" class="form-control" name="courriel_enfant" value="'+enfant.courriel+'">',
          parent1Nom:'<input type="text" class="form-control" name="nom_parent1" value="'+parent1.nom+'">',
          parent1Prenom:'<input type="text" class="form-control" name="prenom_parent1" value="'+parent1.prenom+'">',
          dateParent1:'<input type="date" class="form-control" name="date_de_naissance_parent1" value="'+parent1.date_de_naissance+'">',
          courrielParent1:'<input type="email" class="form-control" name="courriel_parent1" value="'+parent1.courriel+'">',
          numTelParent1:'<input type="tel" class="form-control" name="num_telephone_parent1" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" value="'+parent1.num_telephone+'">',
          htmlParent2:htmlParent2,
          reference:reference,
          permissionEnfant:'<div class="custom-control custom-switch"><input type="checkbox" name="permission" class="custom-control-input" id="customSwitch1" value="oui" '+ check +'><label class="custom-control-label" for="customSwitch1">Si activé, ce client a la permission de prendre rendez-vous</label></div>',
          reservations:htmlResultat
        }


        return h.view('psychologue/clients_profil',data,{layout:'psychologue'});
      }
    }
  },
  //update le profil d'un client cote psychologue
  {
    method: 'POST',
    path: '/profil_update/{id*}',
    config:{
      auth:{
        strategy:'session',
        scope:['psychologue']
      },
      handler:async(request,h) =>{
        const param=request.params || {};
        console.log(param.id);

        const payload = request.payload;
        console.log(payload);

        var enfant = await Client.findOne({where:{id_client:param.id}});
        var parent1 = await Client.findOne({where:{id_client:enfant.id_parent1}});
        var parent2 = await Client.findOne({where:{id_client:enfant.id_parent2}});

        console.log(enfant.id_client);

        var check;
        if(payload.permission=='oui')check=true;
        else check=false;

        if(parent2){
          parent2.nom=payload.nom_parent2;
          parent2.prenom=payload.prenom_parent2;
          parent2.date_de_naissance=payload.date_de_naissance_parent2;
          parent2.courriel=payload.courriel_parent2;
          parent2.num_telephone=payload.num_telephone_parent2;
          parent2.permission=check;
          parent2.save();
        }

        parent1.nom=payload.nom_parent1;
        parent1.prenom=payload.prenom_parent1;
        parent1.date_de_naissance=payload.date_de_naissance_parent1;
        parent1.courriel=payload.courriel_parent1;
        parent1.permission=check;
        parent1.num_telephone=payload.num_telephone;
        enfant.nom=payload.nom_enfant;
        enfant.prenom=payload.prenom_enfant;
        enfant.date_de_naissance=payload.date_de_naissance_enfant;
        enfant.permission=check;
        enfant.courriel=payload.courriel_enfant;
        enfant.num_telephone=payload.num_telephone_parent1;

        enfant.save();
        parent1.save();

        var reference= '/clients/' + enfant.id_client;

        return h.redirect(reference);
      }
    }
  },
  //resultat de recherche dans les enfants
  {
    method: 'GET',
    path: '/clients_recherche',
    config:{
      auth:{
        strategy:'session',
        scope:['psychologue']
      },
      handler: async (request,h) =>{
        const payload = request.query;
        var data,name,resultat;
        var variable = payload.nom_enfant;
        //requete pour trouver les enfants ayant les lettres entrées dans leur nom ou leur prenom
        var client = await Client.findAll({
          where:[
            {
              [Op.or]:
                [
                  {
                    nom:{[Op.like]:'%'+payload.nom_enfant+'%'}
                  },
                  {
                    prenom:{[Op.like]:'%'+payload.nom_enfant+'%'}
                  }
                ]
            },
            {
              id_parent1:
                {
                  [Op.not]:null
                }
            }
          ],
          order:[
            ['nom','ASC']
          ]
        })

        resultat='';

        //construit le html pour chaque client resultat de la requete plus haute
        for(var i=0;i<client.length;i++){
          resultat+='<div class="row "><div class="col">';
          resultat+='<a href="/clients/'+ client[i].id_client +'" style="color: black; text-decoration: none;">ID: '+client[i].id_client+'</a></div></div>';

          resultat+='<div class="row mt-2"><div class="col">';
          resultat+='<a href="/clients/'+ client[i].id_client +'" style="color: black; text-decoration: none;">Nom: '+client[i].nom+'</a></div>';
          resultat+='<div class="col"><a href="/clients/'+ client[i].id_client +'" style="color: black; text-decoration: none;">Prénom: '+client[i].prenom+'</a></div> </div>';
          resultat+='<div class="row mt-2"><div class="col">';
          resultat+='<a href="/clients/'+ client[i].id_client +'" style="color: black; text-decoration: none;">Date de naissance: '+client[i].date_de_naissance+' </a></div>'

          var permission='';
          if(client[i].permission)permission='Oui';
          else permission='Non';

          resultat+='<div class="col"><a href="/clients/'+ client[i].id_client +'" style="color: black; text-decoration: none;">Permisson: '+permission+' </a>'
          resultat+='</div></div><hr class="mt-4">';
        }

        var data={
          name:payload.nom_enfant,
          resultat:resultat
        }

        return h.view('psychologue/clients_recherche',data,{layout:'psychologue'});
      }
    }
  },
  //page des réservations du psychologue
  {
    method: 'GET',
    path: '/calendrier_psychologue',
    config:{
      auth:{
        strategy:'session',
        scope:['psychologue']
      },
      handler:async(request,h) =>{
        var today=new Date();
        var htmlResultat='';
        var reservation = await RendezVous.findAll({
          where:{date:{[Op.gte]:today}},
          order:[
            ['date','ASC']
          ]
        });

        var enfant;
        var psychologue = await Psychologue.findOne({where:{id_psychologue:reservation[0].id_psychologue}});
        if(reservation.length<=0)htmlResultat+="<div class='text-center'>Ce client n'a pas de réservations</div>";
        else{
          for(var i=0;i<reservation.length;i++){
            var nom_client='';
            var prenom_client='';
            var disponnible='Oui';
            var plage= await PlageHoraire.findOne({where:{id_plage_horaire:reservation[i].id_plage_horaire}});

            if(reservation[i].disponibilite==false){
              enfant = await Client.findOne({where:{id_client:reservation[i].id_client}})
              nom_client = enfant.nom;
              prenom_client = enfant.prenom;
              disponnible = 'Non'
            }

            var month;
            var annee = reservation[i].date.substring(0,4);
            var mois = reservation[i].date.substring(5,7);
            var jour = reservation[i].date.substring(8);
            var heureDebut = plage.heure_debut.substring(0,5);
            var heureFin = plage.heure_fin.substring(0,5);

              switch(mois){
                case '01':month='Janvier';break;
                case '02':month='Février';break;
                case '03':month='Mars';break;
                case '04':month='Avril';break;
                case '05':month='Mai';break;
                case '06':month='Juin';break;
                case '07':month='Juillet';break;
                case '08':month='Août';break;
                case '09':month='Septembre';break;
                case '10':month='Octobre';break;
                case '11':month='Novembre';break;
                case '12':month='Décembre';break;
                default:'does not exist';
              }
            var date = jour + ' ' + month + ' ' + annee ;

            htmlResultat+='<div class="row ml-4"><div class="col-4"><p>ID Rendez-Vous: '+ reservation[i].id_rendez_vous +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Enfant: '+ prenom_client +' '+ nom_client +'</p></div></div>';
            htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Date: '+ date +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Heure: '+ heureDebut +' à '+ heureFin +'</p></div></div>';
            htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Ville: '+ reservation[i].ville +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Adresse: '+ reservation[i].adresse +'</p></div></div>';
            htmlResultat+='<div class="row ml-4 mt"><div class="col"><p>Disponnible: '+ disponnible +'</p></div></div><hr class="mt-4">';
          }
        }

        var data={
          resultat:htmlResultat
        }

        return h.view('psychologue/reservations',data,{layout:'psychologue'});
      }
    }
  },
  //affiche les rendez-vous anciens au psychologue
  {
    method: 'GET',
    path: '/calendrier_psychologue/anciens',
    config:{
      auth:{
        strategy:'session',
        scope:['psychologue']
      },
      handler:async(request,h) =>{
        var today=new Date();
        var htmlResultat='';
        var reservation = await RendezVous.findAll({
          where:{
            [Op.and]:[
              {date:{[Op.lt]:today}},
              {disponibilite:false}
            ]
          },
          order:[
            ['date','DESC']
          ]
        });
        var enfant;
        if(reservation.length<=0)htmlResultat+="<div class='text-center'>Pas de réservations anciennes</div>";
        else{
          var psychologue = await Psychologue.findOne({where:{id_psychologue:reservation[0].id_psychologue}});
          for(var i=0;i<reservation.length;i++){
            var nom_client='';
            var prenom_client='';
            var disponnible='Oui';
            var plage= await PlageHoraire.findOne({where:{id_plage_horaire:reservation[i].id_plage_horaire}});

            if(reservation[i].disponibilite==false){
              enfant = await Client.findOne({where:{id_client:reservation[i].id_client}})
              nom_client = enfant.nom;
              prenom_client = enfant.prenom;
              disponnible = 'Non'
            }

            var month;
            var annee = reservation[i].date.substring(0,4);
            var mois = reservation[i].date.substring(5,7);
            var jour = reservation[i].date.substring(8);
            var heureDebut = plage.heure_debut.substring(0,5);
            var heureFin = plage.heure_fin.substring(0,5);

              switch(mois){
                case '01':month='Janvier';break;
                case '02':month='Février';break;
                case '03':month='Mars';break;
                case '04':month='Avril';break;
                case '05':month='Mai';break;
                case '06':month='Juin';break;
                case '07':month='Juillet';break;
                case '08':month='Août';break;
                case '09':month='Septembre';break;
                case '10':month='Octobre';break;
                case '11':month='Novembre';break;
                case '12':month='Décembre';break;
                default:'does not exist';
              }
              var date = jour + ' ' + month + ' ' + annee ;

              htmlResultat+='<div class="row ml-4"><div class="col-4"><p>ID Rendez-Vous: '+ reservation[i].id_rendez_vous +'</p></div>';
              htmlResultat+='<div class="col-7 ml-2"><p>Enfant: '+ prenom_client +' '+ nom_client +'</p></div></div>';
              htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Date: '+ date +'</p></div>';
              htmlResultat+='<div class="col-7 ml-2"><p>Heure: '+ heureDebut +' à '+ heureFin +'</p></div></div>';
              htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Ville: '+ reservation[i].ville +'</p></div>';
              htmlResultat+='<div class="col-7 ml-2"><p>Adresse: '+ reservation[i].adresse +'</p></div></div>';
              htmlResultat+='<div class="row ml-4 mt"><div class="col"><p>Disponnible: '+ disponnible +'</p></div></div><hr class="mt-4">';
            }
          }

        var data={
          resultat:htmlResultat
        }

        return h.view('psychologue/reservations',data,{layout:'psychologue'});
      }
    }
  },
  //affiche les rendez-vous future au psychologue
  {
    method: 'GET',
    path: '/calendrier_psychologue/futures',
    config:{
      auth:{
        strategy:'session',
        scope:['psychologue']
      },
      handler:async(request,h) =>{
        var today=new Date();
        var htmlResultat='';
        var reservation = await RendezVous.findAll({
          where:{
            [Op.and]:[
              {date:{[Op.gte]:today}},
              {disponibilite:false}
            ]
          },
          order:[
            ['date','ASC']
          ]
        });
        var enfant;
        if(reservation.length<=0)htmlResultat+="<div class='text-center'>Pas de rendez-vous future</div>";
        else{
          var psychologue = await Psychologue.findOne({where:{id_psychologue:reservation[0].id_psychologue}});
          for(var i=0;i<reservation.length;i++){
            var nom_client='';
            var prenom_client='';
            var disponnible='Oui';
            var plage= await PlageHoraire.findOne({where:{id_plage_horaire:reservation[i].id_plage_horaire}});

            if(reservation[i].disponibilite==false){
              enfant = await Client.findOne({where:{id_client:reservation[i].id_client}})
              nom_client = enfant.nom;
              prenom_client = enfant.prenom;
              disponnible = 'Non'
            }

            var month;
            var annee = reservation[i].date.substring(0,4);
            var mois = reservation[i].date.substring(5,7);
            var jour = reservation[i].date.substring(8);
            var heureDebut = plage.heure_debut.substring(0,5);
            var heureFin = plage.heure_fin.substring(0,5);

              switch(mois){
                case '01':month='Janvier';break;
                case '02':month='Février';break;
                case '03':month='Mars';break;
                case '04':month='Avril';break;
                case '05':month='Mai';break;
                case '06':month='Juin';break;
                case '07':month='Juillet';break;
                case '08':month='Août';break;
                case '09':month='Septembre';break;
                case '10':month='Octobre';break;
                case '11':month='Novembre';break;
                case '12':month='Décembre';break;
                default:'does not exist';
              }
              var date = jour + ' ' + month + ' ' + annee ;

              htmlResultat+='<div class="row ml-4"><div class="col-4"><p>ID Rendez-Vous: '+ reservation[i].id_rendez_vous +'</p></div>';
              htmlResultat+='<div class="col-7 ml-2"><p>Enfant: '+ prenom_client +' '+ nom_client +'</p></div></div>';
              htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Date: '+ date +'</p></div>';
              htmlResultat+='<div class="col-7 ml-2"><p>Heure: '+ heureDebut +' à '+ heureFin +'</p></div></div>';
              htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Ville: '+ reservation[i].ville +'</p></div>';
              htmlResultat+='<div class="col-7 ml-2"><p>Adresse: '+ reservation[i].adresse +'</p></div></div>';
              htmlResultat+='<div class="row ml-4"><div class="col"><p>Disponnible: '+ disponnible +'</p></div></div>';
              htmlResultat+='<div class="row ml-4"><div class="col text-center"><a href="/calendrier_psychologue/futures/annule/'+ reservation[i].id_rendez_vous +'" class="btn btn-primary" role="button">Annuler</a></div></div><hr class="mt-4">';
            }
          }

        var data={
          resultat:htmlResultat
        }

        return h.view('psychologue/reservations',data,{layout:'psychologue'});
      }
    }
  },
  //annule rendez-vous future
  {
    method: 'GET',
    path: '/calendrier_psychologue/futures/annule/{id*}',
    config:{
      auth:{
        strategy:'session',
        scope:['psychologue']
      },
      handler:async(request,h) =>{
        var param = request.params || {};
        var reservation = await RendezVous.findOne({where:{id_rendez_vous:param.id}});

        reservation.destroy();

        return h.redirect('/calendrier_psychologue/futures');
      }
    }
  },
  //affiche les rendez-vous disponnible au psychologue
  {
    method: 'GET',
    path: '/calendrier_psychologue/disponnible',
    config:{
      auth:{
        strategy:'session',
        scope:['psychologue']
      },
      handler:async(request,h) =>{
        var today=new Date();
        var htmlResultat='';
        var reservation = await RendezVous.findAll({
          where:{
            [Op.and]:[
              {date:{[Op.gte]:today}},
              {disponibilite:true}
            ]
          },
          order:[
            ['date','ASC']
          ]
        });
        var enfant;
        if(reservation.length<=0)htmlResultat+="<div class='text-center'>Pas de rendez-vous disponible</div>";
        else{
          var psychologue = await Psychologue.findOne({where:{id_psychologue:reservation[0].id_psychologue}});
          for(var i=0;i<reservation.length;i++){
            var nom_client='';
            var prenom_client='';
            var disponnible='Oui';
            var plage= await PlageHoraire.findOne({where:{id_plage_horaire:reservation[i].id_plage_horaire}});

            if(reservation[i].disponibilite==false){
              enfant = await Client.findOne({where:{id_client:reservation[i].id_client}})
              nom_client = enfant.nom;
              prenom_client = enfant.prenom;
              disponnible = 'Non'
            }

            var month;
            var annee = reservation[i].date.substring(0,4);
            var mois = reservation[i].date.substring(5,7);
            var jour = reservation[i].date.substring(8);
            var heureDebut = plage.heure_debut.substring(0,5);
            var heureFin = plage.heure_fin.substring(0,5);

              switch(mois){
                case '01':month='Janvier';break;
                case '02':month='Février';break;
                case '03':month='Mars';break;
                case '04':month='Avril';break;
                case '05':month='Mai';break;
                case '06':month='Juin';break;
                case '07':month='Juillet';break;
                case '08':month='Août';break;
                case '09':month='Septembre';break;
                case '10':month='Octobre';break;
                case '11':month='Novembre';break;
                case '12':month='Décembre';break;
                default:'does not exist';
              }
              var date = jour + ' ' + month + ' ' + annee ;

              htmlResultat+='<div class="row ml-4"><div class="col-4"><p>ID Rendez-Vous: '+ reservation[i].id_rendez_vous +'</p></div>';
              htmlResultat+='<div class="col-7 ml-2"><p>Enfant: '+ prenom_client +' '+ nom_client +'</p></div></div>';
              htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Date: '+ date +'</p></div>';
              htmlResultat+='<div class="col-7 ml-2"><p>Heure: '+ heureDebut +' à '+ heureFin +'</p></div></div>';
              htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Ville: '+ reservation[i].ville +'</p></div>';
              htmlResultat+='<div class="col-7 ml-2"><p>Adresse: '+ reservation[i].adresse +'</p></div></div>';
              htmlResultat+='<div class="row ml-4"><div class="col"><p>Disponnible: '+ disponnible +'</p></div></div>';
              htmlResultat+='<div class="row ml-4"><div class="col text-center"><a href="/calendrier_psychologue/disponnible/annule/'+ reservation[i].id_rendez_vous +'" class="btn btn-primary text-center" role="button">Annuler</a></div></div><hr class="mt-4">';
            }
          }

        var data={
          resultat:htmlResultat
        }

        return h.view('psychologue/reservations',data,{layout:'psychologue'});
      }
    }
  },
  //annule rendez-vous disponnible
  {
    method: 'GET',
    path: '/calendrier_psychologue/disponnible/annule/{id*}',
    config:{
      auth:{
        strategy:'session',
        scope:['psychologue']
      },
      handler:async(request,h) =>{
        var param = request.params || {};
        var reservation = await RendezVous.findOne({where:{id_rendez_vous:param.id}});

        reservation.destroy();

        return h.redirect('/calendrier_psychologue/disponnible');
      }
    }
  },
  //page de creation des rendez-vous par le psychologue
  {
    method: 'GET',
    path: '/calendrier_psychologue/create',
    config:{
      auth:{
        strategy:'session',
        scope:['psychologue']
      },
      handler:async(request,h) =>{
        var htmlHrDebut='';
        var htmlHrFin='';
        var heure;
        var zeroMin="00";
        var troisMin="30";

        for(var i=7;i<21;i++){
          if(i<10)heure="0"+i;
          else heure=i;
          htmlHrDebut+='<option>'+heure+':'+zeroMin+'</option>';
          htmlHrDebut+='<option>'+heure+':'+troisMin+'</option>';
          htmlHrFin+='<option>'+heure+':'+troisMin+'</option>';
          if(i<9)heure="0"+(i+1);
          else heure=i+1;
          htmlHrFin+='<option>'+heure+':'+zeroMin+'</option>';
        }


        var data={
          choixHrDebut:htmlHrDebut,
          choixHrFin:htmlHrFin,
        }

        return h.view('psychologue/createReservation',data,{layout:'psychologue'});
      }
    }
  },
  //creation des rendezvous
  {
    method: 'POST',
    path: '/calendrier_psychologue/create/RV',
    config:{
      auth:{
        strategy:'session',
        scope:['psychologue']
      },
      handler:async(request,h) =>{
        var payload=request.payload;
        console.log(payload);
        var plagehoraire = await PlageHoraire.findOne({
          where:{
            [Op.and]:[
              {heure_debut:payload.hrDebut},
              {heure_fin:payload.hrFin}
            ]
          }
        });
        if(!plagehoraire)return Boom.notFound('Aucune plage horaire');

        var rendezvous;
        if(payload.id_enfant!=''){
          var enfant = await Client.findOne({
            where:{
              [Op.and]:[
                {id_client:payload.id_enfant},
                {id_parent1:{[Op.ne]:null}}
              ]
            }
          })
          if(!enfant)return Boom.notFound('Aucun enfant avec cet identifiant');
          rendezvous = await RendezVous.build({
            date:payload.date_rv,
            adresse:payload.adresse,
            ville:payload.ville,
            disponibilite:false,
            id_psychologue:request.auth.credentials.id,
            id_client:enfant.id_client,
            id_plage_horaire:plagehoraire.id_plage_horaire
          })
        }
        else{
          rendezvous = await RendezVous.build({
            date:payload.date_rv,
            adresse:payload.adresse,
            ville:payload.ville,
            disponibilite:true,
            id_psychologue:request.auth.credentials.id,
            id_plage_horaire:plagehoraire.id_plage_horaire
          })
        }

        rendezvous.save();

        return h.redirect('/calendrier_psychologue/create');
      }
    }
  }
];
