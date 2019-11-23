const Sequelize =require('sequelize');
const sequelize = require('../models.js');
const Psychologue = require('./psychologue.js');
const Client = require('./client.js');
const PlageHoraire = require('./plagehoraire.js');

const RendezVous = sequelize.define('rendezvous',{
  id_rendez_vous:{
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true
  },
  prefix:{
    type:Sequelize.STRING,
    defaultValue: 'R'
  },
  date:{type:Sequelize.DATEONLY},
  adresse:{type:Sequelize.STRING},
  ville:{type:Sequelize.STRING},
  disponibilite:{
    type:Sequelize.BOOLEAN,
    defaultValue: true
  },
  note:{
    type:Sequelize.STRING,
    allowNull:true,
  },
  id_psychologue:{
    type:Sequelize.INTEGER,
    references:{
      model:Psychologue,
      key:'id_psychologue'
    }
  },
  id_client:{
    type:Sequelize.INTEGER,
    allowNull:true,
    references:{
      model:Client,
      key:'id_client'
    }
  },
  id_plage_horaire:{
    type:Sequelize.INTEGER,
    allowNull:true,
    references:{
      model:PlageHoraire,
      key:'id_plage_horaire'
    }
  }
},{
  tableName:'rendezvous',
  timestamps: false,
});

RendezVous.belongsTo(Psychologue,{foreignKey:'id_psychologue', targetKey:'id_psychologue'});
RendezVous.belongsTo(Client,{foreignKey:'id_client', targetKey:'id_client', allowNull:true});
RendezVous.belongsTo(PlageHoraire,{foreignKey:'id_plage_horaire', targetKey:'id_plage_horaire'});

RendezVous.sync();

module.exports=RendezVous
