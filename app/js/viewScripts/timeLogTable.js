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
  let tblTimeLogBody = document.getElementById('tblTimeLogBody');
  timeLogTableEditView.timeIn = document.getElementById('timeLogTimeIn');
  timeLogTableEditView.workPerformed = document.getElementById('timeLogWorkPerformed');
  timeLogTableEditView.timeOut = document.getElementById('timeLogTimeOut');
  let self = document.getElementById('timeLogTable');
  let dataIndex = self.parentElement.dataset.dataid;
  timeLogTableData.rowData = JSON.parse(window.localStorage.getItem('current')).json[dataIndex].timeLogs;
  timeLogTableData.id = JSON.parse(window.localStorage.getItem('current')).json[dataIndex]._id;
  if(timeLogTableData.rowData) loadTimeLogData(tblTimeLogBody, timeLogTableData.rowData);
  timeLogTableEditView.btnSaveNew = document.getElementById('timLogBtnSaveNew');
  //Event listeners**************************************************
  timeLogTableEditView.btnSaveNew.addEventListener('click', saveTimeLogItem);
};
/**
 * @function saveTimeLogItem
 */
function saveTimeLogItem(){
  timeLogTableData.timeLogEditData.timeIn = timeLogTableEditView.timeIn.value;
  timeLogTableData.timeLogEditData.workPerformed = timeLogTableEditView.workPerformed.value;
  timeLogTableData.timeLogEditData.timeOut = timeLogTableEditView.timeOut.value;
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
    timeLogTableEditView.timeIn.value = '';
    timeLogTableEditView.workPerformed.value = '';
    timeLogTableEditView.timeOut.value = '';
    loadTimeLogData(document.getElementById('tblTimeLogBody'), timeLogTableData.rowData);
  });
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
    tdTimeIn.innerText = new Date(data[i].timeIn).toLocaleString();
    tdTimeOut.innerText = new Date(data[i].timeOut).toLocaleString();
    tdWorkPerformed.innerText = data[i].workPerformed;
    row.appendChild(tdTimeIn); row.appendChild(tdWorkPerformed); row.appendChild(tdTimeOut);
    tbl.appendChild(row);
  }
}