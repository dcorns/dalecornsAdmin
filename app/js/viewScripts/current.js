/**
 * current
 * Created by dcorns on 2/9/16
 * Copyright © 2016 Dale Corns
 * Depends on global mySkills
 */
'use strict';
//var clientRoutes = require('../clientRoutes')();
module.exports = function current(){
  let btnActivityMenu = document.getElementById('btn-activity-menu');
  let activityMenu = document.getElementById('menu-activities-category');
  btnActivityMenu.addEventListener('click', function(){
    activityMenu.classList.toggle('hide');
  });
  if (!(parseInt(window.sessionStorage.getItem('typeIndex'), 10))) window.sessionStorage.setItem('typeIndex', '0');
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
    mySkills.clientRoutes.saveData('saveActivity', data, function (err, data) {
      if(err){
        alert('Error saving data!');
        return;
      }
      alert('Activity Saved!');
      window.localStorage.setItem('updateId', 'newSaved');
      updateView();
    })
  });
  //endregion
  mySkills.clientRoutes.getData('currentCategoryMenu', function(err, data){
    if(err){
      console.error(err);
      return;
    }
    buildMenu(data.json[0].activityCategories, activityMenu);
  });
  updateView();
};
function updateView(){
  let typeIdx = window.sessionStorage.getItem('typeIndex') || '0';
  var tblActivity = document.getElementById('tbl-activity');
  var tblComplete = document.getElementById('tbl-complete');
  mySkills.clientRoutes.getData('current?typeIndex=' + typeIdx, function(err, data){
    if(err){
      alert('No current data stored locally. Internet connection required');
      console.error(err);
      return;
    }
    window.localStorage.setItem('current', JSON.stringify(data));
    buildActivityTable(data, tblActivity, tblComplete);
  });
}
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
    addDetails(row, aObj.details, 'activity-detail');
  }

  //region Admin Only
  let btnColumn = document.createElement('td');
  addActivityEditing(aObj.idx, row, btnColumn);
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
  //btnColumn.appendChild(btnTimeLog);
  //endregion
  row.appendChild(btnColumn);
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
 * Prepends a button to click for details on the first td of the rowIn. Adds a data-details attribute to rowIn and sets its value to details. Adds an event listener to set the innerHTML of the element with the id of viewContainer to data-details and toggle display of viewContainer below the row when the button is clicked. Depends on tableInsertView
 * @param rowIn tr
 * @param details String
 * @param viewContainer
 */
function addDetails(rowIn, details, viewContainer){
  let btn = document.createElement('button');
  btn.textContent = '*';
  rowIn.setAttribute('data-details', details);
// Load data from target's parentNode.parentNode data-detail attribute into the innerHTML of the DOM node with the id of activity-detail. Calls tableInsertView to display at below the row where the target resides.
  btn.addEventListener('click', function(){
    let detailSection = document.getElementById(viewContainer);
    let row = this.parentNode.parentNode;
    detailSection.innerHTML = row.getAttribute('data-details');
    tableInsertView(detailSection, row);
  });
  rowIn.childNodes[0].insertBefore(btn, rowIn.childNodes[0].childNodes[0]);
}
function addActivityEditing(dataId, rowIn, elIn){
  let btnEdit = document.createElement('button');
  btnEdit.textContent = 'EDIT';
  btnEdit.setAttribute('data-dataid', dataId);
  btnEdit.addEventListener('click', btnEditEventHandler);
  elIn.appendChild(btnEdit);
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
      updateView();
      // mySkills.clientRoutes.getData('current?typeIndex=' + this.value, function(err, data){
      //   if(err){
      //     alert('No current data stored locally. Internet connection required');
      //     console.error(err);
      //     return;
      //   }
      //   window.localStorage.setItem('current', JSON.stringify(data));
      //   buildActivityTable(data, tblActivity, tblComplete);
      // });
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
 * Take in a DOM nade view and a DOM node tr. Toggle insert or remove view after the tr.
 * Depends on layout css hide class and that the viewIn nade be assigned absolute positioning
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
function btnEditEventHandler(e) {
  if(window.localStorage.getItem('updateId') === 'updated'){
    updateView();
  }
  let rowAndDataId = e.target.dataset.dataid;
  let view = document.getElementById('activity-edit');
  view.setAttribute('data-dataid', rowAndDataId);
  let row = document.getElementById(rowAndDataId);
  mySkills.route('activityEdit', 'activity-edit');
  tableInsertView(view, row);
}
