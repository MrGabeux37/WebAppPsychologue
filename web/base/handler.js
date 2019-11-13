'use strict'

exports.servePublicDirectory ={
  directory:{
    path: 'public'
  }
};

exports.registerCompte={
  function (request,h){
    if (request.auth.isAuthenticated) {
      return reply.view('client/profil')
    }
    var courriel = request.payload.inputCourriel;
    var user;
    connection.query('SELECT id_client, prefix, nom, prenom, courriel, permission, mot_de_passe FROM client WHERE courriel="' + courriel + '"', function (error, results, fields) {
      if (error) throw error;
      user=results;
    })

    if(!user){
      return reply(Boom.notFound('Personne avec ce courriel'))
    }

    var password = md5(request.payload.inputPassword);

    if(password==user.mot_de_passe){
      request.server.log('info','user authentication successful')
      request.cookieAuth.set(user);
      return h.view('client/profil')
    }

    return h.view('main/login')

  }
}
