/**
 * activityEdit
 * Created by dcorns on 11/7/16
 * Copyright © 2016 Dale Corns
 */
'use strict';
module.exports = function activityEdit(){
  let self = document.getElementById('activityEdit');
  let dataIndex = self.parentElement.dataset.dataid;
  let data = JSON.parse(window.localStorage.getItem('current')).json[dataIndex];
  window.localStorage.setItem('updateId', data._id);
  let frm = self.childNodes[1];
  let btnSave = self.childNodes[3];
  let btnCancel =  self.childNodes[4];
  frm[0].value = data.startDate;
  frm[1].value = data.endDate;
  frm[2].value = data.activity;
  frm[3].value = data.link;
  btnSave.addEventListener('click', function(){
    let data = {
      id: window.localStorage.getItem('updateId'),
      updates: {
        startDate: frm[0].value,
        endDate: frm[1].value,
        activity: frm[2].value,
        link: frm[3].value,
        details: frm[4].value,
        type: window.sessionStorage.getItem('typeIndex') || '0'
      }
    };
    mySkills.clientRoutes.saveData('saveActivity', data, function (err, data) {
      if(err){
        alert('Error saving data!');
        return;
      }
      window.localStorage.setItem('updateId', 'updated');
      self.classList.toggle('hide');
      //Trigger custom event created in current.js to cause view update
      let evt =document.createEvent('Events');
      evt.initEvent('dataSaved', true, false);
      self.dispatchEvent(evt);
    })
  });
};