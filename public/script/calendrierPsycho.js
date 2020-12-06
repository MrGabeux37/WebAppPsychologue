(function(window, document, undefined){

// code that should be taken care of right away

window.onload = init;

  function init(){

    const cal = document.getElementById("calendrierPsycho");
    console.log(cal);

    const isWeekend = day => {
      return day%7===0 || day%7===6;
    }

    for(let week=1;week<=7;week++){

      const date = new Date(Date.UTC(2018,0,week));
      const options = {weekday : "short"}
      var dayname = new Intl.DateTimeFormat("en-US",options).format(date);

      cal.insertAdjacentHTML("beforeend",`<div class="name">${dayname}</div>`);
    }

    for(let day = 1 ; day<=35 ; day++){

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
