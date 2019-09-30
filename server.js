'use strict'

const Hapi = require('hapi');
const Mysql = require('mysql');
const Path = require('path');
const Handlebars = require('handlebars');
const HandlebarsRepeatHelper = require('handlebars-helper-repeat');

Handlebars.registerHelper('repeat', HandlebarsRepeatHelper)

//connection de la base de données
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
    },
    {
      plugin: require('./web/base')
    }
  ]);

  await server.start()
  console.log('Server running at: '+server.info.uri);

  const viewsPath = Path.resolve(__dirname,'views');

  server.views({
    engines:{
      html: Handlebars
    },
    path: viewsPath,
    layoutPath: Path.resolve(viewsPath, 'layout'),
    layout: 'home',
    partialsPath: Path.resolve(viewsPath, 'partials')
  });

};

start();
