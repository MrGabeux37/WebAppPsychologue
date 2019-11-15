const Sequelize =require('sequelize');
const sequelize = require('../models.js')

const Client = sequelize.define('client',{
  id_client:{
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true
  },
  prefix:{
    type:Sequelize.STRING,
    defaultValue: 'C'
  },
  nom:{type:Sequelize.STRING},
  prenom:{type:Sequelize.STRING},
  date_de_naissance:{type:Sequelize.DATEONLY} ,
  sexe:{type:Sequelize.STRING},
  courriel:{
    type:Sequelize.STRING,
    alowNull:true,
    validate:{isEmail:true},
    unique: true
  },
  num_telephone:{type:Sequelize.STRING},
  permission:{
    type:Sequelize.BOOLEAN,
    defaultValue: false
  },
  mot_de_passe:{
    type:Sequelize.STRING,
    allowNull:true
  }
},{
  tableName:'client',
  timestamps: false,
});

Client.belongsTo(Client,{foreignKey:'id_parent1',targetKey:'id_client',allowNull:true});
Client.belongsTo(Client,{foreignKey:'id_parent2',targetKey:'id_client',allowNull:true});

Client.sync();

module.exports=Client
