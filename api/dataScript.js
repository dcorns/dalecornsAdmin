/**
 * dataScripts
 * Created by dcorns on 7/7/16
 * Copyright © 2016 Dale Corns
 */
'use strict';
const cg = require('corngoose');
const auth = require('cornorize');
const ObjectId = require('mongodb').ObjectId;
module.exports = {
  saveProfile: function saveProfile(token, data, cb) {
    var aboutMe = {mainHeader: data.aboutMeHeader, subText: data.aboutMe};
    isValidProfile(token, data.profileId, function(result) {
      if (result) {
        cg.dbDocFind({profileId: data.profileId}, 'profiles', function (err, data) {
          if (err) cb(new Error('Unable to save Profile'), null);
          data[0].about = aboutMe;
          cg.dbDocReplace(data[0], 'profiles', function (err, data) {
            if (err) cb(new Error('Profile save failed'), null);
            else cb(null, data.result);
          });
        });
      }
    });
  },
  saveActivity: function saveActivity(data, cb) {
    //make sure data.type gets saved as a number
    data.updates.type = parseInt(data.updates.type, 10);
    //check if it is an update using id_ property
    if(data.id) cg.dbDocUpdate({_id: data.id}, data.updates, 'currentActivities', function(err, data){
      if(err) cb(err, null);
      else cb(null, data);
    });
    else cg.dbDocInsert({activity: 'act'}, data.updates, 'currentActivities', function(err, data){
      if(err){
        cb(err, null);
      }
      else{
        cb(null, data);
      }
    });
  },
  saveTimeLog: function saveTimeLog(data, cb){
    console.dir(data);
    cg.dbDocFind({_id: data.id}, 'currentActivities', function(err, docData){
      if(err) {
        console.dir(err);
        cb(err, null);
      }
      if(docData[0].timeLogs){
        if(data.editRowIndex > -1) docData[0].timeLogs[data.editRowIndex] = data.timeLogEditData;
        else docData[0].timeLogs.push(data.timeLogEditData);
      }
      else{
        docData[0].timeLogs = [data.timeLogEditData];
      }
      cg.dbDocUpdate({_id: data.id}, {timeLogs: docData[0].timeLogs}, 'currentActivities', function(err, updateData){
        if(err) {
          console.dir(err);
          cb(err, null);
        }
        else {
          cb(null, updateData);
        }
      });
    });
  },
  deleteActivity: function deleteActivity(data, cb){
    cg.dbDocRemove({_id: ObjectId(data._id)}, 'currentActivities', function(err, data){
      if(err) cb(err, null);
      else cb(null, data);
    })
  }

};

function isValidProfile(token, profileID, cb){
  const resource = auth.getTokenResources(token, process.env.DRCAUTH).data;
  cg.dbDocFind({email: resource.email}, 'users', function(err, data){
    if(err) cb(false);
    if(profileID === data[0].profileId) cb(true);
  });
}