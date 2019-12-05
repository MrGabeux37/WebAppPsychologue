const Sequelize =require('sequelize');

//configuration de la connection
const sequelize= new Sequelize('manon_psychologie', 'root', 'SqlAdmin',{ //password
  host:'localhost',
  port:3306,
  dialect:'mysql',
  pool:{
    max:15,
    min:0,
    idle:10000
  }
})

//
sequelize.authenticate().then(function(err){
  console.log('connection sucess');
}).catch(function(err){
  console.log('Unable to connect to the database: ', err);
});

module.exports=sequelize
