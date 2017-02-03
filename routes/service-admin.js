var service_admin = require('../service_admin');

exports.rLogin =  function(req, res) {
        var userName = req.body.userName;
        var password = req.body.password;
        var result = admin.login(userName, password,res);
 };