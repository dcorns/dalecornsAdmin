/**
 * dataScripts
 * Created by dcorns on 7/7/16
 * Copyright © 2016 Dale Corns
 */
'use strict';
const cg = require('corngoose');
const auth = require('cornorize');
module.exports = {
  saveProfile: function(token, data, cb) {
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
  saveActivity: function(data, cb) {
    cg.dbDocInsert({activity: 'act'}, data, 'currentActivities', function(err, data){
      if(err){
        cb(err, null);
      }
      else{
        cb(null, data);
      }
    });
  }

};

function isValidProfile(token, profileID, cb){
  const resource = auth.getTokenResources(token, process.env.DRCAUTH).data;
  cg.dbDocFind({email: resource.email}, 'users', function(err, data){
    if(err) cb(false);
    if(profileID === data[0].profileId) cb(true);
  });
}