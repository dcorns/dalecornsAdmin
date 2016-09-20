/**
 * clientRoutes
 * Created by dcorns on 2/10/16
 * Copyright © 2016 Dale Corns
 * Take in a route name for json data, if online download, otherwise check local storage, otherwise fail
 * Check for existing storage, available storage and either store keep. Return true if exists or successfully added.
 */
'use strict';
var doAjax = require('do-ajax');
module.exports = function clientRoutes(){
  return{
    getData: function(path, cb, token){
      doAjax.ajaxGetJson('/' + path, function(err, data){
        if(err){
          if(!(window.localStorage.getItem(path))) cb(err, null);
          else cb(null, JSON.parse(window.localStorage.getItem(path)));
        }
        else{
          window.localStorage.setItem(path, JSON.stringify(data));
          cb(null, data);
        }
      }, token);
    },
    saveData: function(path, data, cb){
      console.dir(data);
      doAjax.ajaxPostJson('/' + path, data, function(err, data){
        if(err){
          console.error(err);
          cb(err, null);
        }
        else{
          cb(null, data);
        }
      });
    }
  };
};