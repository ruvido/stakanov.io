var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Invoice = mongoose.model('invoices');


router.get('/invoices', function(req, res) {
  Invoice.find(function(err, invoices){
    // console.log(invoices)
    res.render(
      'api',
      {title : 'Invoices API', invoices : invoices}
    );
  });
});

router.post('/invoices', function(req, res) {
  new Invoice({
    name : req.body.name,
    lordo: req.body.lordo,
  })
  .save(function(err, invoice) {
    // console.log(invoice)
    res.redirect('/api/invoices');
  });
});


module.exports = router;

