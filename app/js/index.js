/**
 * index
 * Created by dcorns on 12/31/15
 * Copyright © 2015 Dale Corns
 */
'use strict';
//Main JS File
var mySkills = {};
mySkills.sharedObjects = require('./sharedObjects');
var doAjax = require('do-ajax');
mySkills.ajax = doAjax;
var pages = require('./build/views');
var pageScripts = require('./pageScripts');
var route = require('./viewRouter')(pages, pageScripts, mySkills);//(view, controller, app)
mySkills.route = route;
window.mySkills = mySkills;
//load shared and dom objects
mySkills.sharedObjects.init();

function firstDo(){
  //Handle Refresh by checking session storage for last href and redirecting if it exists
  var lastHref = window.sessionStorage.getItem('href');
  var netAction = window.sessionStorage.getItem('netAction');
  if (lastHref) {
    route(lastHref);
  }
  else {//load home template
    lastHref = '#/current';
    window.sessionStorage.setItem('href', lastHref);
    window.history.pushState(null, null, lastHref);
    route(lastHref);
  }
  //Add event handlers for 'a' tags
  var links = document.getElementsByTagName('a');
  var idx = 0, ln = links.length;
  for (idx; idx < ln; idx++) {
    links[idx].addEventListener('click', function (e) {
      //if the link is local routing link, save location for when returning to the site...filters out external links based on the presence of #/
      if(this.href.indexOf('#/') > -1){
        window.sessionStorage.setItem('href', this.href);
      }
      window.history.pushState(null, null, this.href);
      e.preventDefault();
      route(this.href);
    });
  }
  //Add front and back button handler
  window.addEventListener('popstate', function () {
    window.sessionStorage.setItem('href', location.href);
    route(location.href);
  });
}

function winready(f){
  var preOnload = window.onload;
  if(typeof preOnload !== 'function'){
    window.onload = f;
  }
  else{
    window.onload = function() {
      preOnload();
      f();
    }
  }
}

winready(firstDo());