function onClickSubmit(){

  //assigne les passwords
  var firstPW = document.getElementById("firstPW").innerHTML ;
  var confirmPW = document.getElementById("confirmPW").innerHTML ;
  var node = document.createElement("P");
  var testnode = document.createTextNode("Le second mot de passe n'est pas identique au premier");

  node.appendChild(textnode);
  node.id="alertPW";
  node.style.color="red";

  if(firstPW!=confirmPW){
    document.getElementById("alertPW").appendChild(node);
  }
  else{
    document.getElementById("alertPW").removeChild();
  }



}

//selection famille monoparentale
function onSelectMono(checkbox){
  if(checkbox.checked == true){
    document.getElementById("nom_parent2").disabled=true;
    document.getElementById("prenom_parent2").disabled=true;
    document.getElementById("date_de_naissance_parent2").disabled=true;
    document.getElementById("btnradio2").disabled=true;
    document.getElementById("btnradio3").disabled=true;
    document.getElementById("courriel_parent2").disabled=true;
    document.getElementById("num_telephone_parent2").disabled=true;
  }
  else{
    document.getElementById("nom_parent2").disabled=false;
    document.getElementById("prenom_parent2").disabled=false;
    document.getElementById("date_de_naissance_parent2").disabled=false;
    document.getElementById("btnradio2").disabled=false;
    document.getElementById("btnradio3").disabled=true;
    document.getElementById("courriel_parent2").disabled=false;
    document.getElementById("num_telephone_parent2").disabled=false;
  }
}

//selection courriel_enfant
function onSelectCourrielEnfant(checkbox){
  if(checkbox.checked == true){
    document.getElementById("courriel_enfant").disabled=true;
  }
  else{
    document.getElementById("courriel_enfant").disabled=false;
  }

}
