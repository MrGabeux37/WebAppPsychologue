'use strict'

const Routes = [

{
  method: 'GET',
  path: '/',
  handler: (request, h) => {
    return h.view('login/login');
  }
},

{
  method: 'POST',
  path: '/register',
  handler: (request, h) =>{
    const payload = request.query;
    console.log(payload.first);

    connection.query('INSERT INTO users (first_name,last_name,email,password) VALUES ("' + payload.first + '","' + payload.last + '","' + payload.email + '","' + payload.password + '")', function (error, results, fields) {
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
      path: 'views/login',
      listing: true
    }
  }
}
]

module.exports = Routes
