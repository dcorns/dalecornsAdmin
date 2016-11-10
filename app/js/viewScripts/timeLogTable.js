/**
 * time-log-table
 * Created by dcorns on 10/25/16
 * Copyright © 2016 Dale Corns
 */
'use strict';
let timeLogTableData = {};
timeLogTableData.timeLogEditData = {};
let timeLogTableEditView = {};
timeLogTableEditView.editRow = document.createElement('tr');
timeLogTableEditView.timeIn = document.createElement('input');
timeLogTableEditView.workPerformed = document.createElement('input');
timeLogTableEditView.timeOut = document.createElement('input');
timeLogTableEditView.btnSave = document.createElement('button');

module.exports = function timeLogTable() {
  let btnAddNewTimeLog = document.getElementById('btnAddNewTimeLog');
  let btnSaveNewTimeLog = document.getElementById('btnSaveNewTimeLog');
  let tblTimeLogBody = document.getElementById('tblTimeLogBody');
  let self = document.getElementById('timeLogTable');
  let dataIndex = self.parentElement.dataset.dataid;
  timeLogTableData.rowData = JSON.parse(window.localStorage.getItem('current')).json[dataIndex].timeLogs;
  timeLogTableData.id = JSON.parse(window.localStorage.getItem('current')).json[dataIndex]._id;
  if(timeLogTableData.rowData) loadTimeLogData(tblTimeLogBody, timeLogTableData.rowData);
  //Event listeners**************************************************
  btnAddNewTimeLog.addEventListener('click', function(e){
  btnAddNewTimeLog.className = 'hide';
  createEditRow();
  tblTimeLogBody.appendChild(timeLogTableEditView.editRow);
});
  timeLogTableEditView.btnSave.addEventListener('click', function(){
    timeLogTableData.timeLogEditData.timeIn = timeLogTableEditView.timeIn.value;
    timeLogTableData.timeLogEditData.workPerformed = timeLogTableEditView.workPerformed.value;
    timeLogTableData.timeLogEditData.timeOut = timeLogTableEditView.timeOut.value;
    console.dir(timeLogTableData);
    mySkills.clientRoutes.saveData('saveTimeLog', timeLogTableData, function (err, data) {
      if(err){
        alert('Error saving data!');
        return;
      }
      alert('Time log entry Saved!');
    });
   });
};

function createEditRow(rowIn){
  if(rowIn){

  }
  else{
    timeLogTableEditView.editRow.innerHTML = '';
    timeLogTableEditView.timeIn.setAttribute('type', 'datetime-local');
    timeLogTableEditView.workPerformed.setAttribute('type', 'text');
    timeLogTableEditView.timeOut.setAttribute('type', 'datetime-local');
    timeLogTableEditView.btnSave.innerHTML = 'SAVE';
    timeLogTableEditView.timeIn.value = '';
    timeLogTableEditView.workPerformed.value = '';
    timeLogTableEditView.timeOut.value = '';
    let tdNewTimeInField = document.createElement('td');
    let tdWorkPerformedField = document.createElement('td');
    let tdNewTimeOutField = document.createElement('td');
    let tdbtnField = document.createElement('td');
    tdNewTimeInField.appendChild(timeLogTableEditView.timeIn);
    tdWorkPerformedField.appendChild(timeLogTableEditView.workPerformed);
    tdNewTimeOutField.appendChild(timeLogTableEditView.timeOut);
    tdbtnField.appendChild(timeLogTableEditView.btnSave);
    timeLogTableEditView.editRow.appendChild(tdNewTimeInField);
    timeLogTableEditView.editRow.appendChild(tdWorkPerformedField);
    timeLogTableEditView.editRow.appendChild(tdNewTimeOutField);
    timeLogTableEditView.editRow.appendChild(tdbtnField);
  }
}

function loadTimeLogData(tbl, data){
  let i = 0, ln = data.length;
  for(i; i < ln; i++){
    let row = document.createElement('tr');
    let tdTimeIn = document.createElement('td');
    let tdTimeOut = document.createElement('td');
    let tdWorkPerformed = document.createElement('td');
    tdTimeIn.innerText = data[i].timeIn;
    tdTimeOut.innerText = data[i].timeOut;
    tdWorkPerformed.innerText = data[i].workPerformed;
    row.appendChild(tdTimeIn); row.appendChild(tdWorkPerformed); row.appendChild(tdTimeOut);
    tbl.appendChild(row);
  }
}