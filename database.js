var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;
var moment = require('moment');

require('./models/team-schema');


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
    id_string += narr[ii].substring(0,1)
  id_string += '-'+invoice.lordo
  // }
  // else {
    // id_string = invoice.invoice_id;
  // }

  return id_string
}

/// GENERAL for PAYMENTS
var create_unique_id = function(payment) {

  pay_date = itStringtoDate(payment.date_string)

  id_string = moment(pay_date).format('YYYYMMDD')+'-';
  var narr=payment.name.split(" ")
  for ( ii in narr )
    id_string += narr[ii].substring(0,1)
  id_string += '-'+payment.amount

  return id_string
}

// SCHEMAS
// -----------------------------------------------------------
var Invoice = new Schema({
    sent: { type: Boolean, default: false },
    sent_error: { type: Boolean, default: false },
    pdf: String,
    invoice_id: String,
    name: String,
    import_unique_id: { type: String, unique: true },
    invoice_date_string: { type: String, default: '00/00/0000'},
    job_date_string: { type: String, default: '00/00/0000'},
    event_name: String, 
    event_date_string: { type: String, default: '00/00/0000'},
    lordo: { type: Number, default: 0 },
    netto: Number,
    vat: Number,
    applied_vat: Number,
    street: String,
    postal_code: String,
    city  : String,
    country: String,
    email : String
})


var Payment = new Schema({
// general
  transaction_type: String, // donation or regular
  unique_id: { type: String, unique: true },
  // unique_id: String,
  tmp_id: { type: Boolean, default: false },
  import_unique_id: { type: String, unique: true},
  // import_unique_id: String,
// details
  name: String,
  amount: Number,
  date_string: { type: String, default: '00/00/0000'},
  job_date_string: { type: String, default: '00/00/0000'},
  amount_letters: String,
  amount_letters_it: String,
  netto: Number,
  vat: Number,
  applied_vat: Number,
// address
  street: String,
  postal_code: String,
  city  : String,
  country: String,
  email : String,
// associated event
  event_name: String, 
  event_date_string: { type: String, default: '00/00/0000'},
// pdf related stuff  
  sent: { type: Boolean, default: false },
  sent_error: { type: Boolean, default: false },
  pdf: String
})


var Event = new Schema({
    name    : String,
    date    : String,
    location: String,
    invoices: [Invoice]
  });



// --PLUGINS------------------------
Invoice.plugin(uniqueValidator)
Payment.plugin(uniqueValidator)

// --METHODS------------------------

Payment.pre('validate', function(next) {
  if (!this.import_unique_id) {
    var tmpId = moment().format('x')
    this.unique_id=tmpId
    this.import_unique_id=tmpId
    this.tmp_id = true
  }
  next()
})

Invoice.methods.update_all_fields = function() {

  this.job_date_string = this.invoice_date_string
   // if (!this.netto) {
  this.applied_vat=0.19
  this.netto = this.lordo/(1+this.applied_vat)
  this.vat   = this.netto*this.applied_vat
  // }

  if (!this.invoice_id) {
    this.invoice_id = create_invoice_id(this)
  }

  return this
}

Payment.methods.update_all_fields = function() {

  this.job_date_string = this.date_string
  
  if (this.amount == null) this.amount = 0

  if (this.type != 'donation') {
    this.applied_vat=0.19
    this.netto = this.amount/(1+this.applied_vat)
    this.vat   = this.netto*this.applied_vat
  }

  if (!this.unique_id) {
    this.unique_id = create_unique_id(this)
  }

  if (this.tmp_id) {
    this.unique_id = create_unique_id(this)
    this.tmp_id = false
  }

  return this
}

// Invoice.methods.dudify = function() {
//   this.name = this.name + '-dude'; 
//   return this;
// };

// --MODELS------------------------

mongoose.model('invoices', Invoice)
mongoose.model('payments', Payment)
mongoose.model('events',   Event)

// --CONNECTION--------------------
// mongoose.connect('mongodb://localhost/staka');
// mongoose.connect('mongodb://localhost/staka-test');
// mongoose.connect('mongodb://localhost/caz-test');

mongoose.connect('mongodb://ruvido:solemio77@ds023425.mlab.com:23425/studio-production')
// mongoose.connect('mongodb://ruvido:solemio77@ds021333.mlab.com:21333/ruvido-test');
//-----------------------------------------
// mongoose.connect('mongodb://ruvido:solemio77@ds021333.mlab.com:21333/superheros');
// mongoose.connect('mongodb://ruvido:solemio77@ds023644.mlab.com:23644/studiogeek');
