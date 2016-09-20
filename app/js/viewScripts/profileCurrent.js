/**
 * profileCurrent
 * Created by dcorns on 5/23/16
 * Copyright © 2016 Dale Corns
 */
'use strict';
const doAjax = require('do-ajax');
let current;
module.exports = function profileCurrent(){
  let myProfile = JSON.parse(localStorage.getItem('myProfile'));
  current = myProfile.current;
  //current = [{start: new Date(), activity: 'Test Activity', end: new Date()}];
  let els = document.querySelectorAll('#profile-content > [id]');
  for (var ii = 0; ii < els.length; ii++){
    configureEl(els[ii]);
  }
};
//Declare all functions scoped Variables
let tbl, newActivity = {start:'', activity: '', end: ''};
//initialize functionality for dom nodes
const configureEl = (el) => {
  switch (el.id){
    case 'currentItemsList':
      tbl = el;
      if(current && current.length > 0){
        prepTable(tbl, current);
      }
      break;
    case 'startDate':
      el.addEventListener('change', function(e){
        newActivity.start = e.target.value;
        console.log(newActivity.start);
      });
      break;
    case 'activity':
      el.addEventListener('keyup', function(e){
        newActivity.activity = e.target.value;
        console.log(newActivity.activity);
      });
      break;
    case 'endDate':
      el.addEventListener('change', function(e){
        newActivity.end = e.target.value;
        console.log(newActivity.end);
      });
      break;
    case 'addItem':
      el.addEventListener('click', function(){
        current.push(newActivity);
        if(current.length < 2){
          prepTable(tbl, current);
        }
        else{
          addTableData(newActivity, ['start', 'activity', 'end'], tbl);
        }
      });
      break;
    case 'updateItem':
      break;
    case 'removeItem':
      break;
    default:
      break;
  }
}

//Take an array of data objects and create table headers based on keys and data table rows based on values and insert data into rows, then append to tblNode
let prepTable = (tblNode, tblData) => {
  console.time('prepTable');
  const len = tblData.length;
  //create headers based on property names
  let tblHeader = document.createElement('tr');
  let dataKeys = [];
  for (var prop in tblData[0]){
    if(tblData[0].hasOwnProperty(prop)){
      dataKeys.push(prop);
      addHeaderRowCell(prop, tblHeader);
    }
  }
  tblNode.appendChild(tblHeader);
    for(var i2 = 0; i2 < len; i2++){
      addTableData(tblData[i2], dataKeys, tblNode);
    }
  console.timeEnd('prepTable');
}

//ads a table row to tblNode containing obj data who's keys match the provided dataKeys
let addTableData = (obj, dataKeys, tblNode) => {
  console.time('addTableData');
  let tr = document.createElement('tr');
  for(var i3 = 0; i3 < dataKeys.length; i3++){
    let td = document.createElement('td');
    td.textContent = obj[dataKeys[i3]];
    tr.appendChild(td);
  }
  tblNode.appendChild(tr);
  console.timeEnd('addTableData');
}

//Capitalize the first letter of headerText and add th node with the headerText to rowNode
let addHeaderRowCell = (headerText, rowNode) => {
  let th = document.createElement('th');
  th.textContent = headerText[0].toUpperCase() + headerText.slice(1);
  rowNode.appendChild(th);
}