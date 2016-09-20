/**
 * routes
 * Created by dcorns on 7/7/16
 * Copyright © 2016 Dale Corns
 */
'use strict';

var corngoose   = require('corngoose'),
  auth = require('cornorize'),
  dataScript = require('./dataScript');
var secret = process.env.DRCAUTH;

module.exports = function(app){
  app.get('/status', function (req, res, next)
  {
    res.send("{status: 'ok'}");
  });

  app.get('/current', function (req, res, next){
    corngoose.getCollection('currentActivities', function(err, data){
      res.status(200);
      res.contentType = 'json';
      res.send(data);
    });
  });
  app.post('/saveActivity', function(req, res, next){
    dataScript.saveActivity(req.body, function(err, data){
      if(err) {
        playErr(res, new Error('There was a problem saving profile'));
        res.status(302);
      }
      else{
          res.status(201); //do-ajax expects a 201 or it will interpret status as an error
          res.send(data);
      }
    });
  });

  app.get('/skills', function (req, res, next){
    corngoose.getCollection('competencies', function(err, data){
      res.status(200);
      res.contentType = 'json';
      res.send(data);
    });
  });

  app.get('/examples', function (req, res, next){
    corngoose.getCollection('examples', function(err, data){
      res.status(200);
      res.contentType = 'json';
      res.send(data);
    });
  });

  app.get('/repos', function (req, res, next){
    corngoose.getCollection('repos', function(err, data){
      res.status(200);
      res.contentType = 'json';
      res.send(data);
    });
  });

  app.post('/newAccount', function (req, res, next){
    //default role of user for posting comments
    var user = {email:req.params.email.toLowerCase(), roles: ['user']};
    auth.encrypt(req.params.password, function(err, data){
      if(err){
        playErr(res, err);
      }else{
        user.hash = data;
        //Add user email if it does not already exist, the users hash, and the default user role
        corngoose.dbDocInsert({email:req.params.email.toLowerCase()}, user, 'users', function(err, data){
          if(err){
            playErr(res, err);
          }else{
            user.tokenAddress = req.connection.remoteAddress;
            var token;
            try{
              token = auth.makeToken(user, 10, process.env.DRCAUTH);
              res.status(201);
              res.contentType = 'json';
              res.send({token:token});
            }
            catch(e){
              e.newAccount = 'Failed to create token';
              console.error(e);
              res.status(500);
              res.send({error: e});
            }
          }
        });
      }
    });

  });

  app.post('/login', function (req, res, next){
    res.contentType = 'json';
    var email, password;
    try{
      email = req.params.email.toLowerCase(); password = req.params.password;
    }
    catch(e){
      console.log('error caught!');
      res.status(400);
      res.send(e);
    }
    corngoose.dbDocFind({email:email}, 'users', function(err, data){
      if(err){
        console.log('error retrieving login user');
        res.status(404);
        res.send(err);
      }
      else{
        var user = {email: data[0].email, accessLevel: data[0].accessLevel, tokenAddress: req.connection.remoteAddress};
        auth.authenticate({password: password}, {passHash: data[0].hash}, function(err, data){
          if(err){
            console.log('error in login authenticate');
            console.dir(err);
            res.status(401);
            res.send(err);
          }
          var token;
          try{
            token = auth.makeToken(user, 10, process.env.DRCAUTH);
            res.status(201);
            res.send({token: token});
          }
          catch(e){
            e.login = 'Failed to create token';
            console.error(e);
            res.status(500);
            res.send({error: e});
          }
        });
      }
    });
  });

  app.post('/tokenAccess', function(req, res, next){
    res.contentType = 'json';
    var DRCToken = req.params.DRCToken, userAccess, remoteAddress = req.connection.remoteAddress;
    userAccess = auth.decodeToken(DRCToken, process.env.DRCAUTH);
    if(userAccess.expires){//token is valid
      if(userAccess.resources.tokenAddress === remoteAddress){
        res.status(201);
        res.send({tokenExpires:userAccess.expires});
      }
      else{
        console.dir(userAccess);
        res.status(401);
        res.send({error: 'invalid token address'});
      }
    }
    else{
      res.status(401);
      res.send({error: 'Invalid Token'});
    }
  });

  app.get('/myProfile', function(req, res, next){
    res.contentType = 'json';
    const token = req.headers.authorization;
    var access = auth.decodeToken(token, secret);
    console.dir(access);
    //access object {resources, {email,tokenAddress}, expires}
    if(access.resources){//valid token
      corngoose.dbDocFind({email:access.resources.email}, 'users', function(err, data){
        if(err) {
          playErr(res, err);
        }
        else{
          //if there is a profile ID, then the user has the member role and the profile has already been added
          if('profileId' in data[0]){
            corngoose.dbDocFind({profileId: data[0].profileId}, 'profiles', function(err, data){
              if(err){
                playErr(res, err);
              }
              else{
                res.status(200);
                res.send(data[0]);
              }
            })
          }
          else{
            //if the user has the member role and no profile already, create new profile
            if(data[0].roles.indexOf('member') > -1){
              corngoose.getCollection('profiles', function(err, data){
                if(err){
                  playErr(res, err);
                }
                else{
                  var profileId = 'profile' + data.length;
                  var profile = {
                    profileId: profileId,
                    about: '',
                    current: [],
                    examples: [],
                    repos: [],
                    posts: [],
                    projects: [],
                    externalLinks: {},
                    competencies: {technologies:[], specifics:[], tools:[]}
                  };
                  corngoose.dbDocInsert({profileId: profileId}, profile, 'profiles', function(err, pData){
                    if(err){
                      playErr(res, err);
                    }
                    else{
                      corngoose.dbDocUpdate({email: access.resources.email}, {profileId: profileId}, 'users', function(err, data){
                        if(err){
                          playErr(res, err);
                        }
                        else{
                          res.status(200);
                          res.send(pData);
                        }
                      })
                    }
                  });
                }
              });
            }
            else{
              //User has no member role
              res.status(401);
              res.send({});
            }

          }
        }
      });
    }
    else{//token is not valid
      res.status(401);
      res.send({});
    }

  });

  app.get('/currentCategoryMenu', function(req, res, next){
    corngoose.getCollection('appMenus', function(err, data){
      res.status(200);
      res.contentType = 'json';
      res.send(data);
    });
  });
};

function playErr(res, err){
  console.error(err);
  res.status(500);
  res.contentType = 'json';
  res.send(err);
}