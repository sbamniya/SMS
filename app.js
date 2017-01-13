    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var morgan = require('morgan');             // log requests to the console (express4)
    var url = require('url'); 
    var stormpath = require('express-stormpath');
    var nodemailer = require('nodemailer');
    var smtpTransport = require('nodemailer-smtp-transport');

    var multer = require('multer'); 

    var mysql = require('mysql');                     // mongoose for mysql
    var connection = require('express-myconnection');
    var pool = require('./db');
    var societymanager = require("./societymanager");
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    
    var crypto = require('crypto');
    var session = require('express-session');
    
    var formidable = require("formidable");
    var fs = require('fs-extra');
    var randomstring = require("randomstring");
    var Q = require('q');
    var step = require('step');
    var slug = require('slug');
    var moment = require("moment");
    var async = require('async');
    var admin = require("./admin");
    var society = require("./society");
    var block = require("./block");
    var societylogin = require("./societylogin");
    var flat = require("./flat");
    var complaint = require("./complaint");

    var slugSociety = require("./slugSociety");
    var photoUpload = require("./photoUpload");
    var loop = require('node-while-loop');
   
    var resident = require("./resident");

    app.use(express.static(__dirname + '/public'));// set the static files location /public/img will be /img for users
    
    app.use(morgan('dev'));  // log every request to the console
    app.use(multer({dest: './uploads'}));
   
    app.use(bodyParser.urlencoded({'extended':'true'}));
   
    app.use(url); 

    app.use(bodyParser.json());  
    // parse application/json
    
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
    // parse  app.use(methodOverride());
    app.use(
        connection(mysql,{

            host: 'localhost',
            user: 'root',
            password : '',
            database:'society_management'
        },'request')
    );//route index, hello world
    app.use(session({secret: 'ssshhhhh',saveUninitialized: true,
                 resave: true}));
    /*Mail Setup*/
       var transporter = nodemailer.createTransport(smtpTransport({
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: 'kalika.deltabee@gmail.com',
                pass: 'kalika@123'
            }
        })); 
   
    /*Routing Handler for resident*/
    app.post('/resident-login', resident.login(crypto,pool));
    app.post('/resident-resetPasswordProcess',resident.resetPasswordProcess(transporter,randomstring,pool));
    app.post('/resident-confirmToken',resident.confirmToken(pool));
    app.post('/resident-updatePassword',resident.updatePassword(crypto,pool));
    app.get('/getresidentList', resident.getresidentList(pool));
    app.post('/addResident',resident.addResident(pool, randomstring,crypto, transporter));
    app.post('/getFlatResident', resident.getFlatResident(pool));
    app.get('/getresidentInfo', resident.getresidentInfo(pool));

    /*Complaints APIs*/
    app.post('/addComplaint', complaint.addComplaint(pool)); 
    app.post('/getcomplaintDetail', complaint.getcomplaintDetail(pool));
    app.get('/getcomplaintList', complaint.getcomplaintList(pool));
    app.get('/complaintToManager', complaint.complaintToManager(pool));

    /*Admin login & other functionality*/
    app.post('/login', admin.login(crypto));
    app.get('/authentication/:access', admin.authenticated);
    app.get('/logout', admin.logout); 
    app.post('/resetPasswordProcess',admin.resetPasswordProcess(transporter,randomstring));
    app.post('/confirmToken',admin.confirmToken);
    app.post('/updatePassword',admin.updatePassword(crypto));


    /*Society Management and other functionality */

    app.post('/checkSlug', slugSociety.checkSlug(slug,moment,async,pool));
    app.post('/addSlug', slugSociety.addSlug(slug,moment,async,pool));
    app.post('/addSociety', society.addSociety(formidable,fs,pool,step));
    app.post('/uploadPhoto', photoUpload.uploadPhoto(formidable,fs,pool));
    app.post('/getSlug', society.getSlug(pool,slug));


    app.post('/getSocietyDetail', society.getSocietyDetail(pool));
    app.post('/getActiveSocieties', society.getActiveSocieties(pool));
    
    


    app.get('/getsocietyList', society.getsocietyList(pool));
    app.post('/deleteSociety', society.deleteSociety(pool));

    app.get('/getblockList', block.getblockList(pool));
    app.post('/editBlock', block.editBlock(pool));

    app.post('/addBlock', block.addBlock(pool));
    app.post('/deleteBlock', block.deleteBlock(pool));
    app.post('/getSingleBlock', block.getSingleBlock(pool));

    app.get('/getmanagerList', societymanager.getmanagerList(pool));
    app.get('/ActiveManagersList', societymanager.ActiveManagersList(pool));
    app.post('/addManager', societymanager.addManager(pool,randomstring,crypto, transporter));
    app.post('/deleteManager', societymanager.deleteManager(pool));
    
    /*Society login*/
    app.post('/society-login', societylogin.login(crypto,pool));
    app.get('/societyBlockList', societymanager.societyBlockList(pool));
    app.post('/checkForSocietyManager', societymanager.checkForSocietyManager(pool));
    app.post('/society-updatePassword',societymanager.updatePassword(crypto,pool));

    
    app.post('/addFlat', flat.addFlat(pool)); 
    app.post('/getFlatList', flat.getFlatList(pool));

    app.post('/society-resetPasswordProcess',societylogin.resetPasswordProcess(transporter,randomstring,pool));
    app.post('/society-confirmToken',societylogin.confirmToken(pool));
    app.post('/societyManager-updatePassword',societylogin.updatePassword(crypto,pool));

    app.use(app.router);
    /*Routing Handler*/
    
    app.listen(8080);
    console.log("App listening on port 8080");