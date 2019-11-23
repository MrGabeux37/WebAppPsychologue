const Sequelize =require('sequelize');
const sequelize = require('../models.js')

const PlageHoraire = sequelize.define('plagehoraire',{
  id_plage_horaire:{
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true
  },
  prefixe:{
    type:Sequelize.STRING,
    defaultValue: 'PH'
  },
  heure_debut:{
    type: Sequelize.TIME
  },
  heure_fin:{
    type: Sequelize.TIME
  }
},{
  tableName:'plagehoraire',
  timestamps: false,
});

PlageHoraire.sync();

module.exports=PlageHoraire
