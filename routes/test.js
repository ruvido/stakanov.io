var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Invoice = mongoose.model('invoices');
var nodemailer = require('nodemailer');


// CUSTOM FUNCTIONS
// -----------------------------------------------------------

// INDEX OPERATIONS
// -----------------------------------------------------------
router.get('/', function(req, res) {
  Invoice.find(function(err, invoices){
    console.log(invoices)    
    res.render(
      // 'test',
      'invoice_form',
      {title : 'Invoices API', invoices : invoices}
    );
  });
});

router.post('/', function(req, res) {
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


// router.get('/invoice/email/:id', function(req, res) {
// router.post('/', function(req, res) {
router.get('/caz', function(req, res) {

  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'ruvido@gmail.com', // Your email id
        pass: 'amo mia moglie' // Your password
    }
  })
  var text = 'Hello world from \n\n';
  var mailOptions = {
    from: 'ruvido@gmail.com', // sender address
    to: 'ruvidoshop@gmail.com', // list of receivers
    subject: 'Email Example Baaaaa', // Subject line
    // subject: req.query.subject,
    text: text
  // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
  };

  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
        res.json({yo: 'error'});
    }else{
        console.log('Message sent: ' + info.response);
        res.json({yo: info.response});
    };
  });
});


router.get('/invoice/:id', function(req, res) {
  var query = {"_id": req.params.id};
  Invoice.findOne(query, function(err, invoice){

    invoice.update_all_fields();
    invoice.save();

    console.log(invoice)

    res.render(
      'view_invoice',{
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

  // WARNING: Both solutions below can update other fields but give 
  // an error (without bombing):
  // Error: Can't set headers after they are sent.
  // ------------------------------------------------------------------

  // Invoice.findOne(query, function(err, invoice){invoice.save()});

  // Invoice.findOne(query, function(err, invoice){
  //   invoice.invoice_id = 'CAZ';
  //   invoice.save(function(err) {
  //     if (err) throw err;
  //     console.log('CAAAAZZZZ SAAAVED');
  //   });
  // });
  // ------------------------------------------------------------------

  res.redirect('/test');
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




// -----------------------------------------------------------
// -----------------------------------------------------------
module.exports = router;

