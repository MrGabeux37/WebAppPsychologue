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
  //route d'affichage du profil client
  {
    method: 'GET',
    path: '/profil',
    config:{
      auth:{
        strategy:'session',
        scope:['clientOui','clientNon']
      },
      handler:async (request,h) =>{
        //initialisation du code html.
        var data,sexeEnfantF,sexeEnfantM,htmlParent2,sexeParent1M,sexeParent1F;
        //initialisation des objets
        var usager,enfant,parent1,parent2
        //trouve le client dans la bd
        usager= await Client.findOne({where:{id_client:request.auth.credentials.id}});

        enfant= await Client.findOne({where:{id_parent1:usager.id_client}});

        if(!enfant){
          enfant= await Client.findOne({where:{id_parent2:usager.id_client}});
          if(!enfant){
            enfant=usager;
            parent1 = await Client.findOne({where:{id_client:enfant.id_parent1}});
            parent2 = await Client.findOne({where:{id_client:enfant.id_parent2}});
          }
          else{
            parent2 = usager;
            parent1 = await Client.findOne({where:{id_client:enfant.id_parent1}});
          }
        }
        else{
          parent1 = usager;
          parent2 = await Client.findOne({where:{id_client:enfant.id_parent2}});
        }
        if(enfant.sexe=='M')sexeEnfantM='checked';
        else sexeEnfantF='checked';
        if(parent1.sexe=='M')sexeParent1M='checked';
        else sexeParent1F='checked';

        if(parent2){
          var sexeParent2M,sexeParent2F;
          if(parent2.sexe=='M')sexeParent2M='checked';
          else sexeParent2F='checked';
          htmlParent2='<h6 class="text-center mb-3">Parent 2</h6><div class="row"><div class="col"><label for="nom_parent2">Nom:</label><input type="text" class="form-control" name="nom_parent2" value="'+parent2.nom+'"></div><div class="col"><label for="prenom_parent2">Prénom:</label><input type="text" class="form-control" name="prenom_parent2" value="'+parent2.prenom+'"></div></div><div class="row mt-2"><div class="col"><label for="date_de_naissance_parent2">Date de naissance: </label><input type="date" class="form-control" name="date_de_naissance_parent2" value="'+parent2.date_de_naissance+'"></div><div class="col"><label for="sexe_parent2">Sexe: </label> <br><input type="radio" id="btnradio" class="form-check-input ml-2" name="sexe_parent2" value="M" '+sexeParent2M+'><label for="sexe_parent2" class="ml-4">Homme</label><input type="radio" id="btnradio" class="form-check-input ml-2" name="sexe_parent2" value="F" '+sexeParent2F+'><label for="sexe_parent2" class="ml-4">Femme</label></div></div><div class="row mt-2"><div class="col"><label for="courriel_parent2">Courriel:</label><input type="email" class="form-control" name="courriel_parent2" value="'+parent2.courriel+'"></div><div class="col"><label for="prenom_parent2">Téléphone:</label><input type="tel" class="form-control" name="num_telephone_parent2" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"value="'+parent2.num_telephone+'"></div></div><hr class="mt-4">'
        }

        data={
          enfantNom:'<input type="text" class="form-control" name="nom_enfant" value="'+enfant.nom+'">',
          enfantPrenom:'<input type="text" class="form-control" name="prenom_enfant" value="'+enfant.prenom+'">',
          dateEnfant:'<input type="date" class="form-control" name="date_de_naissance_enfant" value="'+enfant.date_de_naissance+'">',
          courrielEnfant:'<input type="email" class="form-control" name="courriel_enfant" value="'+enfant.courriel+'">',
          sexeEnfantF:sexeEnfantF,
          sexeEnfantM:sexeEnfantM,
          parent1Nom:'<input type="text" class="form-control" name="nom_parent1" value="'+parent1.nom+'">',
          parent1Prenom:'<input type="text" class="form-control" name="prenom_parent1" value="'+parent1.prenom+'">',
          dateParent1:'<input type="date" class="form-control" name="date_de_naissance_parent1" value="'+parent1.date_de_naissance+'">',
          courrielParent1:'<input type="email" class="form-control" name="courriel_parent1" value="'+parent1.courriel+'">',
          sexeParent1F:sexeParent1F,
          sexeParent1M:sexeParent1M,
          numTelParent1:'<input type="tel" class="form-control" name="num_telephone_parent1" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" value="'+parent1.num_telephone+'">',
          htmlParent2:htmlParent2
        }


        //etablis le bon layout
        if(request.auth.credentials.scope=='clientOui') return h.view('client/profil',data,{layout:'clientOui'});
        else return h.view('client/profil',data,{layout:'clientNon'});
      }
    }
  },
  //route update du profil client
  {
    method: 'POST',
    path: '/profil_update',
    config:{
      auth:{
        strategy:'session',
        scope:['clientOui','clientNon']
      },
      handler:async (request,h) =>{
        //initialisation des objets
        var usager,enfant,parent1,parent2
        //trouve le client dans la bd
        usager= await Client.findOne({where:{id_client:request.auth.credentials.id}});

        enfant= await Client.findOne({where:{id_parent1:usager.id_client}});

        if(!enfant){
          enfant= await Client.findOne({where:{id_parent2:usager.id_client}});
          if(!enfant){
            enfant=usager;
            parent1 = await Client.findOne({where:{id_client:enfant.id_parent1}});
            parent2 = await Client.findOne({where:{id_client:enfant.id_parent2}});
          }
          else{
            parent2 = usager;
            parent1 = await Client.findOne({where:{id_client:enfant.id_parent1}});
          }
        }
        else{
          parent1 = usager;
          parent2 = await Client.findOne({where:{id_client:enfant.id_parent2}});
        }

        const payload = request.payload;

        if(parent2){
          parent2.nom=payload.nom_parent2;
          parent2.prenom=payload.prenom_parent2;
          parent2.date_de_naissance=payload.date_de_naissance_parent2;
          parent2.sexe=payload.sexe_parent2;
          parent2.courriel=payload.courriel_parent2;
          parent2.num_telephone=payload.num_telephone_parent2;
          parent2.save();
        }

        parent1.nom=payload.nom_parent1;
        parent1.prenom=payload.prenom_parent1;
        parent1.date_de_naissance=payload.date_de_naissance_parent1;
        parent1.sexe=payload.sexe_parent1;
        parent1.courriel=payload.courriel_parent1;
        parent1.num_telephone=payload.num_telephone;
        enfant.nom=payload.nom_enfant;
        enfant.prenom=payload.prenom_enfant;
        enfant.date_de_naissance=payload.date_de_naissance_enfant;
        enfant.sexe=payload.sexe_enfant;
        enfant.courriel=payload.courriel_enfant;
        enfant.num_telephone=payload.num_telephone_parent1;

        parent1.save();
        enfant.save();
        return h.redirect('/profil')
      }
    }
  },
  //page des disponibilités des réservations des clients
  {
    method: 'GET',
    path: '/calendrier',
    config:{
      auth:{
        strategy:'session',
        scope:['clientOui']
      },
      handler:async(request,h) =>{

        var today=new Date();
        var htmlResultat='';
        var reservation = await RendezVous.findAll({
          where:{
            [Op.and]:[
              {disponibilite:{[Op.gt]:0}},
              {date:{[Op.gte]:today}}
            ]
          },
          order:[
            ['date','ASC']
          ]
        });
        if(reservation.length<=0)htmlResultat+="<div class='text-center'>Il n'y a pas de réservations disponibles</div>";
        else{
          var psychologue = await Psychologue.findOne({where:{id_psychologue:reservation[0].id_psychologue}});

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

            console.log(mois);

            htmlResultat+='<div class="row ml-4"><div class="col-4"><p>ID Rendez-Vous: '+ reservation[i].id_rendez_vous +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Psychologue: '+ psychologue.prenom +' '+ psychologue.nom +'</p></div></div>';
            htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Date: '+ date +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Heure: '+ heureDebut +' à '+ heureFin +'</p></div></div>';
            htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Ville: '+ reservation[i].ville +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Adresse: '+ reservation[i].adresse +'</p></div></div>';
            htmlResultat+='<a href="/calendrier/'+ reservation[i].id_rendez_vous +'" class="btn btn-primary" role="button">Reserver</a><hr class="mt-4">';
          }
        }

        var data={
          resultat:htmlResultat
        }

        return h.view('client/disponnibilite',data,{layout:'clientOui'});
      }
    }
  },
  //route update de la réservation du rendezvous
  {
    method: 'GET',
    path: '/calendrier/{id*}',
    config:{
      auth:{
        strategy:'session',
        scope:['clientOui']
      },
      handler:async(request,h) =>{
        var param = request.params || {};

        var usager= await Client.findOne({where:{id_client:request.auth.credentials.id}});
        var enfant= await Client.findOne({where:{id_parent1:usager.id_client}});
        var parent2, parent1;
        if(!enfant){
          enfant= await Client.findOne({where:{id_parent2:usager.id_client}});
          if(!enfant){
            enfant=usager;
            parent1 = await Client.findOne({where:{id_client:enfant.id_parent1}});
            parent2 = await Client.findOne({where:{id_client:enfant.id_parent2}});
          }
          else{
            parent2 = usager;
            parent1 = await Client.findOne({where:{id_client:enfant.id_parent1}});
          }
        }
        else{
          parent1 = usager;
          parent2 = await Client.findOne({where:{id_client:enfant.id_parent2}});
        }


        var reservation = await RendezVous.findOne({where:{id_rendez_vous:param.id}})

        reservation.id_client=enfant.id_client;
        reservation.disponibilite=false;

        reservation.save();

        return h.redirect('/calendrier');
      }
    }
  },
  //page des réservations des clients
  {
    method: 'GET',
    path: '/reservation',
    config:{
      auth:{
        strategy:'session',
        scope:['clientOui','clientNon']
      },
      handler:async(request,h) =>{
        var usager= await Client.findOne({where:{id_client:request.auth.credentials.id}});
        var parent1,parent2;
        var enfant= await Client.findOne({where:{id_parent1:usager.id_client}});

        if(!enfant){
          enfant= await Client.findOne({where:{id_parent2:usager.id_client}});
          if(!enfant){
            enfant=usager;
            parent1 = await Client.findOne({where:{id_client:enfant.id_parent1}});
            parent2 = await Client.findOne({where:{id_client:enfant.id_parent2}});
          }
          else{
            parent2 = usager;
            parent1 = await Client.findOne({where:{id_client:enfant.id_parent1}});
          }
        }
        else{
          parent1 = usager;
          parent2 = await Client.findOne({where:{id_client:enfant.id_parent2}});
        }

        var today=new Date();
        var htmlResultat='';
        var reservation = await RendezVous.findAll({
          where:{id_client:enfant.id_client},
          order:[
            ['date','ASC']
          ]
        });

        if(reservation.length<=0)htmlResultat+="<div class='text-center'>Vous n'avez pas de réservations</div>";
        else{
          var psychologue = await Psychologue.findOne({where:{id_psychologue:reservation[0].id_psychologue}});

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

            console.log(mois);

            htmlResultat+='<div class="row ml-4"><div class="col-4"><p>ID Rendez-Vous: '+ reservation[i].id_rendez_vous +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Psychologue: '+ psychologue.prenom +' '+ psychologue.nom +'</p></div></div>';
            htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Date: '+ date +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Heure: '+ heureDebut +' à '+ heureFin +'</p></div></div>';
            htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Ville: '+ reservation[i].ville +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Adresse: '+ reservation[i].adresse +'</p></div></div><hr class="mt-4">';

          }
        }

        var data={
          resultat:htmlResultat
        }


        if(request.auth.credentials.scope=='clientOui') return h.view('client/reservation',data,{layout:'clientOui'});
        else return h.view('client/reservation',data,{layout:'clientNon'});
      }
    }
  },
  //affiche les reservations future du client
  {
    method: 'GET',
    path: '/reservation/future',
    config:{
      auth:{
        strategy:'session',
        scope:['clientOui','clientNon']
      },
      handler:async(request,h) =>{
        var usager= await Client.findOne({where:{id_client:request.auth.credentials.id}});
        var parent1,parent2;
        var enfant= await Client.findOne({where:{id_parent1:usager.id_client}});

        if(!enfant){
          enfant= await Client.findOne({where:{id_parent2:usager.id_client}});
          if(!enfant){
            enfant=usager;
            parent1 = await Client.findOne({where:{id_client:enfant.id_parent1}});
            parent2 = await Client.findOne({where:{id_client:enfant.id_parent2}});
          }
          else{
            parent2 = usager;
            parent1 = await Client.findOne({where:{id_client:enfant.id_parent1}});
          }
        }
        else{
          parent1 = usager;
          parent2 = await Client.findOne({where:{id_client:enfant.id_parent2}});
        }

        var today=new Date();
        var htmlResultat='';
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

        if(reservation.length<=0)htmlResultat+="<div class='text-center'>Vous n'avez pas de réservations</div>";
        else{
          var psychologue = await Psychologue.findOne({where:{id_psychologue:reservation[0].id_psychologue}});

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

            console.log(mois);

            htmlResultat+='<div class="row ml-4"><div class="col-4"><p>ID Rendez-Vous: '+ reservation[i].id_rendez_vous +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Psychologue: '+ psychologue.prenom +' '+ psychologue.nom +'</p></div></div>';
            htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Date: '+ date +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Heure: '+ heureDebut +' à '+ heureFin +'</p></div></div>';
            htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Ville: '+ reservation[i].ville +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Adresse: '+ reservation[i].adresse +'</p></div></div>';
            htmlResultat+='<div class="row ml-4"><div class="col text-center"><a href="/calendrier/annule/'+ reservation[i].id_rendez_vous +'" class="btn btn-primary" role="button">Annuler</a></div></div><hr class="mt-4">';

          }
        }

        var data={
          resultat:htmlResultat
        }


        if(request.auth.credentials.scope=='clientOui') return h.view('client/reservation',data,{layout:'clientOui'});
        else return h.view('client/reservation',data,{layout:'clientNon'});
      }
    }
  },
  //annule réservation client
  {
    method: 'GET',
    path: '/calendrier/annule/{id*}',
    config:{
      auth:{
        strategy:'session',
        scope:['clientOui']
      },
      handler:async(request,h) =>{
        var param = request.params || {};
        var reservation = await RendezVous.findOne({where:{id_rendez_vous:param.id}});

        reservation.destroy();

        return h.redirect('/reservation/future');
      }
    }
  },
  //affiche les réservations anciennes du client
  {
    method: 'GET',
    path: '/reservation/ancienne',
    config:{
      auth:{
        strategy:'session',
        scope:['clientOui','clientNon']
      },
      handler:async(request,h) =>{
        var usager= await Client.findOne({where:{id_client:request.auth.credentials.id}});
        var parent1,parent2;
        var enfant= await Client.findOne({where:{id_parent1:usager.id_client}});

        if(!enfant){
          enfant= await Client.findOne({where:{id_parent2:usager.id_client}});
          if(!enfant){
            enfant=usager;
            parent1 = await Client.findOne({where:{id_client:enfant.id_parent1}});
            parent2 = await Client.findOne({where:{id_client:enfant.id_parent2}});
          }
          else{
            parent2 = usager;
            parent1 = await Client.findOne({where:{id_client:enfant.id_parent1}});
          }
        }
        else{
          parent1 = usager;
          parent2 = await Client.findOne({where:{id_client:enfant.id_parent2}});
        }

        var today=new Date();
        var htmlResultat='';
        var reservation = await RendezVous.findAll({
          where:{
            [Op.and]:[
              {id_client:enfant.id_client},
              {date:{[Op.lt]:today}}
            ]
          },
          order:[
            ['date','ASC']
          ]
        });

        if(reservation.length<=0)htmlResultat+="<div class='text-center'>Vous n'avez pas de réservations</div>";
        else{
          var psychologue = await Psychologue.findOne({where:{id_psychologue:reservation[0].id_psychologue}});

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

            console.log(mois);

            htmlResultat+='<div class="row ml-4"><div class="col-4"><p>ID Rendez-Vous: '+ reservation[i].id_rendez_vous +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Psychologue: '+ psychologue.prenom +' '+ psychologue.nom +'</p></div></div>';
            htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Date: '+ date +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Heure: '+ heureDebut +' à '+ heureFin +'</p></div></div>';
            htmlResultat+='<div class="row ml-4 mt"><div class="col-4"><p>Ville: '+ reservation[i].ville +'</p></div>';
            htmlResultat+='<div class="col-7 ml-2"><p>Adresse: '+ reservation[i].adresse +'</p></div></div><hr class="mt-4">';

          }
        }

        var data={
          resultat:htmlResultat
        }


        if(request.auth.credentials.scope=='clientOui') return h.view('client/reservation',data,{layout:'clientOui'});
        else return h.view('client/reservation',data,{layout:'clientNon'});
      }
    }
  }
];
