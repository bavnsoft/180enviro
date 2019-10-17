const express = require('express');
const app = express();
const path = require("path");
const request = require("request");

app.use(express.static(path.join(__dirname, 'asset')));
var ftpClient = require('ftp-client');
var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');
var moment = require('moment');
const nodemailer = require('nodemailer');
var EmailTemplate = require('email-templates').EmailTemplate;


const bodyParser = require("body-parser");
app.use(bodyParser.json());


  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "sumitchoudhary727@gmail.com", // generated ethereal user
            pass: "sumit1994" // generated ethereal password
        }
    });


// Jade
app.set('views', __dirname+'/views');
app.set('view engine', 'jade');

app.get('/', function(req, res){
	res.render('index');
});

app.get('/about-us', function(req, res){
	res.render('about_us');
});

app.get('/items-available', function(req, res){

  var doc = new GoogleSpreadsheet('1QnRVOgZKa3qYSzEjXWTIt_JMDVS0KDWVFaykI9rPeQs');
  var sheet;
   
  async.series([
    function setAuth(step) {
      // see notes below for authentication instructions!
      var creds = require('./credentials.json');
      // OR, if you cannot save the file locally (like on heroku)
      var creds_json = {
        client_email: 'bavnsofts@gmail.com',
        private_key: 'AIzaSyAobXByEeFH66OmFLeJQLGtjW7aEpVbfxM'
      }
   
      doc.useServiceAccountAuth(creds, step);
    },
    function getInfoAndWorksheets(step) {
      doc.getInfo(function(err, info) {
        console.log('Loaded doc: '+info.title+' by '+info.author.email);
        sheet = info.worksheets[0];
        console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
        step();
      });

     


    },
    function workingWithRows(step) {
      // google provides some query options
      sheet.getRows({
        offset: 1,
        limit: 20,
        orderby: 'col2'
      }, function( err, rows ){

          var data = [];

          for(let i=0;i < rows.length;i++){
            data.push({
              broadcategory:rows[i].broadcategory,
              category:rows[i].category,
              brand:rows[i].brand,
              itemdescription:rows[i].itemdescription,
              price:rows[i].price,
              individualunitsize:rows[i].individualunitsize,
              totalavailable:rows[i].totalavailable,
              totalvolume:rows[i].totalvolume,
              condition:rows[i].condition,
              received:rows[i].received,
              interestingto:rows[i].interestingto,
              soldto:rows[i].soldto,
              soldtocategory:rows[i].soldtocategory,
              explanation:rows[i].explanation.replace(/['']+/g, ''),
              minimumorder:rows[i].minimumorder,
              availablenow:rows[i].availablenow,
              location:rows[i].location,
            })
            

          
          }
   
          res.render('items_available',{data:data});
   
        step();
      });
    },


   
  ], function(err){
      if( err ) {
        console.log('Error: '+err);
      }
  });


});



app.post('/filter_data', function(req, res){

  console.log(req.body)
  var doc = new GoogleSpreadsheet('1QnRVOgZKa3qYSzEjXWTIt_JMDVS0KDWVFaykI9rPeQs');
  var sheet;
   
  async.series([
    function setAuth(step) {
      // see notes below for authentication instructions!
      var creds = require('./credentials.json');
      // OR, if you cannot save the file locally (like on heroku)
      var creds_json = {
        client_email: 'bavnsofts@gmail.com',
        private_key: 'AIzaSyAobXByEeFH66OmFLeJQLGtjW7aEpVbfxM'
      }
   
      doc.useServiceAccountAuth(creds, step);
    },
    function getInfoAndWorksheets(step) {
      doc.getInfo(function(err, info) {
        console.log('Loaded doc: '+info.title+' by '+info.author.email);
        sheet = info.worksheets[0];
        console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
        step();
      });

     


    },
    function workingWithRows(step) {
      // google provides some query options
      sheet.getRows({
        offset: 1,
        limit: 20,
        orderby: 'col2'
      }, function( err, rows ){

          var data = [];
            
          for(let i=0;i < rows.length;i++){
             console.log(rows[i].broadcategory);

             if(req.body.value=="All items"){

               data.push({
                  broadcategory:rows[i].broadcategory,
                  category:rows[i].category,
                  brand:rows[i].brand,
                  itemdescription:rows[i].itemdescription,
                  price:rows[i].price,
                  individualunitsize:rows[i].individualunitsize,
                  totalavailable:rows[i].totalavailable,
                  totalvolume:rows[i].totalvolume,
                  condition:rows[i].condition,
                  received:rows[i].received,
                  interestingto:rows[i].interestingto,
                  soldto:rows[i].soldto,
                  soldtocategory:rows[i].soldtocategory,
                })

             }else{
               if(rows[i].broadcategory==req.body.value){
                data.push({
                  broadcategory:rows[i].broadcategory,
                  category:rows[i].category,
                  brand:rows[i].brand,
                  itemdescription:rows[i].itemdescription,
                  price:rows[i].price,
                  individualunitsize:rows[i].individualunitsize,
                  totalavailable:rows[i].totalavailable,
                  totalvolume:rows[i].totalvolume,
                  condition:rows[i].condition,
                  received:rows[i].received,
                  interestingto:rows[i].interestingto,
                  soldto:rows[i].soldto,
                  soldtocategory:rows[i].soldtocategory,
                })
              }  

             }
            

          
          }
   
        
          res.send({data:data});
   
        step();
      });
    },


   
  ], function(err){
      if( err ) {
        console.log('Error: '+err);
      }
  });

}) 

app.get('/contact-us', function(req, res){
	res.render('contact_us');
});

app.get('/item-description', function(req, res){
	res.render('item_description');
});

app.get('/receive-disposal-quote', function(req, res){
	res.render('receive_disposal_quote');
});

app.post('/receive_disposal_quote', function(req, res){



  var html = "<div><table style='border: 1px solid;'><thead>"+
  "<tr><th style='text-align:left;border: 1px solid;padding: 12px;'>Name</th><td style='border: 1px solid;padding: 12px;'>"+req.body.username+"</td></tr>"+
  "<tr><th style='text-align:left;border: 1px solid;padding: 12px;'>Business name</th><td style='border: 1px solid;padding: 12px;'>"+req.body.Business+"</td></tr>"+
  "<tr><th style='text-align:left;border: 1px solid;padding: 12px;'>Email Address</th><td style='border: 1px solid;padding: 12px;'>"+req.body.Email+"</td></tr>"+
  "<tr><th style='text-align:left;border: 1px solid;padding: 12px;'>Phone number </th><td style='border: 1px solid;padding: 12px;'>"+req.body.Phone+"</td></tr>"+
  "<tr><th style='text-align:left;border: 1px solid;padding: 12px;'>Address of materials or approximate location </th><td style='border: 1px solid;padding: 12px;'>"+req.body.approximate_location+"</td></tr>"+
  "<tr><th style='text-align:left;border: 1px solid;padding: 12px;'>Full details of material to be disposed</th><td style='border: 1px solid;padding: 12px;'>"+req.body.disposed+"</td></tr>"+
  "<tr><th style='text-align:left;border: 1px solid;padding: 12px;'>How are the materials stored, what kind of units and how many </th><td style='border: 1px solid;padding: 12px;'>"+req.body.materials+"</td></tr>"+
  "<tr><th style='text-align:left;border: 1px solid;padding: 12px;'>Dangerous </th><td style='border: 1px solid;padding: 12px;'>"+req.body.Notdangerousgoods+"</td></tr>"+
  "<tr><th style='text-align:left;border: 1px solid;padding: 12px;'>Pickup by </th><td style='border: 1px solid;padding: 12px;'>"+req.body.Pickup_by_disposal_site+"</td></tr>"+
  "<tr><th style='text-align:left;border: 1px solid;padding: 12px;'>Regulary Dispose </th><td style='border: 1px solid;padding: 12px;'>"+req.body.regulary_dispose+"</td></tr></table></div>"

    transporter.sendMail({
              from: req.body.email, // sender address
              to: "bavnsofts@gmail.com" ,
              subject:'Waste Disposal',
              html: html,
           }, function (err, responseStatus) {
              if (err) {
                  return console.error(err)
              }
             res.send(true);
              return responseStatus;// return from status or as you need;
          })
});


app.post('/book_order',function(req,res){

    console.log(req.body);

      transporter.sendMail({
              from: req.body.email, // sender address
              to: "bavnsofts@gmail.com from" ,
              subject:'Received Inquire from '+req.body.email,
              html: "<div><table style='border: 1px solid;'><thead><tr><th style='text-align:left;border: 1px solid;padding: 12px;'>Email</th><td style='border: 1px solid;padding: 12px;'>"+req.body.email+"</td></tr><tr><th style='text-align:left;border: 1px solid;padding: 12px;'>Phone</th><td style='border: 1px solid;padding: 12px;'>"+req.body.phone+"</td></tr><tr><th style='text-align:left;border: 1px solid;padding: 12px;'>Category</th><td style='border: 1px solid;padding: 12px;'>"+req.body.broadcategory+"</td></tr><tr><th style='text-align:left;border: 1px solid;padding: 12px;'>Price</th><td style='border: 1px solid;padding: 12px;'>"+req.body.price+"</td></tr><tr><th style='text-align:left;border: 1px solid;padding: 12px;'>Description</th><td style='border: 1px solid;padding: 12px;'>"+req.body.itemdescription+"</td></tr></table></div>",
           }, function (err, responseStatus) {
              if (err) {
                  return console.error(err)
              }
             res.send(true);
              return responseStatus;// return from status or as you need;
          })
});

app.post('/contact_us',function(req,res){


   var html = "<div><table style='border: 1px solid;'><thead>"+
  "<tr><th style='text-align:left;border: 1px solid;padding: 12px;'>Email</th><td style='border: 1px solid;padding: 12px;'>"+req.body.emailname+"</td></tr>"+
  "<tr><th style='text-align:left;border: 1px solid;padding: 12px;'>Message</th><td style='border: 1px solid;padding: 12px;'>"+req.body.message+"</td></tr></table></div>";

    transporter.sendMail({
              from: req.body.email, // sender address
              to: "bavnsofts@gmail.com" ,
              subject:req.body.Subject,
              html: html,
           }, function (err, responseStatus) {
              if (err) {
                  return console.error(err)
              }
             res.send(true);
              return responseStatus;// return from status or as you need;
          })
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log("Server started on port " + port));