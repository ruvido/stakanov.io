var pdf = require('html-pdf');
var swig  = require('swig');

var htmlTemplate  = 'public/data/invoices/test.html'
var pdfOutput     = 'public/data/invoices/test.pdf'

var invoice = {
  name : 'ruvido',
  street : 'casa mia'
}

var html = swig.renderFile(htmlTemplate, {
    invoice: invoice
});

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

};
 
pdf.create(html, options).toFile(pdfOutput, function(err, res) {
  if (err) return console.log(err);
  console.log(res);
});