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
