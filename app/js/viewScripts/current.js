/**
 * current
 * Created by dcorns on 2/9/16
 * Copyright © 2016 Dale Corns
 */
'use strict';
var clientRoutes = require('../clientRoutes')();
module.exports = function current(){
  var tblActivity = document.getElementById('tbl-activity');
  var tblComplete = document.getElementById('tbl-complete');
  let btnAddNew = document.getElementById('btnAddNew');
  let frmActivity = document.getElementById('frmActivity');
  let frmBtnSave = document.getElementById('frmBtnSave');
  btnAddNew.addEventListener('click', function(){
    frmActivity.classList.toggle('hide');
    frmBtnSave.classList.toggle('hide');
  });
  frmBtnSave.addEventListener('click', function(){
    let data = {
      startDate: document.getElementById('frmStartDate').value,
      activity: document.getElementById('frmActivityLine').value,
      link: document.getElementById('frmLink').value,
      details: document.getElementById('frmDetail').value,
      type: document.getElementById('frmCategory').value,
      endDate: document.getElementById('frmEndDate').value
    };
    clientRoutes.saveData('saveActivity', data, function (err, data) {
      if(err){
        alert('Error saving data!');
        return;
      }
      alert('Activity Saved!');
    })
  });
  clientRoutes.getData('current', function(err, data){
    if(err){
      alert('No current data stored locally. Internet connection required');
      console.error(err);
      return;
    }
    buildActivityTable(data, tblActivity, tblComplete);
  });
  clientRoutes.getData('currentCategoryMenu', function(err, data){
    if(err){
      console.error(err);
      return;
    }
    buildMenu(data.json[0].activityCategories, document.getElementById('menu-activities-category'));
  });
};

function appendActivity(aObj, tbl, isComplete){
  var row = document.createElement('tr');
  var startDate = document.createElement('td');
  var activityLink = document.createElement('td');
  var activity = document.createElement('td');
  activity.innerText = aObj.activity;
  var endDate = isComplete ? document.createElement('td') : null;
  startDate.innerText = new Date(aObj.startDate).toLocaleDateString();
  if(aObj.link){
    var anchor = document.createElement('a'), anchorIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), anchorUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    anchor.href = aObj.link;
    anchorIcon.setAttribute('class', 'icon');
    anchorUse.setAttributeNS('http://www.w3.org/1999/xlink', 'href','#icon-link');
    anchorIcon.appendChild(anchorUse);
    anchor.appendChild(anchorIcon);
    activityLink.appendChild(anchor);
  }

  row.appendChild(activity);
  row.appendChild(activityLink);
  row.appendChild(startDate);
  if(endDate){
    endDate.innerText = new Date(aObj.endDate).toLocaleDateString();
    row.appendChild(endDate);
  }
  if(aObj['details']){
    addDetails(row, aObj.details);
  }
  tbl.appendChild(row);
}

function buildActivityTable(data, tblNow, tblOld){
  //Sort by start date using custom sort compare function
  data = data.json;
  data.sort(function(a, b){
    return new Date(a.startDate) - new Date(b.startDate);
  });
  var len = data.length;
  var c = 0;
  for(c; c < len; c++){
    if(!(data[c].endDate)){
      appendActivity(data[c], tblNow, false);
    }
    else{
      appendActivity(data[c], tblOld, true);
    }
  }
}
//addDetails
//Uses the activity-detail element from current.html and the hide class from layout.css
//Receives a tr element and activity details text
//prepends a button to click for details on the first td of the tr and adds an event listener to display or hide the details below the row when the button is clicked.
function addDetails(rowIn, details){
  let btn = document.createElement('button');
  btn.textContent = '*';
  rowIn.setAttribute('data-details', details);

  btn.addEventListener('click', function(){
    let detailSection = document.getElementById('activity-detail');
    detailSection.classList.toggle('hide');
    if(!(detailSection.classList.contains('hide'))){
      let row = this.parentNode.parentNode;
      let rect = row.getBoundingClientRect();
      detailSection.style.left = `${rect.left + scrollX}px`;
      detailSection.style.top = `${rect.top + rect.height + scrollY}px`;
      detailSection.style.width = `${rect.width}px`;
      detailSection.innerHTML=row.getAttribute('data-details');
      detailSection.scrollIntoView();
    }
  });
  rowIn.childNodes[0].insertBefore(btn, rowIn.childNodes[0].childNodes[0]);
  //rowIn.childNodes[0].innerHTML = btn.outerHTML + rowIn.childNodes[0].innerHTML;
}

function buildMenu(data, menuElement){
  var menuCount = 0;
  data.forEach(function(item){
    let btn = document.createElement('button');
    btn.textContent = item;
    btn.value = menuCount;
    menuElement.appendChild(btn);
    menuCount++;
  });
}
