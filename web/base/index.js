'use strict'

const Routes = require('./routes');

function register(server, options){
  server.dependency(['vision'])

  server.route(Routes)
}

exports.plugin = {
  name: 'base-routes-assets',
  version: '1.0.0',
  register
}
