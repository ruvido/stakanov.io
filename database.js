var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');
// var tools  = require('./lib/tools.js')
// var autoIncrement = require('mongoose-auto-increment');
// var ObjectId = Schema.ObjectId;

// CUSTOM FUNCTIONS
// -----------------------------------------------------------
function itStringtoDate(dateStr) {
    var parts = dateStr.split("/");
    return new Date(parts[2], parts[1] - 1, parts[0]);
};

var create_invoice_id = function(invoice) {

  invoice_date = itStringtoDate(invoice.invoice_date_string)

  // if (!invoice.invoice_id) {
  id_string = moment(invoice_date).format('YYYYMMDD')+'-';
  var narr=invoice.name.split(" ")
  for ( ii in narr )
    id_string += narr[ii].substring(0,2)
  id_string += '-'+invoice.lordo
  // }
  // else {
    // id_string = invoice.invoice_id;
  // }

  return id_string
}

// SCHEMAS
// -----------------------------------------------------------
var Invoice = new Schema({
    sent: { type: Boolean, default: false },
    sent_error: { type: Boolean, default: false },
    invoice_id: String,
    name: String,
    // invoice_date: Date,
    invoice_date_string: String,
    // event_date: Date,
    event_name: String, 
    event_date_string: String,
    lordo: Number,
    netto: Number,
    vat: Number,
    applied_vat: Number,
    street: String,
    postal_code: String,
    city  : String,
    country: String,
    email : String
});

var Event = new Schema({
    name    : String,
    date    : String,
    location: String,
    invoices: [Invoice]
  });


// on every save
// Invoice.pre('save', function(next) {

//   if (!this.netto) {
//     this.applied_vat=0.19;
//     this.netto = this.lordo/(1+this.applied_vat);
//     this.vat   = this.netto*this.applied_vat;
//   }

//   if (!this.invoice_id) {
//     this.invoice_id = create_invoice_id(this)
//   }

//   next();
// });

Invoice.methods.update_all_fields = function() {

   // if (!this.netto) {
    this.applied_vat=0.19;
    this.netto = this.lordo/(1+this.applied_vat);
    this.vat   = this.netto*this.applied_vat;
  // }

  if (!this.invoice_id) {
    this.invoice_id = create_invoice_id(this)
  }

  return this;
};


Invoice.methods.dudify = function() {
  this.name = this.name + '-dude'; 
  return this;
};

mongoose.model('invoices', Invoice);
mongoose.model('events', Event);

mongoose.connect('mongodb://localhost/staka');
// mongoose.connect('mongodb://localhost/staka-test');

// mongoose.connect('mongodb://ruvido:solemio77@ds021333.mlab.com:21333/superheros');
// mongoose.connect('mongodb://ruvido:solemio77@ds021333.mlab.com:21333/ruvido-test');
// mongoose.connect('mongodb://ruvido:solemio77@ds023644.mlab.com:23644/studiogeek');
