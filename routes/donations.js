var express = require('express');
var mongoose = require('mongoose');
var router = express.Router()

// MODELS
// var Donation = mongoose.model('donations')
var Payment = mongoose.model('payments')

// EXTRA DEPENDENCIES
var nodemailer = require('nodemailer');
var pdf = require('html-pdf');
var swig= require('swig');
var fs  = require('fs')
var path = require('path')
var parse = require('csv-parse');
var multer = require('multer');


// MUCH NEEDED VARIABLES
var publicFolder  = 'public'
var baseFolder    = 'data/donations' // public access
var payTemplate   = path.join(publicFolder, baseFolder, 'templates/donation_de.html')
var emailTemplate = path.join(publicFolder, baseFolder, 'templates/email.html')



var routeRoot     = '/donations'
var title = 'Donations'

var page = {
  title : 'Donations',
  root : routeRoot,
  signature : path.join('/images','signature-frao.png')
}


// INDEX OPERATIONS
// -----------------------------------------------------------
router.get('/', function(req, res) {
  Payment.find(function(err, elements){
    // console.log(elements)
    res.render(
      'donations/donations_list',{
        title     : title,
        root      : routeRoot,
        elements : elements
      }
    )
  })
})

router.get('/sent', function(req, res) {
  Payment.find(function(err, elements){
    res.render(
      'donations/donations_sent_list',
      {page : page, elements : elements}
    );
  });
});


router.get('/new', function(req, res) {
  res.render(
    'donations/donations_new',{
      title : title,
      page  : page
    }
  )
})

router.post('/new', function(req, res) {
  new Payment({
    name        : req.body.name,
    date_string : req.body.date_string,
    amount      : req.body.amount,
    street      : req.body.street,
    postal_code : req.body.postal_code,
    city        : req.body.city,
    country     : req.body.country,
    email       : req.body.email,
    amount_letters    : req.body.amount_letters,
    amount_letters_it : req.body.amount_letters_it
  })
  .save(function(err, element) {
    console.log(element)
    res.redirect(routeRoot)
  })
})


// // SINGLE OPERATIONS
// // -----------------------------------------------------------

// // CREATE A PDF AND SEND IT VIA EMAIL
router.get('/send/:id', function(req, res) {
  console.log('----mandiamo roba')
  var query = {"_id": req.params.id}
  Payment.findOne(query, function(err, element){

    element.update_all_fields()
    element.sent = true
    element.save()

    console.log(element)

    var payName     = path.join('pdf', element.unique_id+'.pdf')
    var payPdf      = path.join(publicFolder, baseFolder, payName)
    var payDownload = path.join('/', baseFolder, payName)

    var html = swig.renderFile(payTemplate, {
        title   : element.name, 
        element : element,
        amount  : element.amount.toFixed(2),
      })

    var options = { 
      format: 'A4',
      "border": {
        "top":    "10mm",
        "right":  "20mm",
        "bottom": "5mm",
        "left":   "20mm"
      },

      "header": {"height": "20mm"},
      "footer": {"height": "28mm"}

    }
   
    pdf.create(html, options).toFile(payPdf, function(err, res) {
      console.log('---------pdf making')
      if (err) return console.log(err)
      console.log(res)

    var transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
          user: 'ruvido@gmail.com', // Your email id
          pass: 'amo mia moglie' // Your password
      }
    })

    fs.readFile(emailTemplate, function (err, htmlText) {
      if (err) {
        return console.error(err)
      }

      console.log(htmlText)

      var mailOptions = {
        // from:   'Francesco Rao <hola@francescorao.net>',
        from:   '5pani2pesci <info@5p2p.it>',
        to:     element.email,
        bcc:    'donazioni@5p2p.it',
        subject:'Ricevuta di donazione | '+element.name,
        html:   htmlText,
        attachments: [{path: payPdf}]
      };

      transporter.sendMail(mailOptions, function(error, info){
        if(error) {
          console.log(error);
          element.sent_error = true
          element.save()
        }
        else {
          console.log('Message sent: ' + info.response)
        }
      })
    })
  })
//////////
  element.pdf=payDownload
    })
//////////

  res.redirect(routeRoot)
})


router.get('/view/:id', function(req, res) {
  var query = {"_id": req.params.id}
  Payment.findOne(query, function(err, element){
  
    element.update_all_fields()
    element.save()

    res.render(
      'donations/donations_view',{
      // 'donations/caz',{
      // '../public/data/donations/templates/donation_de',{
        title     : 'Donation for ' + element.name, 
        element   : element,
        amount    : element.amount.toFixed(2),
        page      : page
      }
    )
  })
})

router.get('/edit/:id', function(req, res) {
  var query = {"_id": req.params.id}
  Payment.findOne(query, function(err, element){
    console.log(element)
    res.render(
      'donations/donations_edit',{
        title : title, //LEFT OVER - CORRECT and DELETE
        page : page,
        element : element
      }
    )
  })
})

router.put('/edit/:id', function(req, res) {
  var query = {"_id": req.params.id}
  var update = {
    unique_id   : req.body.unique_id, 
    name        : req.body.name,
    email       : req.body.email, 
    street      : req.body.street, 
    postal_code : req.body.postal_code,
    city        : req.body.city,
    country     : req.body.country,
    amount_letters    : req.body.amount_letters,
    amount_letters_it : req.body.amount_letters_it
  }
  var options = {new: true}
  Payment.findOneAndUpdate(query, update, options, function(err, element){
    console.log(element)
  })
  res.redirect(routeRoot)
})


router.get('/delete/:id', function(req, res) {
  var query = {"_id": req.params.id}
  Payment.findOneAndRemove(query, function(err, element){
    console.log(element)
    res.redirect(routeRoot)
  })
})


// IMPORT DATA
// -----------------------------------------------------------

router.get('/import', function(req, res) {
  res.render(
    'donations/donations_import',
    {page : page}
  )
})

router.post('/import', function(req, res) {

  var paymentType = 'donation'

  var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, './tmp')
    }
  })
  var upload = multer({ storage : storage}).single('upload');

  upload(req,res,function(err) {
    if(err) {
      console.log(error)
    }

    console.log('file:', req.file)

    var inputFile = req.file.path
    fs.readFile(inputFile, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }

      parse(data, {comment: '#', delimiter: ';'}, function(err, output){
        var firstRow=1 // skip header
        for (var ii=firstRow; ii < output.length; ii++){

          var date = output[ii][0].replace(/\./g, '/')
          var name = output[ii][1]
          var amount= parseFloat(output[ii][3].replace(/\./g, '').replace(/\,/g, '.'))

          if ( amount > 0 ) {

            var import_unique_id=date+name+amount

            new Payment({
              transaction_type : paymentType,
              name        : name,
              amount      : amount,
              date_string : date,
              import_unique_id : import_unique_id
            })
            .save(function(err, payment) {
              if (err) {
                return console.log(err)
              }
              console.log('--------'+payment)
            })

            // console.log('---'+ii+'-------------')
            // console.log('date: '+ date)
            // console.log('name: '+ name)
            // console.log('amount: '+ amount)
            // console.log('import_unique_id: '+ import_unique_id)
          }
        }
      })
    })
  })

  res.redirect(routeRoot)

})

router.get('/delete-all', function(req, res) {

  Payment.remove({}, function(err) {
    if (err) {
      return console.log(err)
    }
  })

  res.redirect(routeRoot)

})


// -----------------------------------------------------------
// -----------------------------------------------------------
module.exports = router;


