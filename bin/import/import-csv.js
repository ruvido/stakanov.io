var parse = require('csv-parse');
var fs = require('fs')

inputFile='Fidorpay-Transaktionen.csv'

fs.readFile(inputFile, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  // console.log(data);
  res.send(data)
  process.exit()

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
        console.log('---'+ii+'-------------')
        console.log('date: '+ date)
        console.log('name: '+ name)
        console.log('lordo: '+ lordo)
      }
    }
  })
})
