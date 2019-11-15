const Sequelize =require('sequelize');
const sequelize = require('../models.js')

const Psychologue = sequelize.define('psychologue',{
  id_psychologue:{
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true
  },
  prefix:{
    type:Sequelize.STRING,
    defaultValue: 'PS'
  },
  nom:{type:Sequelize.STRING},
  prenom:{type:Sequelize.STRING},
  courriel:{
    type:Sequelize.STRING,
    alowNull:true,
    validate:{isEmail:true},
    unique: true
  },
  num_telephone:{type:Sequelize.STRING},
  mot_de_passe:{type:Sequelize.STRING}
},{
  tableName:'psychologue',
  timestamps: false,
});

Psychologue.sync();

module.exports=Psychologue
