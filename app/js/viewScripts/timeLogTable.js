/**
 * time-log-table
 * Created by dcorns on 10/25/16
 * Copyright © 2016 Dale Corns
 */
'use strict';
module.exports = function timeLogTable() {
  let timeLogTableData = {};
  let btnAddNewTimeLog = document.getElementById('btnAddNewTimeLog');
  let btnSaveNewTimeLog = document.getElementById('btnSaveNewTimeLog');
  let tblTimeLog = document.getElementById('timeLogTable');
btnAddNewTimeLog.addEventListener('click', function(e){
  btnSaveNewTimeLog.className = 'show';
  btnAddNewTimeLog.className = 'hide';
  timeLogTableData.id = e.target.parentElement.parentElement.value;
  let newRow = createEditRow();
  tblTimeLog.appendChild(newRow);
});
  btnSaveNewTimeLog.addEventListener('click', function(e){
    console.dir(timeLogTableData);
  });
};

function createEditRow(rowIn){
  let newRow = document.createElement('tr');
  if(rowIn){

  }
  else{
    let newTimeInField = document.createElement('input');
    newTimeInField.setAttribute('type', 'datetime-local');
    let newWorkPerformedField = document.createElement('input');
    newWorkPerformedField.setAttribute('type', 'text');
    let newTimeOutField = document.createElement('input');
    newTimeOutField.setAttribute('type', 'datetime-local');
    let tdNewTimeInField = document.createElement('td');
    let tdWorkPerformedFieled = document.createElement('td');
    let tdNewTimeOutField = document.createElement('td');
    tdNewTimeInField.appendChild(newTimeInField);
    tdWorkPerformedFieled.appendChild(newWorkPerformedField);
    tdNewTimeOutField.appendChild(newTimeOutField);
    newRow.appendChild(tdNewTimeInField);
    newRow.appendChild(tdWorkPerformedFieled);
    newRow.appendChild(tdNewTimeOutField);
  }
  return newRow;
}