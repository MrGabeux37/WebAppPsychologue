'use strict'

const Handlers = require('./handler');
const Mysql = require('mysql');
const Boom = require('boom');
const Jsdom = require('jsdom');
const md5 = require('md5');
const Sequelize =require('sequelize');
const Op = Sequelize.Op;
const Client = require('./models/client.js');
const Psychologue = require('./models/psychologue.js');
const PlageHoraire = require('./models/plagehoraire.js');
const RendezVous = require('./models/rendezvous.js');
var routeBase = require('./routing/base.js');
var routePsycho = require('./routing/routePsycho.js');
var routeClient = require('./routing/routeClient.js');
var routeCreation = require('./routing/routeCreation.js');


module.exports = [].concat(routeBase,routePsycho,routeClient,routeCreation);
