exports.addPaymentDetails = function(pool) {
    return function(req, res) {
        console.log(req.body);
        var result = {};
        var data = JSON.parse(JSON.stringify(req.body));
        var merchantTransactionId = data.txnid;

        var mihpayid = data.mihpayid;
        var paymentId = data.encryptedPaymentId;
        var mode = data.mode;
        var status_for_data = data.status;
        var txnid = data.txnid;
        var amount = data.amount;
        var additionalCharges = 0;
        var addedon = data.addedon;
        var productinfo = data.productinfo;
        var firstname = data.firstname;
        var email = data.email;
        var phone = data.phone;
        var hash = data.hash;
        var bank_ref_num = data.bank_ref_num;
        var bankcode = data.bankcode;
        var name_on_card = data.name_on_card;
        var cardnum = data.cardnum;
        var net_amount_debit = data.net_amount_debit;
        var discount = data.discount;
        var payuMoneyId = data.payuMoneyId;
        var resident_id = data.udf1;
        var transaction_status = data.status;
        var status = 1;
        
        var proInfo = JSON.parse(productinfo);
        var productstr = JSON.stringify(proInfo);

        for (var i = 0; i < proInfo.length; i++) {

            var type = proInfo[i].type;
            var id = proInfo[i].id;

            var Query = '';
            var tableName = '';
            var setData = '';
            var where = '';
            if (type == 'Facility') {
                tableName = 'facility_request';
                setData = 'status=2';
                where = 'id ="' + id + '"';

                var Q = 'update facility_request set last_payment_date=now() where ' + where;
                pool.query(Q, function(err) {
                    if (err) {
                        console.log(err);
                    }
                });

            } else if (type == 'Amenity') {
                tableName = 'amenity_request';
                setData = 'status=2';
                where = 'id ="' + id + '"';
            } else {

            }
            Query = 'update ' + tableName + ' set ' + setData + ' where ' + where;
            pool.query(Query, function(err, rows) {
                if (err) {
                    console.log(err);
                }
            });
        }
        pool.query('INSERT INTO transaction_history(`merchantTransactionId`, `mihpayid`, `paymentId`, `mode`, `status_for_data`, `txnid`, `amount`, `additionalCharges`, `addedon`, `productinfo`, `firstname`, `email`, `phone`, `hash`, `bank_ref_num`, `bankcode`, `name_on_card`, `cardnum`, `net_amount_debit`, `discount`, `payuMoneyId`, `transaction_status`,`resident_id`,`status`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [merchantTransactionId, mihpayid, paymentId, mode, status_for_data, txnid, amount, additionalCharges, addedon, productstr, firstname, email, phone, hash, bank_ref_num, bankcode, name_on_card, cardnum, net_amount_debit, discount, payuMoneyId, transaction_status, resident_id, status], function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                var host = req.protocol + '://' + req.headers.host + '/';
                setTimeout(function() {
                    res.writeHead(301, {
                        Location: host
                    });
                    res.end();
                }, 2000)

            }
        })
    }
}

exports.displayPaymentDetails = function(pool) {
    return function(req, res) {
        var result = {};
        var trasaction_id = req.body.id;
        var Q = 'select * from transaction_history where resident_id = "' + trasaction_id + '"';
        pool.query(Q, function(err, rows) {
            if (err) {
                result.error = err;
            } else {
                result.status = '200';
                result.data = rows;
            }
            res.send(JSON.stringify(result));
        });
    }
}

exports.paymentReceipt = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var trasaction_id = req.body.id;
        var Q = 'select th.*,concat(r.first_name," ",r.last_name) as resident_name,bm.name,th.email as email,th.phone as phone_number,fm.flat_number,sm.manager_name,sm.email as manager_email from transaction_history th INNER JOIN residents r ON th.resident_id = r.id INNER JOIN flat_master fm ON fm.id = r.flat_id  INNER JOIN block_master bm ON bm.id= fm.block_id INNER JOIN society_manager sm ON bm.block_manager = sm.id where th.id="' + trasaction_id + '"';
        pool.query(Q, function(err, rows) {
            if (err) {
                result.error = err;
            } else {
                result.data = rows[0];
                result.success = "Payment Receipt displayed successfully";
                res.send(JSON.stringify(result));
            };
        })
    }
}

exports.transactionHistoryToManager = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var block_id = req.body.id;
        var Q = 'SELECT tr.*, concat(r.first_name, " ", r.last_name) as resident_name, fm.flat_number, bm.name from transaction_history tr INNER JOIN residents r on r.id = tr.resident_id INNER JOIN flat_master fm on fm.id = r.flat_id INNER JOIN block_master bm on bm.id= fm.block_id INNER JOIN society_manager sm on sm.id = bm.block_manager where bm.id = "' + block_id + '"';
        pool.query(Q, function(err, rows) {
            if (err) {
                result.error = err;
            } else {
                result.data = rows;
                result.success = "displayed successfully";
                res.send(JSON.stringify(result));
            };
        })
    }
}

exports.getAmenityName = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var id = req.body.id;
        var Q = 'select aminity_name as name from amenities_master where id ="' + id + '"';
        pool.query(Q, function(err, rows) {
            if (err) {
                result.error = err;
            } else {
                result.data = rows[0];
                result.success = "displayed successfully";
                res.send(JSON.stringify(result));
            };
        })
    }
}

exports.getFacilityName = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var id = req.body.id;
        var Q = 'select facility_name as name from facility_master where id ="' + id + '"';
        pool.query(Q, function(err, rows) {
            if (err) {
                result.error = err;
            } else {
                result.data = rows[0];
                result.success = "displayed successfully";
                res.send(JSON.stringify(result));
            };
        })
    }
}


exports.managersDueForVendor = function(pool) {
    return function(req, res) {

        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var vendor_id = req.body.vendor_id;
        var jobcard_id = req.body.jobcard_id;
        var payment_type = req.body.payment_type;
        var d = new Date(req.body.paydate);
        var payment_date = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes();



        var Q = 'INSERT INTO `expenses_history`(`vendor_id`, `jobcard_id`, `payment_type`, `date`, `status`) VALUES ("' + vendor_id + '","' + jobcard_id + '","' + payment_type + '","' + payment_date + '","1")';
        pool.query(Q, function(err, rows) {
            if (err) {
                result.error = err;
            } else {
                result.success = "inserted successfully";
                res.send(JSON.stringify(result));
            };
        })
    }
}
