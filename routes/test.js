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
    console.log(invoices)    
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
    email               : req.body.email,
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

    var invoiceName     = path.join('pdf', invoice.invoice_id+'.pdf')
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
        from:   'Francesco Rao <hola@francescorao.net>',
        to:     invoice.email,
        bcc:    'fatture@5p2p.it',
        subject:'Ricevuta di pagamento | '+invoice.name,
        html:   htmlText,
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

router.get('/invoice/view/:id', function(req, res) {
  var query = {"_id": req.params.id}
  Invoice.findOne(query, function(err, invoice){

    invoice.update_all_fields()
    invoice.save()

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
    )
  })
})

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
    invoice_id: req.body.invoice_id, 
    name: req.body.name, 
    email: req.body.email, 
    street : req.body.street, 
    postal_code : req.body.postal_code,
    city : req.body.city,
    country : req.body.country
  };
  var options = {new: true};
  // Invoice.findOne(query, function(err, invoice){
  Invoice.findOneAndUpdate(query, update, options, function(err, invoice){
    console.log(invoice)
    // res.render(
    //   'invoice_edit',{
    //     title : 'Invoice for ' + invoice.name, 
    //     invoice : invoice
    //   }
    // );
  });
  // res.redirect('/test/invoice/view/'+req.params.id);
  res.redirect('/test');
});

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


// IMPORT DATA
// -----------------------------------------------------------

// var storage =   multer.diskStorage({
//   destination: function (req, file, callback) {
//     callback(null, './uploads');
//   },
//   filename: function (req, file, callback) {
//     callback(null, file.fieldname + '-' + Date.now());
//   }
// });
// var upload = multer({ storage : storage}).single('userPhoto');



router.get('/invoice/import', function(req, res) {


  // Invoice.remove({}, function(err) {
  //   if (err) {
  //     return console.log(err)
  //   }
  // })


  // inputFile='Fidorpay-Transaktionen.csv'
  inputFile=path.join( __dirname, '../test','Fidorpay-Transaktionen.csv')

  fs.readFile(inputFile, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    // console.log(data);

    // parse(data, {comment: '#', delimiter: ':'}, function(err, output){
    parse(data, {comment: '#', delimiter: ';'}, function(err, output){
      // console.log(output)

      var firstRow=1 // skip header
      for (var ii=firstRow; ii < output.length; ii++){

        var date = output[ii][0].replace(/\./g, '/')
        var name = output[ii][1]
        var lordo= parseFloat(output[ii][3].replace(/\./g, '').replace(/\,/g, '.'))

        // for (var jj=0; jj < output[ii].length; jj++){
        //   console.log(output[ii][jj])
        // }

        if ( lordo > 0 ) {

          var import_unique_id=date+name+lordo

          new Invoice({
            name                : name,
            lordo               : lordo,
            invoice_date_string : date,
            import_unique_id    : import_unique_id
          })
          .save(function(err, invoice) {
            if (err) {
              return console.log(err);
            }
            // console.log(invoice)
          });

          console.log('---'+ii+'-------------')
          console.log('date: '+ date)
          console.log('name: '+ name)
          console.log('lordo: '+ lordo)
          console.log('import_unique_id: '+ import_unique_id)
        }
      }
    })
  })

res.redirect('/test')

})



// -----------------------------------------------------------
// -----------------------------------------------------------
module.exports = router;


  // Invoice.remove({}, function(err) {
  //   if (err) {
  //     return console.log(err)
  //   }
  // })
