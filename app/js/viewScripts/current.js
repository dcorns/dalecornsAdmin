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
  let btnActivityMenu = document.getElementById('btn-activity-menu');
  let activityMenu = document.getElementById('menu-activities-category');
  btnActivityMenu.addEventListener('click', function(){
    activityMenu.classList.toggle('hide');
  });
  let typeIdx = window.sessionStorage.getItem('typeIndex') || '0';
  //region Admin Only
  let btnAddNew = document.getElementById('btnAddNew');
  let frmActivity = document.getElementById('frmActivity');
  let frmBtnSave = document.getElementById('frmBtnSave');
  btnAddNew.addEventListener('click', function(){
    frmActivity.classList.toggle('hide');
    frmBtnSave.classList.toggle('hide');
  });
  frmBtnSave.addEventListener('click', function(){
    console.log('updateId', window.localStorage.getItem('updateId'));
    let data = {
      id: window.localStorage.getItem('updateId'),
      updates: {
        startDate: document.getElementById('frmStartDate').value,
        activity: document.getElementById('frmActivityLine').value,
        link: document.getElementById('frmLink').value,
        details: document.getElementById('frmDetail').value,
        type: window.sessionStorage.getItem('typeIndex') || '0',
        endDate: document.getElementById('frmEndDate').value
      }
    };
    clientRoutes.saveData('saveActivity', data, function (err, data) {
      if(err){
        alert('Error saving data!');
        return;
      }
      alert('Activity Saved!');
      window.localStorage.setItem('updateId', '');
    })
  });
  //endregion
  clientRoutes.getData('current?typeIndex=' + typeIdx, function(err, data){
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
    buildMenu(data.json[0].activityCategories, activityMenu);
  });
};
//expects tbl to be a tbody element
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

  //region Admin Only 2
  let btnEdit = document.createElement('button');
  let editColumn = document.createElement('td');
  btnEdit.textContent = 'EDIT';
  btnEdit.value = aObj._id;
  btnEdit.addEventListener('click', function(e){
    let frmActivity = document.getElementById('frmActivity');
    let frmBtnSave = document.getElementById('frmBtnSave');
    let targetRow = document.getElementById(e.target.value);
    frmActivity.classList.toggle('hide');
    frmBtnSave.classList.toggle('hide');
    document.getElementById('frmStartDate').value = targetRow.dataset.startdate;
    document.getElementById('frmActivityLine').value = targetRow.dataset.activity;
    document.getElementById('frmLink').value = targetRow.dataset.link;
    document.getElementById('frmDetail').value = targetRow.dataset.details;
    document.getElementById('frmEndDate').value = targetRow.dataset.enddate;
    window.localStorage.setItem('updateId', e.target.value);
  });
  editColumn.appendChild(btnEdit);

  //region Time Log Logic
  let btnTimeLog = document.createElement('button');
  btnTimeLog.textContent = 'TimeLog';
  btnTimeLog.value = aObj._id;
  btnTimeLog.addEventListener('click', function(e){
    console.dir(e.target.value);
    console.dir(e.target.parentElement);
    let spn = document.createElement('span');
    spn.id = 'tblhere';
    e.target.parentElement.appendChild(spn);
    mySkills.route('time-log-table', 'tblhere');
  });
  editColumn.appendChild(btnTimeLog);
  if(aObj['timelog']){
    // display existing data in table or set it up for display
  }
  //endregion
  row.appendChild(editColumn);
  row.id = aObj._id;
  row.setAttribute('data-startdate', aObj.startDate);
  row.setAttribute('data-activity', aObj.activity);
  row.setAttribute('data-link', aObj.link);
  row.setAttribute('data-enddate', aObj.endDate);

  //endregion

  tbl.appendChild(row);
}
//expects tblNow and tblOld to be tbody elements
function buildActivityTable(data, tblNow, tblOld){
  //Sort by start date using custom sort compare function
  data = data.json;
  data.sort(function(a, b){
    return new Date(b.startDate) - new Date(a.startDate);
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
      //detailSection.scrollIntoView();
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
    btn.addEventListener('click', function(){
      var tblActivity = document.getElementById('tbl-activity');
      var tblComplete = document.getElementById('tbl-complete');
      tblActivity.innerHTML = '';
      tblComplete.innerHTML = '';
      window.sessionStorage.setItem('typeIndex', this.value);
      clientRoutes.getData('current?typeIndex=' + this.value, function(err, data){
        if(err){
          alert('No current data stored locally. Internet connection required');
          console.error(err);
          return;
        }
        buildActivityTable(data, tblActivity, tblComplete);
      });
    });
    menuElement.appendChild(btn);
    menuCount++;
  });
}