'use strict'

const Hapi = require('hapi');
const Path = require('path');
const Handlebars = require('handlebars');
const HandlebarsRepeatHelper = require('handlebars-helper-repeat');

Handlebars.registerHelper('repeat', HandlebarsRepeatHelper)

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

  const viewsPath = Path.resolve(__dirname,'public','views');

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
