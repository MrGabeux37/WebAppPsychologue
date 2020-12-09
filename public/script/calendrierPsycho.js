var backForthMonth=0;
console.log(backForthMonth);
const dateToday = new Date();
const monthToday = dateToday.getMonth();
var monthSelect = monthToday+backForthMonth;
var monthSelectName = whatMonth(monthToday+backForthMonth);
var yearSelect = dateToday.getFullYear();
const tempDate = new Date(yearSelect,monthSelect,1);
const lastDay = new Date(yearSelect,(monthSelect+1)%12,0);
console.log(lastDay.getDate());

const isWeekend = day => {
  return day%7===5 || day%7===6;
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
  if(backForthMonth==0)return backForthMonth=11;
  else return backForthMonth--;
}

function avanceMois(){
  if (backForthMonth==12) return backForthMonth==0;
  else return backForthMonth++;
}

(function(window, document, undefined){

// code that should be taken care of right away

window.onload = init;

  function init(){

    const cal = document.getElementById("calendrierPsycho");
    console.log(dateToday);

    cal.insertAdjacentHTML("beforebegin",`<div class="month"> <button onclick="reculeMois()"> < </button> <div>${monthSelectName}</div> <button onclick="avanceMois()"> > </button> </div>`);

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
      const weekend = isWeekend(day);
      cal.insertAdjacentHTML("beforeend",`<div class="day ${weekend ? "weekend" : ""}">${day}</div>`);
    }

    document.querySelectorAll("#calendrierPsycho .day").forEach(day => {
        day.addEventListener("click", event => {
          event.currentTarget.classList.toggle("selected");
        });
    });


  }

})(window, document, undefined);
