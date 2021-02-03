const Sequelize = require('sequelize');

var dateToday = new Date();
var monthToday = dateToday.getMonth();
var monthSelect = monthToday;
var monthSelectName = whatMonth(monthToday);
var yearSelect = dateToday.getFullYear();
var tempDate = new Date(yearSelect,monthSelect,1);
var lastDay = new Date(yearSelect,(monthSelect+1),0);
console.log(lastDay);

const isWeekend = day => {
  return day%7===0 || day%7===6;
}

function whatMonth(month){
  switch(month%12){
    case 0: return "Janvier";
    case 1: return "Février";
    case 2: return "Mars";
    case 3: return "Avril";
    case 4: return "Mai";
    case 5: return "Juin";
    case 6: return "Juillet";
    case 7: return "Août";
    case 8: return "Septembre";
    case 9: return "Octobre";
    case 10: return "Novembre";
    case 11: return "Décembre";
  }
}

function whatDay(dayMonth){
  switch(dayMonth%7){
    case 0: return "Dimanche";
    case 1: return "Lundi";
    case 2: return "Mardi";
    case 3: return "Mercredi";
    case 4: return "Jeudi";
    case 5: return "Vendredi";
    case 6: return "Samedi";
  }
}

function reculeMois(){
  dateToday.setMonth(dateToday.getMonth()-1);
  console.log(dateToday);
  monthToday = dateToday.getMonth();
  monthSelect = monthToday;
  monthSelectName = whatMonth(monthToday);
  yearSelect = dateToday.getFullYear();
  tempDate = new Date(yearSelect,monthSelect,1);
  lastDay = new Date(yearSelect,(monthSelect+1),0);
  var cal = document.getElementById("calendrierPsycho");
  cal.innerHTML = '';
  var month = document.getElementById("month");
  month.innerHTML = '';
  init();
}

function avanceMois(){
  dateToday.setMonth(dateToday.getMonth()+1);
  console.log(dateToday);
  monthToday = dateToday.getMonth();
  monthSelect = monthToday;
  monthSelectName = whatMonth(monthToday);
  yearSelect = dateToday.getFullYear();
  tempDate = new Date( yearSelect , monthSelect , 1 );
  lastDay = new Date( yearSelect , (monthSelect+1) , 0 );
  var cal = document.getElementById("calendrierPsycho");
  cal.innerHTML = '';
  var month = document.getElementById("month");
  month.innerHTML = '';
  init();
}

function init(){

  var month = document.getElementById("month");
  console.log(month);
  var cal = document.getElementById("calendrierPsycho");
  console.log(cal);


  month.insertAdjacentHTML("beforeend",` <button onclick="reculeMois()"> < </button> <div>${monthSelectName}</div> <button onclick="avanceMois()"> > </button>`);

  //nom des jours avant le calendrier
  for(let week=1;week<=7;week++){
    const date = new Date(Date.UTC(2018,0,week));
    const options = {weekday : "long"};
    var dayname = new Intl.DateTimeFormat("fr-CA",options).format(date);
    cal.insertAdjacentHTML("beforeend",`<div class="name">${dayname}</div>`);
  }

  //fills blank before the first day;
  for(let day = 1 ; day<=tempDate.getDay() ; day++){
    const weekend = isWeekend(day);
    cal.insertAdjacentHTML("beforeend",`<div class="day ${weekend ? "weekend" : ""}"></div>`);
  }

  //month days
  for(let day = 1 ; day<=lastDay.getDate() ; day++){
    const date = new Date(yearSelect,monthSelect,day);
    const weekend = isWeekend(date.getDay());
    cal.insertAdjacentHTML("beforeend",`<div class="day ${weekend ? "weekend" : ""}">${day}</div>`);
  }

  //fills blank after the last day;
  for(let day = lastDay.getDay() ; day<6 ; day++){
    const weekend = isWeekend(day);
    cal.insertAdjacentHTML("beforeend",`<div class="day ${weekend ? "weekend" : ""}"></div>`);
  }

  document.querySelectorAll("#calendrierPsycho .day").forEach(day => {
      day.addEventListener("click", event => {
        event.currentTarget.classList.toggle("selected");
      });
  });
}
window.onload = init;
