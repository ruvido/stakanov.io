var express=require('express');
var nodemailer = require("nodemailer");
var app=express();
/*
    Here we are configuring our SMTP Server details.
    STMP is mail server which is responsible for sending and recieving email.
*/
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "ruvido",
        pass: "amo mia moglie"
    }
});
/*------------------SMTP Over-----------------------------*/

/*------------------Routing Started ------------------------*/

app.get('/',function(req,res){
    res.sendfile('send_email.html');
});
app.get('/send',function(req,res){
    var mailOptions={
        // to : req.query.to,
        // subject : req.query.subject,
        // text : req.query.text
        to: "ruvidoshop@gmail.com",
        subject: "ahahaha",
        text: "sldjhv kjasdhv"
    }

    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
     if(error){
            console.log(error);
        res.end("error");
     }else{
            console.log("Message sent: " + response.message);
        res.end("sent");
         }
});
});

/*--------------------Routing Over----------------------------*/

app.listen(3000,function(){
    console.log("Express Started on Port 3000");
});