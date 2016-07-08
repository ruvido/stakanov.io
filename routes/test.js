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

// MUCH NEEDED VARIABLES
var publicFolder  = 'public'
var invoiceFolder = 'data/invoices'
var routeRoot     = '/test'



// CUSTOM FUNCTIONS
// -----------------------------------------------------------

// INDEX OPERATIONS
// -----------------------------------------------------------
router.get('/', function(req, res) {
  Invoice.find(function(err, invoices){
    // console.log(invoices)    
    res.render(
      // 'test',
      'invoice_list',
      {title : 'Invoices API', invoices : invoices}
    );
  });
});

router.get('/invoice/sent', function(req, res) {
  Invoice.find(function(err, invoices){
    // console.log(invoices)    
    res.render(
      // 'test',
      'invoice_sent_list',
      {title : 'Invoices API', invoices : invoices}
    );
  });
});

router.get('/invoice/new', function(req, res) {
  // Invoice.find(function(err, invoices){
    res.render(
      'invoice_new',
      {title : 'Invoices API'}
      // {title : 'Invoices API', invoices : invoices}
    );
  // });
});

router.post('/invoice/new', function(req, res) {
  new Invoice({
    name                : req.body.name,
    lordo               : req.body.lordo,
    invoice_date_string : req.body.invoice_date_string,
    event_name          : req.body.event_name,
    event_date_string   : req.body.event_date_string,
    street              : req.body.street,
    postal_code         : req.body.postal_code,
    city                : req.body.city,
    country             : req.body.country
  })
  .save(function(err, invoice) {
    console.log(invoice)
    res.redirect('/test');
  });
});


// SINGLE INVOICE OPERATIONS
// -----------------------------------------------------------

// CREATE AN INVOICE PDF AND SEND IT VIA EMAIL
router.get('/invoice/send/:id', function(req, res) {
  var query = {"_id": req.params.id}
  Invoice.findOne(query, function(err, invoice){

    invoice.update_all_fields()
    invoice.sent = true
    invoice.save()

    console.log(invoice)

    // var invoiceTemplate = 'public/data/invoices/templates/invoice_frao_de.html'
    // var invoicePdf      = 'public/data/invoices/'+invoice.invoice_id+'.pdf'
    // var emailTemplate   = 'public/data/invoices/templates/email_invoice_frao_de.html'

    var invoiceTemplate = path.join(publicFolder, invoiceFolder, 'templates/invoice_frao_de.html')
    var emailTemplate   = path.join(publicFolder, invoiceFolder, 'templates/email_invoice_frao_de.html')

    var invoiceName     = invoice.invoice_id+'.pdf'
    var invoicePdf      = path.join(publicFolder, invoiceFolder, invoiceName)
    var invoiceDownload = path.join('/', invoiceFolder, invoiceName)

    var html = swig.renderFile(invoiceTemplate, {
        title : 'Invoice for ' + invoice.name, 
        invoice : invoice,
        lordo   : invoice.lordo.toFixed(2),
        netto   : invoice.netto.toFixed(2),
        vat     : invoice.vat.toFixed(2),
        applied_vat: (invoice.applied_vat*100).toFixed(2)
      })

    var options = { 
      format: 'A4',
      "border": {
        "top":    "10mm",
        "right":  "20mm",
        "bottom": "5mm",
        "left":   "20mm"
      },

      "header": {"height": "45mm"},
      "footer": {"height": "28mm"}

    }
   
    pdf.create(html, options).toFile(invoicePdf, function(err, res) {
      if (err) return console.log(err)
      console.log(res)
    // })
    

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
        // from: 'info@5p2p.it',
        from: 'Francesco Rao <hola@francescorao.net>',
        to: 'ruvido@gmail.com',
        bcc: 'info@5p2p.it',
        subject: 'Ricevuta di pagamento | '+invoice.name,
        html: htmlText,
        attachments: [{path: invoicePdf}]
      };

      transporter.sendMail(mailOptions, function(error, info){
        if(error) {
          console.log(error);
          invoice.sent_error = true
          invoice.save()
          // res.json({yo: 'error'});
        }
        else {
          console.log('Message sent: ' + info.response);
          // invoice.sent = true
          // invoice.save()
          // res.redirect('/test');
        }
      });
    });
  });
//////////
  invoice.pdf=invoiceDownload
    })
//////////

  res.redirect('/test/invoice/sent');
})

  // res.send('oh yeah');
// });






router.get('/invoice/:id', function(req, res) {
  var query = {"_id": req.params.id};
  Invoice.findOne(query, function(err, invoice){

    invoice.update_all_fields();
    invoice.save();

    console.log(invoice)

    res.render(
      'invoice_view',{
        title : 'Invoice for ' + invoice.name, 
        invoice : invoice,
        lordo   : invoice.lordo.toFixed(2),
        netto   : invoice.netto.toFixed(2),
        vat     : invoice.vat.toFixed(2),
        applied_vat: (invoice.applied_vat*100).toFixed(2)
      }
    );
  });
});

router.get('/invoice/edit/:id', function(req, res) {
  var query = {"_id": req.params.id};
  Invoice.findOne(query, function(err, invoice){
    console.log(invoice)
    res.render(
      'invoice_edit',{
        title : 'Invoice for ' + invoice.name, 
        invoice : invoice
      }
    );
  });
});

router.put('/invoice/edit/:id', function(req, res) {
  var query = {"_id": req.params.id};
  var update = {
    invoice_id : req.body.invoice_id, 
    name: req.body.name, 
    street : req.body.street, 
    postal_code : req.body.postal_code,
    city : req.body.city,
    country : req.body.country
  };
  var options = {new: true};
  // Invoice.findOne(query, function(err, invoice){
  Invoice.findOneAndUpdate(query, update, options, function(err, invoice){
    console.log(invoice)
    res.render(
      'invoice_edit',{
        title : 'Invoice for ' + invoice.name, 
        invoice : invoice
      }
    );
  });

  res.redirect('/test/invoice/'+req.params.id);
});

// router.put('/superhero/:id', function(req, res) {
//   var query = {"_id": req.params.id};
//   var update = {name : req.body.name, cool : req.body.cool };
//   var options = {new: true};
//   // Superhero.findOneAndUpdate(query, update, options, function(err, superhero){
//   Superhero.findOneAndUpdate(query, update, options, function(err, superhero){
//     console.log(superhero)
//     res.render(
//       'superhero',
//       {title : 'Superhero API - ' + superhero.name, superhero : superhero}
//     );
//   });
//   res.redirect('/api/superheros');
// });


router.delete('/:id', function(req, res) {
  var query = {"_id": req.params.id};
  Invoice.findOneAndRemove(query, function(err, invoice){
    console.log(invoice)
    res.redirect('/test');
  });
});

router.get('/invoice/delete/:id', function(req, res) {
  var query = {"_id": req.params.id};
  Invoice.findOneAndRemove(query, function(err, invoice){
    console.log(invoice)
    res.redirect('/test');
  });
});



// -----------------------------------------------------------
// -----------------------------------------------------------
module.exports = router;

