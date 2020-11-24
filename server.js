'use strict'

const Hapi = require('hapi');

const server = new Hapi.Server({
  host: 'localhost',
  port: 3000
});

//configuration des plugins
async function start (){

  await server.register([
    {
      plugin:require('./web/base/index.js')
    }
  ]);
  try{
    await server.start()
    console.log('Server running at: '+server.info.uri);
  }catch(err){
    console.log(err)
    process.exit(1)
  }
}
//depart serveur
start();
