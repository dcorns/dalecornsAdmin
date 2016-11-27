/**
 * gulpfile.js
 * Created by dcorns on 8/7/16
 * Copyright © 2016 Dale Corns
 * Uses __dirname/Development for development build, __dirname/app for all client files, production index.html kept in __dirname/
 * For development with css4, and webpack
 * Need to add call to grunt for addView functionality
 */
/// <reference path="all.d.ts" />
'use strict';
var gulp = require('gulp');
var childProcess = require('child_process').spawn;
var postcss = require('gulp-postcss');
var concatCss = require('gulp-concat-css');
var cssnext = require('postcss-cssnext');
var cssnano = require('cssnano');
var gulpWebpack = require('webpack-stream');
var webpack = require('webpack');

gulp.task('grunt', function(){
  childProcess('grunt');
});

gulp.task('webpack', function(){
  return gulp.src('app/js/**/*.js')
    .pipe(gulpWebpack({
      output:{
        filename: 'bundle.js'
      }
    }))
    .pipe(gulp.dest('Development/js'));
});

gulp.task('copyassets', function(){
  gulp.src(['app/assets/**/*'])
    .pipe(gulp.dest('Development'));
});
gulp.task('dev-server', function(){
  const cp = childProcess('node', ['server', '/Development']);
  cp.stdout.on('data', function(data){
    console.log(data.toString('utf8'));
  });
});

gulp.task('server', function(){
  process.env.USE_REMOTE_DATABASE = 1;
  const cp = childProcess('node', ['server', '/Development']);
  cp.stdout.on('data', function(data){
    console.log(data.toString('utf8'));
  });
});

gulp.task('adminMock', function(){
  process.env.USE_REMOTE_DATABASE = 0;
  const cpdb = childProcess('mongod');
  cpdb.stdout.on('data', function(data){
    console.log(data.toString('utf8'));
  });
});

gulp.task('admin', function(){
  // const cpdb = childProcess('rhc', ['port-forward', '-a', 'dalecorns']);
  // cpdb.stdout.on('data', function(data){
  //   console.log(data.toString('utf8'));
  // });
});

gulp.task('adminData', ['admin', 'server']);

gulp.task('mockData', ['adminMock', 'dev-server']);

gulp.task('build-css', function(){
  return gulp.src('app/styles/**/*')
    .pipe(concatCss('main.css'))
    .pipe(postcss([ cssnext(), cssnano()]))
    .pipe(gulp.dest('Development/css'));
});

gulp.task('watcher', function(){
  gulp.watch('app/js/**/*', ['webpack']);
  //Keep Development build folder assets in sync
  gulp.watch('app/assets/**/*',['copyassets']);
  gulp.watch('app/index.html', function(){
    gulp.src(['app/index.html'])
      .pipe(gulp.dest('Development'));
  });
  gulp.watch('app/styles/**/*',['build-css']);
  gulp.watch('app/views/**/*', ['grunt', 'webpack']);
});

gulp.task('default',['watcher']);
