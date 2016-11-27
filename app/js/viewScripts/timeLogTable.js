/**
 * time-log-table
 * Created by dcorns on 10/25/16
 * Copyright © 2016 Dale Corns
 */
'use strict';
let timeLogTableData = {};
timeLogTableData.timeLogEditData = {};
let timeLogTableEditView = {};
/**
 * @module timeLogTable
 * Companion to timeLogTable.html
 */
module.exports = function timeLogTable() {
  setupTimeLogTableObject();
  setupTimeLogTableEditViewObject();
  if(timeLogTableData.rowData) loadTimeLogData(timeLogTableEditView.tblTimeLogBody, timeLogTableData.rowData);
};
/**
 * @function setupTimeLogTableObject
 * Data object
 */
function setupTimeLogTableObject(){
  let self = document.getElementById('timeLogTable');
  //self contains the data passed in from the calling view
  let dataIndex = self.parentElement.dataset.dataid;
  timeLogTableData.rowData = JSON.parse(window.localStorage.getItem('current')).json[dataIndex].timeLogs;
  timeLogTableData.id = JSON.parse(window.localStorage.getItem('current')).json[dataIndex]._id;
  timeLogTableData.editRowIndex = -1;
}
/**
 * @function setupTimeLogTableEditViewObject
 * Load the relevant DOM nodes from timeLogTable.html
 */
function setupTimeLogTableEditViewObject(){
  timeLogTableEditView.btnAddTimeLog = document.getElementById('btnAddTimeLog');
  timeLogTableEditView.tdTimeLogEditButtons = document.getElementById('tdTimeLogEditButtons');
  timeLogTableEditView.btnTimeLogEditSave = document.getElementById('btnTimeLogEditSave');
  timeLogTableEditView.btnTimeLogEditCancel = document.getElementById('btnTimeLogEditCancel');
  timeLogTableEditView.oldRow = '';
  timeLogTableEditView.editRow = document.getElementById('trTimeLogEdit');
  //Reference to the row must be used rather than independent id for valid data [1,3,5] are td and [0] is the input element within
  timeLogTableEditView.timeIn = timeLogTableEditView.editRow.childNodes[1].childNodes[0];
  timeLogTableEditView.workPerformed = timeLogTableEditView.editRow.childNodes[3].childNodes[0];
  timeLogTableEditView.timeOut = timeLogTableEditView.editRow.childNodes[5].childNodes[0];
  timeLogTableEditView.tblTimeLogBody = document.getElementById('tblTimeLogBody');
  addTimeLogTableEditViewEventHandlers();
}
/**
 * @function setupTimeLogTableEditViewEventHandlers
 */
function addTimeLogTableEditViewEventHandlers(){
  timeLogTableEditView.btnAddTimeLog.addEventListener('click', showTimeLogEditView);
  timeLogTableEditView.btnTimeLogEditSave.addEventListener('click', saveTimeLogEdit);
  timeLogTableEditView.btnTimeLogEditCancel.addEventListener('click', cancelTimeLogEdit);
}

/**
 * @function loadTimeLogData
 * @param tbl
 * @param data
 */
function loadTimeLogData(tbl, data){
  tbl.innerHTML = '';
  let i = 0, ln = data.length;
  for(i; i < ln; i++){
    let row = document.createElement('tr');
    let tdTimeIn = document.createElement('td');
    let tdTimeOut = document.createElement('td');
    let tdWorkPerformed = document.createElement('td');
    let btnTimeLogEdit = document.createElement('button');
    btnTimeLogEdit.innerHTML = 'EDIT';
    btnTimeLogEdit.dataset.rowDataIndex = i;
    btnTimeLogEdit.addEventListener('click', editTimeLog);
    tdTimeIn.innerText = data[i].timeIn;
    if(data[i].timeOut) tdTimeOut.innerText = data[i].timeOut;
    tdWorkPerformed.innerText = data[i].workPerformed;
    row.appendChild(tdTimeIn); row.appendChild(tdWorkPerformed); row.appendChild(tdTimeOut);
    row.appendChild(btnTimeLogEdit);
    tbl.appendChild(row);
  }
}
/**
 * @function showTimeLogEditView
 */
function showTimeLogEditView(){
  timeLogTableEditView.tblTimeLogBody.appendChild(timeLogTableEditView.editRow);
  timeLogTableEditView.editRow.classList.toggle('hide');
  timeLogTableEditView.btnAddTimeLog.classList.toggle('hide');
  timeLogTableEditView.timeIn.value = '';
  timeLogTableEditView.workPerformed.value = '';
  timeLogTableEditView.timeOut.value = '';
  timeLogTableEditView.timeIn.focus();
}
/**
 * @function editTimeLog
 */
function editTimeLog() {
  let idx = this.dataset.rowDataIndex;
  timeLogTableData.editRowIndex = parseInt(idx, 10);
  timeLogTableEditView.oldRow = this.parentElement;
  timeLogTableEditView.editRow.classList.toggle('hide');
  timeLogTableEditView.tblTimeLogBody.replaceChild(timeLogTableEditView.editRow, timeLogTableEditView.oldRow);
  let timeIn = timeLogTableData.rowData[idx].timeIn;
  let workPerformed = timeLogTableData.rowData[idx].workPerformed;
  let timeOut = timeLogTableData.rowData[idx].timeOut;
  timeLogTableData.timeLogEditData.timeIn = timeIn;
  timeLogTableData.timeLogEditData.workPerformed = workPerformed;
  timeLogTableData.timeLogEditData.timeOut = timeOut;
  timeLogTableEditView.timeIn.value = timeIn;
  timeLogTableEditView.workPerformed.value = workPerformed;
  timeLogTableEditView.timeOut.value = timeOut;
}
/**
 * @function saveTimeLogEdit
 */
function saveTimeLogEdit(){
  timeLogTableData.timeLogEditData.timeIn = timeLogTableEditView.timeIn.value;
  timeLogTableData.timeLogEditData.timeOut = timeLogTableEditView.timeOut.value;
  timeLogTableData.timeLogEditData.workPerformed = timeLogTableEditView.workPerformed.value;
  mySkills.clientRoutes.saveData('saveTimeLog', timeLogTableData, function (err, data) {
    if(err){
      alert('Error saving data!');
      return;
    }
    if(timeLogTableData.rowData){
      console.log(timeLogTableData.editRowIndex);
      if(timeLogTableData.editRowIndex > -1) timeLogTableData.rowData[timeLogTableData.editRowIndex] = timeLogTableData.timeLogEditData;
      else timeLogTableData.rowData.push(timeLogTableData.timeLogEditData);
    }
    else{
      timeLogTableData.rowData = [timeLogTableData.timeLogEditData];
    }
    timeLogTableEditView.tblTimeLogBody.removeChild(timeLogTableEditView.editRow);
    loadTimeLogData(timeLogTableEditView.tblTimeLogBody, timeLogTableData.rowData);
  });

}
/**
 * @function cancelTimeLogEdit
 */
function cancelTimeLogEdit(){
  if(timeLogTableData.editRowIndex < 0){
    timeLogTableEditView.btnAddTimeLog.classList.toggle('hide');
    timeLogTableEditView.tblTimeLogBody.removeChild(timeLogTableEditView.editRow);
  }
  else{
    timeLogTableEditView.tblTimeLogBody.replaceChild(timeLogTableEditView.oldRow, timeLogTableEditView.editRow);
    timeLogTableData.editRowIndex = -1;
  }
  timeLogTableEditView.editRow.classList.toggle('hide');
  timeLogTableData.timeLogEditData.timeIn = '';
  timeLogTableData.timeLogEditData.timeOut = '';
  timeLogTableData.timeLogEditData.workPerformed = '';
}