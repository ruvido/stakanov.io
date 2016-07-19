var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Invoice = mongoose.model('invoices');

// EXTRA DEPENDENCIES
var nodemailer = require('nodemailer');
var pdf = require('html-pdf');
var swig= require('swig');
var fs  = require('fs')
var path = require('path')
var parse = require('csv-parse');
var multer = require('multer');



// -------------------------------------------
// TRY TO CHANGE NAME FROM ROUTER TO TEAM
// -------------------------------------------



// MUCH NEEDED VARIABLES
// var publicFolder  = 'public'
// var invoiceFolder = 'data/invoices' // public access
// var uploadsFolder = 'data/uploads' // private access
// var routeRoot     = '/test'

var routeRoot = '/teams'
var title = 'Teams'

// INDEX OPERATIONS
// -----------------------------------------------------------
router.get('/', function(req, res) {
  Team.find(function(err, teams){
    console.log(teams)    
    res.render(
      'teams/team_list',
      {title : title, teams : teams}
    )
  })
})

router.post('/', function(req, res) {
  new Team({
    name                : req.body.name,
    country             : req.body.country
  })
  .save(function(err, team) {
    console.log(team)
    res.redirect(routeRoot)
  });
});

// DANGEROUS!!!
router.get('/reset', function(req, res) {
  Team.remove({}, function(err) {
    if (err) {
      return console.log(err)
    }
  })
  res.redirect(routeRoot)
})


// -----------------------------------------------------------
module.exports = router;


  // Invoice.remove({}, function(err) {
  //   if (err) {
  //     return console.log(err)
  //   }
  // })
