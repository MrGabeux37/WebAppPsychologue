'use strict'

const Mysql = require('mysql');
const Boom = require('boom');
const Jsdom = require('jsdom');
const md5 = require('md5');
const Sequelize =require('sequelize');
const Op = Sequelize.Op;
const Handlers = require('../handler');
const Client = require('../models/client.js');
const Psychologue = require('../models/psychologue.js');
const PlageHoraire = require('../models/plagehoraire.js');
const RendezVous = require('../models/rendezvous.js');

module.exports = [
  //test
  {
    method: 'GET',
    path:'/testing',
    options:{
      auth:false
    },
    handler:function (request, h) {


      return h.view('psychologue/calendar')
    }
  }
];
