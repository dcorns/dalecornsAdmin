/**
 * profileAboutMe
 * Created by dcorns on 3/22/16
 * Copyright © 2016 Dale Corns
 */
'use strict';
const doAjax = require('do-ajax');
module.exports = function profileAboutMe(){
  let mainHeaderIn = document.getElementById('mainHeaderIn');
  let myProfile = JSON.parse(localStorage.getItem('myProfile'));
  let mainHeader = document.getElementById('mainHeader');
  let aboutMeText = document.getElementById('aboutMeText'), aboutMeSave = document.getElementById('aboutMeSave');
  let aboutMeHeading = document.getElementById('aboutMeHeading'), addSection = document.getElementById('addSection');
  let aboutMePreview = document.getElementById('aboutMePreview');
  let aboutMe = myProfile.about.subText || []; //store an array of heading/details pair objects
  let idx = aboutMe.length; //index of header/details group being edited
  let header, details;
  //initialize with existing data from local storage
  mainHeader.textContent = myProfile.about.mainHeader || '';
  mainHeaderIn.value = myProfile.about.mainHeader || '';
  for(var i=0; i < idx; i++){
    newSection(i);
    document.getElementById('header' + i).textContent = aboutMe[i].heading;
    document.getElementById('details' + i).textContent = aboutMe[i].details;
  }
  //prep for adding input
  newSection(idx);
  
  aboutMeSave.addEventListener('click', function(){
    myProfile.about = aboutMe;
    let data = {profileId: myProfile.profileId, aboutMe: aboutMe, aboutMeHeader: mainHeader.textContent};
    doAjax.ajaxPostJson('/saveProfile', data, function(err, data){
      if(err) alert('There was a problem saving your changes ' + err);
      else{
        alert('About you data successfully updated');
        window.localStorage.setItem('myProfile', JSON.stringify(myProfile));
      }
    }, localStorage.getItem('DRCToken'));
  });

  //bind input to output fields
  mainHeaderIn.addEventListener('keyup', function(){
    mainHeader.textContent = mainHeaderIn.value;
  });
  aboutMeHeading.addEventListener('keyup', function(){
    header.textContent = aboutMeHeading.value;
  });
  aboutMeText.addEventListener('keyup', function(){
    details.textContent = aboutMeText.value;
  });
  
  addSection.addEventListener('click', function(){
    idx = aboutMe.length;
    aboutMe.push({heading: aboutMeHeading.value, details: aboutMeText.value});
    newSection(idx);
    aboutMeHeading.value = '';
    aboutMeText.value = '';
    idx++
  });
  
  function newSection(idx){
    header = document.createElement('h3');
    details = document.createElement('p');
    header.setAttribute('id', 'header' + idx);
    details.setAttribute('id', 'details' + idx);
    aboutMePreview.appendChild(header);
    aboutMePreview.appendChild(details);
  }
  
};