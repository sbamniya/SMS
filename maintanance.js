exports.addmaintanance = function(pool, transporter) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var month = req.body.month;
        var year = req.body.year;
        var amount = req.body.amount;
        var last_payment_date = req.body.last_payment_date;
        var block_id = req.body.block_id;

        var result = {}
        var Q = 'select * from maintainance_master where month="' + month + '" and year = "' + year + '"';
        pool.query(Q, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length > 0) {
                    result.success = "you are Alredy added maintanance for this month";
                    res.send(JSON.stringify(result));
                    return;
                } else {
                    var querystring = 'INSERT INTO maintainance_master(`month`, `year`, `amount`, `last_payment_date`, `block_id`, `staus`) VALUES ("' + month + '","' + year + '","' + amount + '","' + last_payment_date + '","' + block_id + '","0")';
                    pool.query(querystring, function(err, rows, fields) {
                        if (err) {
                            result.error = err;
                            console.log(err);
                        } else {
                            var Q = 'select r.id,concat(r.first_name," ",r.last_name) as resident_name,r.email as resident_email  FROM residents r INNER JOIN flat_master fm ON r.flat_id=fm.id where block_id = "' + block_id + '"';
                            pool.query(Q, function(err, rows) {
                                if (err) {
                                    result.error = err;
                                    console.log(err);
                                } else {
                                    for (var i = 0; i < rows.length; i++) {
                                        var resident_name = rows[i].resident_name;
                                        var email = rows[i].resident_email;
                                        transporter.sendMail({
                                            from: 'kalika.deltabee@gmail.com',
                                            to: email,
                                            subject: 'About Maintainance',
                                            html: 'Hello ' + resident_name + '!<br/><br> Your Maintainance for ' + month + ',' + year + ' is ' + amount + ' <br/> please pay your maintainance as soon as possible <br/><br/>Thank You.'
                                        }, function(error, response) {
                                            if (error) {
                                                console.log(error);
                                            } else {
                                                console.log('Message sent');
                                            }
                                        });
                                    }
                                    result.success = "Manager generate mantainance successfully";
                                    res.send(JSON.stringify(result));

                                }

                            })
                        };
                    });

                }
            }
        });

    };
};

exports.maintananceListToManager = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var manager_id = req.body.block_id;

        var result = {}
        var querystring = 'select * from maintainance_master where block_id="' + manager_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "mantainance successfully displayed";
                res.send(JSON.stringify(result));
            };
        });
    };
};

exports.maintananceListToResident = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var resident_id = req.body.resident_id;
        var result = {}
        var querystring = 'select mm.* from maintainance_master mm INNER JOIN society_manager sm ON mm.manager_id = sm.id INNER JOIN block_master bm ON sm.id = bm.block_manager INNER JOIN flat_master fm ON bm.id = fm.block_id INNER JOIN residents r ON fm.id = r.flat_id where r.id = "' + resident_id + '"  ';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "mantainance successfully displayed";
                res.send(JSON.stringify(result));
            };
        });
    };
};

exports.allResidentList = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var block_id = req.body.block_id;
        var result = {}
        var querystring = 'select concat(r.first_name," ",r.last_name) as resident_name,r.contact_no,r.email,sm.manager_name,mm.* from maintainance_master mm INNER JOIN block_master bm ON mm.block_id = bm.block_manager INNER JOIN society_manager sm on bm.block_manager=sm.id INNER JOIN flat_master fm ON bm.id = fm.block_id INNER JOIN residents r ON fm.id = r.flat_id where bm.id="' + block_id + '" GROUP BY id ';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "mantainance successfully displayed";
                res.send(JSON.stringify(result));
            };
        });
    };
}
/*exports.displayMaintananceToResidents = function(pool, transporter) {
    return function(req, res) {
        res.setHeader('content-Type', 'application/json');
        var result = {}
        var Q = 'select r.id,concat(r.first_name," ",r.last_name) as resident_name,r.email as resident_email  FROM residents r INNER JOIN flat_master fm ON r.flat_id=fm.id where block_id = "' + block_id + '"';
        pool.query(Q, function(err, rows) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                for (var i = 0; i < rows.length; i++) {

                }
                result.success = "Manager generate mantainance successfully";
                res.send(JSON.stringify(result));
            }
        })
    }
}
}
*/
