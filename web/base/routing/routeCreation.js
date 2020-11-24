'use strict'

const Handlers = require('./handler');
const Mysql = require('mysql');
const Boom = require('boom');
const Jsdom = require('jsdom');
const md5 = require('md5');
const Client = require('./models/client.js');
const Psychologue = require('./models/psychologue.js');
const PlageHoraire = require('./models/plagehoraire.js');
const RendezVous = require('./models/rendezvous.js');
const Sequelize =require('sequelize');
const Op = Sequelize.Op;
