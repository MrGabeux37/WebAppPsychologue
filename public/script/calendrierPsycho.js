(function(window, document, undefined){

// code that should be taken care of right away

window.onload = init;

  function init(){

    const cal = document.getElementById("calendrierPsycho");
    console.log(cal);

    const isWeekend = day => {
      return day%7===0 || day%7===6;
    }

    for(let day = 1 ; day<=35 ; day++){

      const date = new Date(Date.UTC(2018,0,day));
      const options = {weekday : "short"}
      var dayname;

      if(day<=7){
        dayName = new Intl.DateTimeFormat("en-US",options).format(date);
      }
      else dayName="";
      const weekend = isWeekend(day);
      console

      cal.insertAdjacentHTML("beforeend",`<div class="day ${weekend ? "weekend" : ""}"><div class="name">${dayName}</div>${day}</div>`);

    }

    document.querySelectorAll("#calendrierPsycho .day").forEach(day => {
        day.addEventListener("click", event => {
          event.currentTarget.classList.toggle("selected");
        });
    });


  }

})(window, document, undefined);
