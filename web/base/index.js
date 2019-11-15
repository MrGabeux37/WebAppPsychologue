'use strict'

const Routes = require('./routes');
const Handlebars = require('handlebars');
const HandlebarsRepeatHelper = require('handlebars-helper-repeat');
const Path = require('path');

Handlebars.registerHelper('repeat', HandlebarsRepeatHelper)

async function register(server, options){
  await server.register([
    {
      plugin:require('./authentication.js')
    },
    {
      plugin:require('vision')
    },
    {
      plugin:require('inert')
    },
  ])

  const viewsPath = Path.resolve(__dirname,'../../','./public/views');

//configuration de methode views pour coter client du serveur
  await server.views({
    engines:{
      html: Handlebars
    },
    path: viewsPath,
    layoutPath: Path.resolve(viewsPath, 'layout'),
    layout: 'home',
    partialsPath: Path.resolve(viewsPath, 'partials')
  });

  server.route(Routes)
};

exports.plugin = {
  name: 'base-routes-assets',
  version: '1.0.0',
  once:true,
  register
}
