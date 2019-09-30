'use strict'

const Hapi = require('hapi');
const Mysql = require('mysql');
const Routes = require('./routes');


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
  await server.register([
    {
      plugin: require('vision')
    },
    {
      plugin: require('inert')
    }
  ]);

  await server.start()
  console.log('Server running at: '+server.info.uri);

  server.route(Routes);

  server.views({
    engines:{
      html: require('handlebars')
    },
    path: __dirname + '/views',
    layoutPath: 'views/layout',
    layout: 'home',
    partialsPath: 'views/partials'
  });

};

start();
