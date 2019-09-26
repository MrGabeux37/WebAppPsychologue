'use strict'

const Hapi = require('hapi');
const Mysql = require('mysql');


var connection = Mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'password',
  database:'hapijslogin'
});



connection.connect(function(err){
  if(err){
    console.error('error connecting: ' + err.stack);
    return
  }

  console.log('connected as id ' + connection.threadId);
});

const server = new Hapi.Server({
  host: 'localhost',
  port: 3000
});

async function start (){
  await server.register({
    plugin: require('vision')
  });
  await server.start()
  console.log('Server running at: '+server.info.uri);

  server.route([{
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return h.view('index');
      }
  },
  {
    method: 'POST',
    path: '/register',
    handler: (request, h) =>{
      const payload = request.query;
      console.log(payload.first);

      connection.query('INSERT INTO users (first_name,last_name,email,password) VALUES ("' + payload.first + '","' + payload.last_name + '","' + payload.email + '","' + payload.password + '")', function (error, results, fields) {
            if (error) throw error;
            console.log(results);
            return results;
      })
      return payload
    }
  }
  ]);

  server.views({
    engines:{
      html: require('handlebars')
    },
    path: __dirname + '/views',
    layoutPath: 'views/layout',
    layout: 'home'
  });

};

start();
