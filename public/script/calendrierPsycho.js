(function(window, document, undefined){

// code that should be taken care of right away

window.onload = init;

  function init(){
    const cal = document.getElementById("calendrierPsycho");
    console.log(cal);
    for(let day = 1 ; day<=31 ; day++){
      cal.insertAdjacentHTML("beforeend",`<div class="day">${day}</div>`);
      console.log(day);

    }
  }

})(window, document, undefined);
