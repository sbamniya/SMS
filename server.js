    var express = require('express');
    var app = express(); // create our app w/ express
    var router = express.Router();

    var morgan = require('morgan'); // log requests to the console (express4)
    var url = require('url');
    var stormpath = require('express-stormpath');
    var nodemailer = require('nodemailer');
    var smtpTransport = require('nodemailer-smtp-transport');
    var router = require("./routes");
    var multer = require('multer');
    var mysql = require('mysql'); // mongoose for mysql
    var connection = require('express-myconnection');

    var querystring = require('querystring');
    //var http = require('https');

    var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
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

    var pool = require('./db');
    var admin = require("./admin");
    var block = require("./block");
    var complaint = require("./complaint");
    var flat = require("./flat");
    var resident = require("./resident");
    var societylogin = require("./societylogin");
    var society = require("./society");
    var societymanager = require("./societymanager");
    var slugSociety = require("./slugSociety");
    var photoUpload = require("./photoUpload");
    var staff = require("./staff");
    var visitor = require("./visitor");
    var facility = require("./facility");
    var vendor = require('./vendor');
    var parking = require('./parking');
    var services = require('./service');
    var notice = require('./notice');
    var amenities = require('./aminities');
    var money_management = require('./money_management');
    var jobcard = require('./jobcard');
    var maintainace_category_master = require('./maintanance_category');
    var payment = require('./payment.js');
    var maintainance = require('./maintanance');
    var family = require('./family.js');
    var contribution = require('./contribution');

    var loop = require('node-while-loop');

    app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

    app.use(morgan('dev')); // log every request to the console
    app.use(multer({ dest: './uploads' }));

    app.use(bodyParser.urlencoded({ 'extended': 'true' }));

    app.use(url);

    app.use(bodyParser.json());
    // parse application/json

    app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
    // parse  app.use(methodOverride());


    app.use(session({
        secret: 'ssshhhhh',
        saveUninitialized: true,
        resave: true
    }));
    /*Mail Setup*/
    var transporter = nodemailer.createTransport(smtpTransport({
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
            user: 'kalika.deltabee@gmail.com',
            pass: 'Delta09098888!@#'
        }
    }));
    /*socket.io*/
    http = require('http'),
        appCom = http.createServer(app),
        io = require('socket.io').listen(appCom, { path: '/aprxyz.track' });
    var usernames = {};
    var usertracktracking = {};
    var roomObj = { rooms: '' };
    var roomData = {};
    roomObj.rooms = [];
    if (io.sockets.length > 0) {
        io.sockets.sockets.forEach(function(s) {
            s.disconnect(true);
        });
    }

    var queryString = 'SELECT id FROM block_master';

    function callback(data) {
        roomObj.rooms.push(data);
        console.log(roomObj.rooms);
        roomData[data] = {};

    }

    pool.query(queryString, function(err, rows, fields) {
        if (err) {

            //result.error = err;
            console.log(err);
        } else {
            for (var i = rows.length - 1; i >= 0; i--) {
                callback(rows[i].id.toString());
            }

        }


    });

    var rooms = roomObj.rooms;

    io.sockets.on('connection', function(socket) {

        // when the client emits 'adduser', this listens and executes
        socket.on('adduser', function(username, block, access) {

            socket.username = username;
            // store the room name in the socket session for this client
            socket.room = client;
            // add the client's username to the global list
            usernames[username] = username;
            // send client to room 1
            socket.join(client);
            // echo to client they've connected
            usertracktracking[socket.username] = { count: 0 };


        });

        // when the user disconnects.. perform this
        socket.on('disconnect', function() {
            // remove the username from global usernames list
            var pack = usertracktracking[socket.username];
            if (typeof pack == 'object' && pack.hasOwnProperty('data')) {
                api.addTrack(pool, pack);
                rec = pack.data;
                v = s = '';
                if (rec.hasOwnProperty('vendor_id')) {
                    v = rec.vendor_id;
                }
                if (rec.hasOwnProperty('session_id')) {
                    s = rec.session_id;
                }
                io.sockets.in(v).emit('removerecord', s);
            }
            //io.sockets.in().emit('removerecord',pack.data);
            delete usertracktracking[socket.username];
            delete usernames[socket.username];
            socket.leave(socket.room);
        });
    });
    /*Routing Handler for resident*/
    app.post('/resident-login', resident.login(crypto, pool));
    app.post('/resident-resetPasswordProcess', resident.resetPasswordProcess(transporter, randomstring, pool));
    app.post('/resident-confirmToken', resident.confirmToken(pool));
    app.post('/resident-updatePassword', resident.updatePassword(crypto, pool));
    app.get('/getresidentList', resident.getresidentList(pool));

    app.post('/getSimpleResidentListOfBlock', resident.getSimpleResidentListOfBlock(pool));

    app.post('/addResident', resident.addResident(pool, randomstring, crypto, transporter));
    app.post('/getFlatResident', resident.getFlatResident(pool));
    app.get('/getresidentInfo', resident.getresidentInfo(pool));
    app.post('/residentProfile', resident.residentProfile(pool));
    app.post('/updateresidentProfile', resident.updateresidentProfile(pool));

    app.post('/updateresidentProfileAllDetails', resident.updateresidentProfileAllDetails(pool));


    app.post('/knowTenantAssignment', resident.knowTenantAssignment(pool));
    app.post('/addTenant', resident.addTenant(pool, step));
    app.post('/updateTenantMeta', resident.updateTenantMeta(pool));
    app.post('/tenantMoveOut', resident.tenantMoveOut(pool));


    app.get('/getTenantList', resident.getTenantList(pool));
    app.post('/tenantDetail', resident.tenantDetail(pool));
    app.get('/neighbourList', resident.neighbourList(pool));
    app.get('/tenantList', resident.tenantList(pool));
    app.post('/residentsBlockId', resident.residentsBlockId(pool));




    /*Complaints APIs*/
    app.post('/addComplaint', complaint.addComplaint(pool));
    app.post('/getcomplaintDetail', complaint.getcomplaintDetail(pool));
    app.get('/getcomplaintList', complaint.getcomplaintList(pool));
    app.get('/complaintToManager', complaint.complaintToManager(pool));
    app.post('/updatecomplaint', complaint.updatecomplaint(pool));
    app.get('/getNewNotifications', complaint.getNewNotifications(pool));
    app.post('/getComplaintsStatusForResident', complaint.getComplaintsStatusForResident(pool));
    app.post('/getComplaintsStatusForManager', complaint.getComplaintsStatusForManager(pool));
    app.post('/getComplaintsStatusForAdmin', complaint.getComplaintsStatusForAdmin(pool));
    app.post('/survillanceComplaintsStatusForResident', complaint.survillanceComplaintsStatusForResident(pool, transporter));

    /*Admin login & other functionality*/
    app.post('/login', admin.login(crypto, pool));
    app.get('/authentication/:access', admin.authenticated);
    app.get('/logout', admin.logout);
    app.post('/resetPasswordProcess', admin.resetPasswordProcess(transporter, randomstring, pool));
    app.post('/confirmToken', admin.confirmToken(pool));
    app.post('/updatePassword', admin.updatePassword(crypto, pool));


    /* Slug Society and other functionality */
    app.post('/checkSlug', slugSociety.checkSlug(slug, moment, async, pool));
    app.post('/addSlug', slugSociety.addSlug(slug, moment, async, pool));
    app.post('/addSociety', society.addSociety(formidable, fs, pool, step));
    app.post('/uploadPhoto', photoUpload.uploadPhoto(formidable, fs, pool));
    app.post('/getSlug', society.getSlug(pool, slug));

    /*Society Management*/
    app.post('/getSocietyDetail', society.getSocietyDetail(pool));
    app.post('/getActiveSocieties', society.getActiveSocieties(pool));
    app.get('/getsocietyList', society.getsocietyList(pool));
    app.get('/getAllSocieties', society.getAllSocieties(pool));
    app.post('/getBySocietyId', society.getBySocietyId(pool));
    app.post('/deleteSociety', society.deleteSociety(pool));
    app.post('/payUdetailsOfSociety', society.payUdetailsOfSociety(pool));
    app.post('/payUdetailsOfSocietyByResident', society.payUdetailsOfSocietyByResident(pool));



    app.post('/getResidentsForAdminByBlockId', society.getResidentsForAdminByBlockId(pool));
    app.post('/getTenatsForAdminByBlockId', society.getTenatsForAdminByBlockId(pool));

    /*Block Management*/
    app.get('/getblockList', block.getblockList(pool));
    app.post('/editBlock', block.editBlock(pool));
    app.post('/addBlock', block.addBlock(pool));
    app.post('/deleteBlock', block.deleteBlock(pool));
    app.post('/getSingleBlock', block.getSingleBlock(pool));

    /*Society Manager functionality*/
    app.get('/getmanagerList', societymanager.getmanagerList(pool));
    app.get('/ActiveManagersList', societymanager.ActiveManagersList(pool));
    app.post('/addManager', societymanager.addManager(pool, randomstring, crypto, transporter));
    app.post('/deleteManager', societymanager.deleteManager(pool));
    app.get('/societyBlockList', societymanager.societyBlockList(pool));
    app.post('/checkForSocietyManager', societymanager.checkForSocietyManager(pool));
    app.post('/society-updatePassword', societymanager.updatePassword(crypto, pool));
    app.post('/paymentDuesFromManager', societymanager.paymentDuesFromManager(pool));
    app.post('/paymentDuesFromManagerForUpdate', societymanager.paymentDuesFromManagerForUpdate(pool));
    app.post('/paymentDuesFromManagerForSinglePay', societymanager.paymentDuesFromManagerForSinglePay(pool));

    /*Flat Management*/
    app.post('/addFlat', flat.addFlat(pool));
    app.post('/getFlatList', flat.getFlatList(pool));
    app.post('/AllFlatsOfBlock', flat.AllFlatsOfBlock(pool));
    app.post('/updateFlatDetails', flat.updateFlatDetails(pool));
    app.post('/getFlatDetails', flat.getFlatDetails(pool));
    app.post('/forPieChart', flat.forPieChart(pool));

    /*Society login*/
    app.post('/society-login', societylogin.login(crypto, pool));
    app.post('/society-resetPasswordProcess', societylogin.resetPasswordProcess(transporter, randomstring, pool));
    app.post('/society-confirmToken', societylogin.confirmToken(pool));
    app.post('/societyManager-updatePassword', societylogin.updatePassword(crypto, pool));

    /*Staff*/
    app.get('/getStaffTypes', staff.getStaffTypes(pool));
    app.post('/addStaff', staff.addStaff(pool, transporter, randomstring));
    app.get('/staffListByBlock', staff.staffListByBlock(pool));
    app.post('/staffListByBlockSimple', staff.staffListByBlockSimple(pool));
    app.post('/deleteStaff', staff.deleteStaff(pool));
    app.post('/getStaffDetails', staff.getStaffDetails(pool));
    app.post('/sendDetailstoManager', staff.sendDetailstoManager(pool, transporter));
    app.post('/sendApproveDetails', staff.sendApproveDetails(pool, transporter));
    app.post('/ManagerLoginForArroveServent', staff.ManagerLoginForArroveServent(pool, crypto));
    app.post('/ManagerLoginForArroveFacility', staff.ManagerLoginForArroveFacility(pool, crypto));

    app.post('/staffListForResident', staff.staffListForResident(pool));
    app.post('/staffRequestesForManager', staff.staffRequestesForManager(pool));
    /*Staff Action (Login & Etc)*/
    app.post('/staff-login', staff.staffLogin(crypto, pool));
    app.post('/staffAttendance', staff.staffAttendance(pool));
    app.post('/attandanceForManager', staff.attandanceForManager(pool));

    /*Visitor Section*/
    app.post('/getVisitorsForStaff', visitor.getVisitorsForStaff(pool));
    app.post('/getVisitorsForResident', visitor.getVisitorsForResident(pool));
    app.post('/addVisitorsByResident', visitor.addVisitorsByResident(pool, transporter));
    app.post('/addVisitorsByStaff', visitor.addVisitorsByStaff(pool, transporter));
    app.post('/getVisitorDetail', visitor.getVisitorDetail(pool));
    app.post('/UpdateVisitorDetails', visitor.UpdateVisitorDetails(pool, transporter));
    app.post('/UpdateVisitorEntryDetails', visitor.UpdateVisitorEntryDetails(pool, transporter));
    app.post('/ExternalVisitorsForManager', visitor.ExternalVisitorsForManager(pool));

    /*Servent*/
    app.post('/servantsList', staff.servantsList(pool));

    /*Facility*/
    app.post('/addFacility', facility.addFacility(pool));
    app.post('/listFacilities', facility.listFacilities(pool));
    app.post('/getSingleFacility', facility.getSingleFacility(pool));
    app.post('/deleteFacilities', facility.deleteFacilities(pool));
    app.post('/updateFacility', facility.updateFacility(pool));
    app.post('/requestToManagerForFacility', facility.requestToManagerForFacility(pool, transporter));
    app.post('/sendApproveDetailsToResidentAboutFacility', facility.sendApproveDetailsToResidentAboutFacility(pool, transporter));
    app.post('/listOfFacilitiesForResident', facility.listOfFacilitiesForResident(pool));
    app.post('/listOfRequestedFacilitiesForResident', facility.listOfRequestedFacilitiesForResident(pool));
    app.post('/facilityRequestesForManager', facility.facilityRequestesForManager(pool));

    /*vendor*/
    app.post('/addVendor', vendor.addVendor(pool, transporter));
    app.post('/listvendors', vendor.listvendors(pool));
    app.post('/deleteVendor', vendor.deleteVendor(pool));
    app.post('/updateVendor', vendor.updateVendor(pool));
    app.post('/vendorEntryByStaff', vendor.vendorEntryByStaff(pool));
    app.post('/listVendorsEntry', vendor.listVendorsEntry(pool));
    app.post('/VendorExitDetailsByStaff', vendor.VendorExitDetailsByStaff(pool));

    /*parking management*/
    app.post('/addParking', parking.addParking(pool));
    app.get('/getParkingList', parking.getParkingList(pool));
    app.post('/deleteAssingParking', parking.deleteAssingParking(pool));
    app.post('/assingParking', parking.assingParking(pool));

    /*Service*/
    app.post('/service_request', services.service_request(pool));
    app.post('/requestedServicesListToAdmin', services.requestedServicesListToAdmin(pool));
    app.post('/addService', services.addService(pool));
    app.post('/deleteService', services.deleteService(pool));
    app.post('/ListServices', services.ListServices(pool));
    app.post('/updateServiceRequestStatus', services.updateServiceRequestStatus(pool));
    app.post('/listOfRequestedServicesToResident', services.listOfRequestedServicesToResident(pool));

    /*Notice*/
    app.post('/insertNotice', notice.insertNotice(pool, transporter));
    app.post('/listOfNoticeToManager', notice.listOfNoticeToManager(pool));
    app.post('/sentNoticeToResidents', notice.sentNoticeToResidents(pool, transporter));

    /*Amenities*/
    app.post('/addAmenities', amenities.addAmenities(pool));
    app.post('/listAmenities', amenities.listAmenities(pool));
    app.post('/getSingleAmility', amenities.getSingleAmility(pool));
    app.post('/deleteAmenities', amenities.deleteAmenities(pool));
    app.post('/updateAmenities', amenities.updateAmenities(pool));
    app.post('/listOfAmenitiesForResident', amenities.listOfAmenitiesForResident(pool));
    app.post('/requestToManagerForAmenities', amenities.requestToManagerForAmenities(pool, transporter));
    app.post('/listOfRequestedAmenitiesForResident', amenities.listOfRequestedAmenitiesForResident(pool));
    app.post('/requestedResidentForAmenitiesToManager', amenities.requestedResidentForAmenitiesToManager(pool));
    app.post('/sendApproveDetailsToResidentAboutAmenities', amenities.sendApproveDetailsToResidentAboutAmenities(pool, transporter));
    app.post('/checkDateForAmenity', amenities.checkDateForAmenity(pool));

    /*Money Management*/
    app.post('/residentAllFacilityMaintainance', money_management.residentAllFacilityMaintainance(pool));
    app.post('/residentAllAmenityMaintainance', money_management.residentAllAmenityMaintainance(pool));

    /*Job Card*/
    app.post('/addJobcard', jobcard.addJobcard(pool));
    app.post('/allCategory', maintainace_category_master.allCategory(pool));
    app.post('/jobcardDetails', jobcard.jobcardDetails(pool));
    app.post('/deleteJobcardStatus', jobcard.deleteJobcardStatus(pool));
    app.post('/singlejobcardDetailsWithVendor', jobcard.singlejobcardDetailsWithVendor(pool));
    app.post('/jobcardDetailsForPrint', jobcard.jobcardDetailsForPrint(pool));
    app.post('/getJobCardsByVendorID', jobcard.getJobCardsByVendorID(pool));

    /*payment management*/
    app.post('/payment-success', payment.addPaymentDetails(pool));
    app.post('/payment-fail', payment.addPaymentDetails(pool));

    app.post('/displayPaymentDetails', payment.displayPaymentDetails(pool));
    app.post('/paymentReceipt', payment.paymentReceipt(pool));
    app.post('/transactionHistoryToManager', payment.transactionHistoryToManager(pool));
    app.post('/getFacilityName', payment.getFacilityName(pool));
    app.post('/getAmenityName', payment.getAmenityName(pool));
    app.post('/managersDueForVendor', payment.managersDueForVendor(pool));
    app.post('/displayExpenseHistoryToManager', payment.displayExpenseHistoryToManager(pool));
    app.post('/detailsAboutVendorToManager', payment.detailsAboutVendorToManager(pool));


    /*family management*/
    app.post('/addFamilyMember', family.addFamilyMember(pool));
    app.post('/getFamiliyMembersForresident', family.getFamiliyMembersForresident(pool));

    /* maintanance management */
    app.post('/maintainance', maintainance.addmaintanance(pool, transporter));
    app.post('/maintananceListToManager', maintainance.maintananceListToManager(pool));
    app.post('/maintananceListToResident', maintainance.maintananceListToResident(pool));
    app.post('/allResidentList', maintainance.allResidentList(pool));
    app.post('/displayMaintananceToResidents', maintainance.displayMaintananceToResidents(pool));
    app.post('/residentDetailsForMaintainance', maintainance.residentDetailsForMaintainance(pool));
    app.post('/paidResidentList', maintainance.paidResidentList(pool));
    app.post('/unpaidResidentList', maintainance.unpaidResidentList(pool));
    app.post('/notifyToResident', maintainance.notifyToResident(pool));

    /*Contribution */
    app.post('/addContribution', contribution.addContribution(pool));
    app.post('/listContribution', contribution.listContribution(pool));
    app.post('/deleteContri', contribution.deleteContri(pool));
    app.post('/getSingleContributions', contribution.getSingleContributions(pool));
    app.post('/listOfPaidContributionByResident', contribution.listOfPaidContributionByResident(pool));

    /*Create Hash*/
    app.post('/createHash', function(req, res) {
        var data = req.body.string;
        var $data = crypto.createHash('sha512').update(data).digest("hex")
        res.send($data);
    });

    /*Routing Handler*/
    app.use(app.router);

    appCom.listen(process.env.PORT || 3000);
    app.listen(process.env.PORT || 2000);

    console.log("App listening on port 2000");
