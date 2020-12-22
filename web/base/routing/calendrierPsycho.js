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

      var day1,day2,day3,day4,day5,day6,day7,day8,day9,day10,day11,day12,day13,day14,day15,day16,day17,day18,day19,day20,day21,day22,day23,day24,day25,day26,day27,day28,day29,day30,day31;

      var data={
        day1:'caca',
        day2:'',
        day3:'',
        day4:'',
        day5:'',
        day6:'',
        day7:'',
        day8:'',
        day9:'',
        day10:'',
        day11:'',
        day12:'',
        day13:'',
        day14:'',
        day15:'',
        day16:'',
        day17:'',
        day18:'',
        day19:'',
        day20:'',
        day21:'',
        day22:'',
        day23:'',
        day24:'',
        day25:'',
        day26:'',
        day27:'',
        day28:'',
        day29:'',
        day30:'',
        day31:''
      }

      return h.view('psychologue/calendar',data,{layout:'psychologue'});
    }
  }
];
