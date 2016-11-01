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
btnAddNewTimeLog.addEventListener('click', function(e){
  btnSaveNewTimeLog.className = 'show';
  btnAddNewTimeLog.className = 'hide';
  let tbl = e.target.parentElement.children[1];
  timeLogTableData.id = e.target.parentElement.parentElement.value;
  let newTimeInField = document.createElement('input');
  newTimeInField.setAttribute('type', 'datetime-local');
  let newWorkPerformedField = document.createElement('input');
  newWorkPerformedField.setAttribute('type', 'text');
  let newTimeOutField = document.createElement('input');
  newTimeOutField.setAttribute('type', 'datetime-local');
  let newRow = document.createElement('tr');
  let tdNewTimeInField = document.createElement('td');
  let tdWorkPerformedFieled = document.createElement('td');
  let tdNewTimeOutField = document.createElement('td');
  tdNewTimeInField.appendChild(newTimeInField);
  tdWorkPerformedFieled.appendChild(newWorkPerformedField);
  tdNewTimeOutField.appendChild(newTimeOutField);
  newRow.appendChild(tdNewTimeInField);
  newRow.appendChild(tdWorkPerformedFieled);
  newRow.appendChild(tdNewTimeOutField);
  tbl.appendChild(newRow);

});
  btnSaveNewTimeLog.addEventListener('click', function(e){
    console.dir(timeLogTableData);
  });
};