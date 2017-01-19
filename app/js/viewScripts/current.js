/**
 * current
 * Created by dcorns on 2/9/16
 * Copyright © 2016 Dale Corns
 * Depends on global mySkills
 */
'use strict';

module.exports = function current(){
  document.addEventListener('dataSaved', updateView, false); //event triggered by activityEdit.js after saving so update view can be called
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
      id: 0,
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
      window.localStorage.setItem('updateId', 'newSaved');
      updateView();
      frmActivity.classList.toggle('hide');
      frmBtnSave.classList.toggle('hide');
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
  hideAllTableInserts(['activity-edit', 'activity-detail', 'time-log-table']);
  mySkills.clientRoutes.getData('current?typeIndex=' + typeIdx, function(err, data){
    if(err){
      alert('No current data stored locally. Internet connection required');
      console.error(err);
      return;
    }
    window.localStorage.setItem('current', JSON.stringify(data));
    tblActivity.innerHTML = '';
    tblComplete.innerHTML = '';
    buildActivityTable(data.json, tblActivity, tblComplete);
  });
}
/**
 * @function appendActivity
 * Adds an activity row with activity data.
 * Depends on functions 'addActivityEditing', 'buildActivityLink' and 'addDetails', and section 'activty-detail'
 * @param aObj
 * @param tbl
 * @param hasEndDate
 */
function appendActivity(aObj, tbl, hasEndDate){
  var row = document.createElement('tr');
  var startDate = document.createElement('td');
  var activityLink = document.createElement('td');
  var activity = document.createElement('td');
  activity.innerText = aObj.activity;
  var endDate = hasEndDate ? document.createElement('td') : null;
  startDate.innerText = new Date(aObj.startDate).toLocaleDateString();
  if(aObj.link){
    activityLink = buildActivityLink(aObj.link, activityLink);
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
  addActivityEditing(aObj.idx, btnColumn);
  addTimeLogBtn(aObj.idx, btnColumn);
  row.appendChild(btnColumn);
  row.id = aObj.idx;
  row.setAttribute('data-startdate', aObj.startDate);
  row.setAttribute('data-activity', aObj.activity);
  row.setAttribute('data-link', aObj.link);
  row.setAttribute('data-enddate', aObj.endDate);

  //endregion

  tbl.appendChild(row);
}
/**
 * function addTimeLogBtn
 * Creates a button for loading timeLog component
 * Depends on alot
 * @param dataIdx
 * @param elIn
 */
function addTimeLogBtn(dataIdx, elIn){
  let btnTimeLog = document.createElement('button');
  btnTimeLog.textContent = 'TimeLog';
  btnTimeLog.setAttribute('data-dataid', dataIdx);
  btnTimeLog.addEventListener('click', btnTimeLogEventHandler);
  elIn.appendChild(btnTimeLog);
}
/**
 * @function buildActivityLink
 * Creates activity link cell
 * Depends on function buildIcon and svg '#icon-link'.
 * @param data
 * @param td
 * @returns {*}
 */
function buildActivityLink(data, td){
  var anchor = document.createElement('a');
  anchor.href = data;
  let anchorIcon = buildIcon('#icon-link');
  anchor.appendChild(anchorIcon);
  td.appendChild(anchor);
  return td;
}
/**
 * function buildIcon
 * Creates an icon using svg
 * Depends on 'icon' class
 * @param svgLink
 * @returns {*}
 */
function buildIcon(svgLink){
  let icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  let iconUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  icon.setAttribute('class', 'icon');
  iconUse.setAttributeNS('http://www.w3.org/1999/xlink', 'href', svgLink);
  icon.appendChild(iconUse);
  return icon;
}
/**
 * @function buildActivityTable
 * Builds the completed and incomplete activity tables
 * Depends on the splitAndIndexData and appendActivity functions
 * @param data
 * @param tblNow
 * @param tblOld
 */
function buildActivityTable(data, tblNow, tblOld){
  //Sort by start date using custom sort compare function
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
/**
 * @function addActivityEditing
 * Defines and places the edit button
 * @param dataId
 * @param elIn
 */
function addActivityEditing(dataId, elIn){
  let btnEdit = document.createElement('button');
  btnEdit.textContent = 'EDIT';
  btnEdit.setAttribute('data-dataid', dataId);
  btnEdit.addEventListener('click', btnEditEventHandler);
  elIn.appendChild(btnEdit);
}
/**
 * @function buildMenu
 * Provides a means of switching between activity categories and provides the currently selected category to the rest of the current module. Depends on updateView function.
 * @param data
 * @param menuElement
 */
function buildMenu(data, menuElement){
  var menuIndex = 0;
  data.forEach(function(item){
    let btn = document.createElement('button');
    btn.textContent = item;
    btn.setAttribute('data-menuIndex', menuIndex);
    btn.addEventListener('click', btnMenuEventHandler);
    menuElement.appendChild(btn);
    menuIndex++;
  });
}
/**
 * @function btnMenuEventHandler
 */
function btnMenuEventHandler(){
  window.sessionStorage.setItem('typeIndex', this.dataset.menuindex);
  updateView();
}
/**
 * @function splitAndIndexData
 * Separates data by data[i].endDate and add its index within the array to it.
 * @param data
 * @returns {{incomplete: Array, complete: Array}}
 */
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
/**
 * @function btnEditEventHandler
 * Event handler for edit button. Loads the activityEdit component and updates the view if edit saved
 * Depends on locaStorage 'updateId', mySkills global, section 'activity-edit', and tableInsertView, updateView functions
 * @param e
 */
function btnEditEventHandler(e) {
  if(window.localStorage.getItem('updateId') === 'updated'){
    updateView();
  }
  //dataid is the array index of the data object in local storage current
  let rowAndDataId = e.target.dataset.dataid;
  let view = document.getElementById('activity-edit');
  view.setAttribute('data-dataid', rowAndDataId);
  let row = document.getElementById(rowAndDataId);
  mySkills.route('activityEdit', 'activity-edit');
  tableInsertView(view, row);
}
/**
 * @function btnTimeLogEventHandler
 * @param e
 */
function btnTimeLogEventHandler(e){
  let view = document.getElementById('time-log-table');
  let rowAndDataId = e.target.dataset.dataid;
  view.setAttribute('data-dataid', rowAndDataId);
  let row = document.getElementById(rowAndDataId);
  mySkills.route('timeLogTable', 'time-log-table');
  tableInsertView(view, row);
}
/**
 * @function hideAllTableInserts
 * @param ary
 */
function hideAllTableInserts(ary){
  let i = 0, ln = ary.length;
  for(i; i < ln; i++){
    let tblInsert = document.getElementById(ary[i]);
    if(!(tblInsert.classList.contains('hide'))) {
      tblInsert.classList.toggle('hide');
    }
  }
}
