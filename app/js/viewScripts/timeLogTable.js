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
function setupTimeLogTableObject(){
  let self = document.getElementById('timeLogTable');
  //self contains the data passed in from the calling view
  let dataIndex = self.parentElement.dataset.dataid;
  timeLogTableData.rowData = JSON.parse(window.localStorage.getItem('current')).json[dataIndex].timeLogs;
  timeLogTableData.id = JSON.parse(window.localStorage.getItem('current')).json[dataIndex]._id;
}
function setupTimeLogTableEditViewObject(){
  timeLogTableEditView.frmTimeLogEdit = document.getElementById('frmTimeLogEdit');
  timeLogTableEditView.timeIn = document.getElementById('timeLogTimeIn');
  timeLogTableEditView.workPerformed = document.getElementById('timeLogWorkPerformed');
  timeLogTableEditView.timeOut = document.getElementById('timeLogTimeOut');
  timeLogTableEditView.btnAddTimeLog = document.getElementById('btnAddTimeLog');
  timeLogTableEditView.tdTimeLogEditButtons = document.getElementById('tdTimeLogEditButtons');
  timeLogTableEditView.btnTimeLogEditSave = document.getElementById('btnTimeLogEditSave');
  timeLogTableEditView.btnTimeLogEditCancel = document.getElementById('btnTimeLogEditCancel');
  timeLogTableEditView.btnSaveNew = document.getElementById('timLogBtnSaveNew');
  timeLogTableEditView.oldRow = '';
  timeLogTableEditView.editRow = document.getElementById('trTimeLogEdit');
  timeLogTableEditView.tblTimeLogBody = document.getElementById('tblTimeLogBody');
  addTimeLogTableEditViewEventHandlers();
}
function addTimeLogTableEditViewEventHandlers(){
  timeLogTableEditView.btnSaveNew.addEventListener('click', saveTimeLogEdit);
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
    tdTimeIn.innerText = new Date(data[i].timeIn).toLocaleString();
    if(data[i].timeOut) tdTimeOut.innerText = new Date(data[i].timeOut).toLocaleString();
    tdWorkPerformed.innerText = data[i].workPerformed;
    row.appendChild(tdTimeIn); row.appendChild(tdWorkPerformed); row.appendChild(tdTimeOut);
    row.appendChild(btnTimeLogEdit);
    tbl.appendChild(row);
  }
}
function showTimeLogEditView(){
  timeLogTableEditView.tblTimeLogBody.appendChild(timeLogTableEditView.editRow);
  timeLogTableEditView.editRow.classList.toggle('hide');
  timeLogTableEditView.btnAddTimeLog.classList.toggle('hide');
  timeLogTableEditView.editRow.childNodes[1].childNodes[0].value = '';
  timeLogTableEditView.editRow.childNodes[3].childNodes[0].value = '';
  timeLogTableEditView.editRow.childNodes[5].childNodes[0].value = '';
  timeLogTableEditView.editRow.childNodes[1].childNodes[0].focus();
}
/**
 * @function saveTimeLogItem
 */
function editTimeLog(){
  let idx = this.dataset.rowDataIndex;
  timeLogTableEditView.oldRow = this.parentElement;
  timeLogTableEditView.editRow.classList.toggle('hide');
  timeLogTableEditView.tblTimeLogBody.replaceChild(timeLogTableEditView.editRow, timeLogTableEditView.oldRow);
  let timeIn = timeLogTableData.rowData[idx].timeIn;
  let workPerformed = timeLogTableData.rowData[idx].workPerformed;
  let timeOut = timeLogTableData.rowData[idx].timeOut;
  timeLogTableData.timeLogEditData.timeIn = timeIn;
  timeLogTableData.timeLogEditData.workPerformed = workPerformed;
  timeLogTableData.timeLogEditData.timeOut = timeOut;
  timeLogTableEditView.editRow.childNodes[1].childNodes[0].value = timeIn;
  timeLogTableEditView.editRow.childNodes[3].childNodes[0].value = workPerformed;
  timeLogTableEditView.editRow.childNodes[5].childNodes[0].value = timeOut;
  console.dir(timeLogTableEditView);

}
function saveTimeLogEdit(){
  mySkills.clientRoutes.saveData('saveTimeLog', timeLogTableData, function (err, data) {
    if(err){
      alert('Error saving data!');
      return;
    }
    if(timeLogTableData.rowData){
      timeLogTableData.rowData.push(timeLogTableData.timeLogEditData);
    }
    else{
      timeLogTableData.rowData = [timeLogTableData.timeLogEditData];
    }
    timeLogTableEditView.tblTimeLogBody.removeChild(timeLogTableEditView.editRow);
    loadTimeLogData(document.getElementById('tblTimeLogBody'), timeLogTableData.rowData);
  });

}
function cancelTimeLogEdit(){
  if(timeLogTableEditView.btnAddTimeLog.classList.contains('hide')){
    timeLogTableEditView.btnAddTimeLog.classList.toggle('hide');
    timeLogTableEditView.tblTimeLogBody.removeChild(timeLogTableEditView.editRow);
  }
  else{
    timeLogTableEditView.tblTimeLogBody.replaceChild(timeLogTableEditView.oldRow, timeLogTableEditView.editRow);
  }
  timeLogTableEditView.editRow.classList.toggle('hide');
  timeLogTableData.timeLogEditData.timeIn = '';
  timeLogTableData.timeLogEditData.timeOut = '';
  timeLogTableData.timeLogEditData.workPerformed = '';
}