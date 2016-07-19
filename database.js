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

// SCHEMAS
// -----------------------------------------------------------
var Invoice = new Schema({
    sent: { type: Boolean, default: false },
    sent_error: { type: Boolean, default: false },
    pdf: String,
    invoice_id: String,
    name: String,
    import_unique_id: { type: String, unique: true },
    // invoice_date: Date,
    invoice_date_string: { type: String, default: '00/00/0000'},
    // event_date: Date,
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

// var Donation = new Schema({
//   name: String
// })

var Payment = new Schema({
// general
  transaction_type: String, // donation or regular
  unique_id: { type: String, unique: true },
  import_unique_id: { type: String, unique: true },
// details
  name: String,
  amount: { type: Number, default: 0 },
  date_string: { type: String, default: '00/00/0000'},
  amount_letters: String,
  amount_letters_it: String,
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

// var Payment = new Schema({  ---> see type
// var Donation = new Schema({
//   transaction_type: { type: String, default: 'donation'}, // this can help to unify donations and regular payments
// // name
//     name: String,
//     lordo: { type: Number, default: 0 },
//     date_string: { type: String, default: '00/00/0000'},
//     unique_id: { type: String, unique: true },
//     import_unique_id: { type: String, unique: true },
//     amount_letters: String,
//     amount_letters_it: String,
// // address
//     street: String,
//     postal_code: String,
//     city  : String,
//     country: String,
//     email : String,
// // associated event
//     event_name: String, 
//     event_date_string: { type: String, default: '00/00/0000'},
// // pdf related stuff  
//     sent: { type: Boolean, default: false },
//     sent_error: { type: Boolean, default: false },
//     pdf: String
// })


var Event = new Schema({
    name    : String,
    date    : String,
    location: String,
    invoices: [Invoice]
  });



// --PLUGINS------------------------
Invoice.plugin(uniqueValidator);
Payment.plugin(uniqueValidator);
// Donation.plugin(uniqueValidator);


// --METHODS------------------------

// on every save
// Invoice.pre('save', function(next) {
//   this.import_unique_id=this.date+this.name+this.lordo
//   next()
// })

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

// --MODELS------------------------

mongoose.model('invoices', Invoice)
// mongoose.model('donations', Donation)
mongoose.model('payments', Payment)
mongoose.model('events', Event)

// --CONNECTION--------------------
// mongoose.connect('mongodb://localhost/staka');
// mongoose.connect('mongodb://localhost/staka-test');

// mongoose.connect('mongodb://ruvido:solemio77@ds023425.mlab.com:23425/studio-production')
mongoose.connect('mongodb://ruvido:solemio77@ds021333.mlab.com:21333/ruvido-test');
//-----------------------------------------
// mongoose.connect('mongodb://ruvido:solemio77@ds021333.mlab.com:21333/superheros');
// mongoose.connect('mongodb://ruvido:solemio77@ds023644.mlab.com:23644/studiogeek');
