const Hapi = require('hapi');

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
  }]);

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
