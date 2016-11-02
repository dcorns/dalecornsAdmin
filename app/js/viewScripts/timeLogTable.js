/**
 * time-log-table
 * Created by dcorns on 10/25/16
 * Copyright © 2016 Dale Corns
 */
'use strict';
let timeLogTableData = {};
let timeLogTableEditView = {};
timeLogTableEditView.editRow = document.createElement('tr');
timeLogTableEditView.timeIn = document.createElement('input');
timeLogTableEditView.workPerformed = document.createElement('input');
timeLogTableEditView.timeOut = document.createElement('input');
timeLogTableEditView.btnSave = document.createElement('button');

module.exports = function timeLogTable() {
  let btnAddNewTimeLog = document.getElementById('btnAddNewTimeLog');
  let btnSaveNewTimeLog = document.getElementById('btnSaveNewTimeLog');
  let tblTimeLog = document.getElementById('timeLogTable');
  //Event listeners***********************************************
btnAddNewTimeLog.addEventListener('click', function(e){
  btnAddNewTimeLog.className = 'hide';
  timeLogTableData.id = e.target.parentElement.parentElement.value;
  //populate module variable timeLogTblEditRow with input fields
  createEditRow();
  tblTimeLog.appendChild(timeLogTableEditView.editRow);
});
  timeLogTableEditView.btnSave.addEventListener('click', function(e){
    timeLogTableData.timeIn = timeLogTableEditView.timeIn.value;
    timeLogTableData.workPerformed = timeLogTableEditView.workPerformed.value;
    timeLogTableData.timeOut = timeLogTableEditView.timeOut.value;

    console.dir(timeLogTableData);
  });
};

function createEditRow(rowIn){
  if(rowIn){

  }
  else{
    timeLogTableEditView.timeIn.setAttribute('type', 'datetime-local');
    timeLogTableEditView.workPerformed.setAttribute('type', 'text');
    timeLogTableEditView.timeOut.setAttribute('type', 'datetime-local');
    timeLogTableEditView.btnSave.innerHTML = 'SAVE';
    timeLogTableData.timeIn = timeLogTableEditView.timeIn.value = '';
    timeLogTableData.workPerformed = timeLogTableEditView.workPerformed.value = '';
    timeLogTableData.timeOut = timeLogTableEditView.timeOut.value = '';
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