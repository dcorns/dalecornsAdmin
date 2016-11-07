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
    window.localStorage.setItem('current', JSON.stringify(data));
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
function appendActivity(aObj, tbl, hasEndDate){
  var row = document.createElement('tr');
  var startDate = document.createElement('td');
  var activityLink = document.createElement('td');
  var activity = document.createElement('td');
  activity.innerText = aObj.activity;
  var endDate = hasEndDate ? document.createElement('td') : null;
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

  //region Admin Only
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
  btnTimeLog.setAttribute('data-index', aObj.idx);
  btnTimeLog.addEventListener('click', function(e){
    //If no log table present display it, if it is present remove it and if a different instance of the button was pressed display the table for its respective row.
    let prevSpn = document.getElementById('tblhere');
    let sameInstanceOfButtonClicked = false;
    if(prevSpn){
      sameInstanceOfButtonClicked = e.target.parentElement == prevSpn.parentElement;
      prevSpn.parentElement.removeChild(prevSpn);
    }
    if(!(sameInstanceOfButtonClicked)){
      let tlDiv = document.createElement('div');
      tlDiv.id = 'tblhere';
      tlDiv.value = e.target.value;
      tlDiv.className='tblTimeLogContainer';
      tlDiv.setAttribute('data-index', e.target.dataset.index);
      e.target.parentElement.parentElement.appendChild(tlDiv);
      //calling a view and its associated script within another mySkills made gobal in index.
      mySkills.route('timeLogTable', 'tblhere');
    }
  });
  editColumn.appendChild(btnTimeLog);
  //endregion
  row.appendChild(editColumn);
  row.id = aObj.idx;
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
  let splitData = splitAndIndexData(data);
  splitData.incomplete.sort(function(a, b){
    return new Date(b.startDate) - new Date(a.startDate);
  });
  splitData.complete.sort(function(a, b){
    return new Date(b.endDate) - new Date(a.endDate);
  });
  var len = splitData.incomplete.length, c = 0;
  for(c; c < len; c++){
    appendActivity(splitData.incomplete[c], tblNow, false);
  }
  len = splitData.complete.length; c = 0;
  for(c; c < len; c++){
    appendActivity(splitData.complete[c], tblOld, true);
  }
}

/**
 * @function addDetails
 * Prepends a button to click for details on the first td of the rowIn. Adds a data-details attribute to rowIn and sets its value to details. Adds an event listener to toggle display of the details below the row when the button is clicked. Depends on tableInsertView
 * @param rowIn tr
 * @param details String
 */
function addDetails(rowIn, details){
  let btn = document.createElement('button');
  btn.textContent = '*';
  rowIn.setAttribute('data-details', details);
// Load data from target's parentNode.parentNode data-detail attribute into the innerHTML of the DOM node with the id of activity-detail. Calls tableInsertView to display at below the row where the target resides.
  btn.addEventListener('click', function(){
    let detailSection = document.getElementById('activity-detail');
    let row = this.parentNode.parentNode;
    detailSection.innerHTML = row.getAttribute('data-details');
    tableInsertView(detailSection, row);
  });
  rowIn.childNodes[0].insertBefore(btn, rowIn.childNodes[0].childNodes[0]);
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
        window.localStorage.setItem('current', JSON.stringify(data));
        buildActivityTable(data, tblActivity, tblComplete);
      });
    });
    menuElement.appendChild(btn);
    menuCount++;
  });
}
function splitAndIndexData(data){
  let i = 0, len = data.length, noEndDate = [], hasEndDate = [];
  for(i; i < len; i++){
    data[i].idx = i;
    data[i].endDate ? hasEndDate.push(data[i]) : noEndDate.push(data[i]);
  }
  return {incomplete: noEndDate, complete: hasEndDate};
}
/**
 * @function tableInsertView
 * Take in a DOM nade view and a DOM node row. Toggle insert or remove view after the row.
 * Depends on layout css hide class
 * @param viewIn
 * @param insertRow
 */
function tableInsertView(viewIn, insertRow){
  viewIn.classList.toggle('hide');
  if(!(viewIn.classList.contains('hide'))) {
    let rect = insertRow.getBoundingClientRect();
    viewIn.style.left = `${rect.left + scrollX}px`;
    viewIn.style.top = `${rect.top + rect.height + scrollY}px`;
    viewIn.style.width = `${rect.width}px`;
  }
}