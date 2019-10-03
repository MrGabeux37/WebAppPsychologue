'use strict'
const Mysql = require('mysql');

//connection de la base de données
var connection = Mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'password',
  database:'manon_psychologie'
});

const Routes = [



{
  method: 'GET',
  path: '/',
  handler: (request, h) => {
    return h.view('main/login');
  }
},

{
  method: 'POST',
  path: '/register',
  handler: (request, h) =>{
    const payload = request.query;
    console.log(payload.first);

    connection.query('INSERT INTO psychologue (nom,prenom,courriel,num_telephone,mot_de_passe) VALUES ("' + payload.last + '","' + payload.first + '","' + payload.email + '","' + payload.phone + '",MD5(\'"' + payload.password + '"\'))', function (error, results, fields) {
          if (error) throw error;
          console.log(results);
          return results;
    })
    return payload
  }
},

{
  method: 'GET',
  path: '/image/{file*}',
  handler:{
    directory:{
      path: 'public',
      listing: true
    }
  }
}
]

module.exports = Routes