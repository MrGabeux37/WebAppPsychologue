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
const Sequelize =require('sequelize');
const Op = Sequelize.Op;

const Routes = [
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

      var data={
        resultat:htmlResultat
      }

      return h.view('client/calendar',data,{layout:'clientOui'});
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

      var data={
        resultat:htmlResultat
      }


      if(request.auth.credentials.scope=='clientOui') return h.view('client/reservation',data,{layout:'clientOui'});
      else return h.view('client/reservation',data,{layout:'clientNon'});
    }
  }
},
//affiche les reservation future du client
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

      var data={
        resultat:htmlResultat
      }


      if(request.auth.credentials.scope=='clientOui') return h.view('client/reservation',data,{layout:'clientOui'});
      else return h.view('client/reservation',data,{layout:'clientNon'});
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

      var data={
        resultat:htmlResultat
      }


      if(request.auth.credentials.scope=='clientOui') return h.view('client/reservation',data,{layout:'clientOui'});
      else return h.view('client/reservation',data,{layout:'clientNon'});
    }
  }
},
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
        resultat+='<div class="row"><div class="col">';
        resultat+='<a href="/clients/'+ clients[i].id_client +'" style="color: black; text-decoration: none;">Nom: '+clients[i].nom+'</a></div>';
        resultat+='<div class="col"><a href=/clients/"'+ clients[i].id_client +'" style="color: black; text-decoration: none;">Prénom: '+clients[i].prenom+'</a></div> </div>';
        resultat+='<div class="row mt-2"><div class="col">';
        resultat+='<a href=/clients/"'+ clients[i].id_client +'" style="color: black; text-decoration: none;">Date de naissance: '+clients[i].date_de_naissance+' </a></div>'

        var permission='';
        if(clients[i].permission)permission='Oui';
        else permission='Non';

        resultat+='<div class="col"><a href=/clients/"'+ clients[i].id_client +'" style="color: black; text-decoration: none;">Permisson: '+permission+' </a>'
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
      var htmlResultat='<h6 class="text-center mb-3">Réservations</h6><hr class="mt-4">';
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

      if(reservation.length!=0){
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
      else htmlResultat+="<div class='text-center'>Ce client n'a pas de réservations</div>";

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
        resultat+='<div class="row"><div class="col">';
        resultat+='<a href="/clients/'+ client[i].id_client +'" style="color: black; text-decoration: none;">Nom: '+client[i].nom+'</a></div>';
        resultat+='<div class="col"><a href=/clients/"'+ client[i].id_client +'" style="color: black; text-decoration: none;">Prénom: '+client[i].prenom+'</a></div> </div>';
        resultat+='<div class="row mt-2"><div class="col">';
        resultat+='<a href=/clients/"'+ client[i].id_client +'" style="color: black; text-decoration: none;">Date de naissance: '+client[i].date_de_naissance+' </a></div>'

        var permission='';
        if(client[i].permission)permission='Oui';
        else permission='Non';

        resultat+='<div class="col"><a href=/clients/"'+ client[i].id_client +'" style="color: black; text-decoration: none;">Permisson: '+permission+' </a>'
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
//page des réservations pour le psychologue
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

      for(var i=0;i<reservation.length;i++){
        var nom_client='';
        var prenom_client='';
        var disponnible='Oui';
        var plage= await PlageHoraire.findOne({where:{id_plage_horaire:reservation[i].id_plage_horaire}});

        console.log(reservation[i].disponibilite);

        if(reservation[i].disponibilite==false){
          enfant = await Client.findOne({where:{id_client:reservation[i].id_client}})
          nom_client = enfant.nom;
          prenom_client = enfant.prenom;
          disponnible = 'non'
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

      var data={
        resultat:htmlResultat
      }

      return h.view('psychologue/calendar',data,{layout:'psychologue'});
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
];

module.exports = Routes
