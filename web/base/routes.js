'use strict'

var routeBase = require('./routing/base.js');
var routePsycho = require('./routing/routePsycho.js');
var routeClient = require('./routing/routeClient.js');
var routeCreation = require('./routing/routeCreation.js');
var routeCalendrierPsycho = require('./routing/calendrierPsycho.js');


module.exports = [].concat(routeBase,routePsycho,routeClient,routeCreation,routeCalendrierPsycho);
