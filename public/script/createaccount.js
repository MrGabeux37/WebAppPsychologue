function CheckPW(){

  //assigne les passwords
  var firstPW = document.getElementById("firstPW").value ;
  var confirmPW = document.getElementById("confirmPW").value ;

  if(firstPW!=confirmPW){
    document.getElementById("alertPW").innerHTML="Mots de passe non identiques ";
    document.getElementById("bouton").disabled=true;
  }
  else{
    document.getElementById("alertPW").innerHTML="";
    document.getElementById("bouton").disabled=false;
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
    document.getElementById("btnemail2").disabled=true;
  }
  else{
    document.getElementById("nom_parent2").disabled=false;
    document.getElementById("prenom_parent2").disabled=false;
    document.getElementById("date_de_naissance_parent2").disabled=false;
    document.getElementById("btnradio2").disabled=false;
    document.getElementById("btnradio3").disabled=false;
    document.getElementById("courriel_parent2").disabled=false;
    document.getElementById("num_telephone_parent2").disabled=false;
    document.getElementById("btnemail2").disabled=false;
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
