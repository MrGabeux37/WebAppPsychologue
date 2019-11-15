const Hoek = require('hoek')

async function register (server, options) {
  // register dependency to hapi-auth-cookie
  // and make sure it’s available to this plugin
  await server.register({
    plugin: require('hapi-auth-cookie')
  })

  // configure the "session" strategy
  server.auth.strategy('session', 'cookie', {
    cookie:{
      password:'m!*"2/),p4:xDs%KEgVr7;e#85Ah^WYC',
      name:'sid',
      isSecure: false
    },
    redirectTo: '/',

  });

  //server.auth.default('session');

}

exports.plugin = {
  register,
  name: 'authentication',
  version: '1.0.0',
  once: true
}
