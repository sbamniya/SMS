/*exports.addContribution = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var contribution_sub = req.body.contribution_sub;
        var charge = req.body.charge;
        var description = req.body.description;
        var block_id = req.body.block_id;
        var image = req.body.image;
        var result = {}
        var queryString = "select * from image_temp where id ='" + image + "'";
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
                res.send(JSON.stringify(result));
            } else {
                console.log(rows.length);
                if (rows.length > 0) {
                    var id_imageName = rows[0].imgName;
                    var Q = 'INSERT INTO contribution (`title`, `amount`, `block_id`, `description`, `image`, `status`) VALUES ("' + contribution_sub + '","' + charge + '","' + block_id + '","' + description + '","' + id_imageName + '","0")';
                    pool.query(Q, function(err, rows, fields) {
                        if (err) {
                            console.log(err);
                        } else {
                            var query = "delete from image_temp where id='" + image + "'";
                            pool.query(query, function(err, rows, fields) {
                                if (err) {
                                    console.log(err)
                                } else {
                                    result.status = 200;
                                    res.send(JSON.stringify(result));
                                }
                            });
                        }

                    });
                } else {
                    result.error = "Select Image."
                    res.send(JSON.stringify(result));
                }

            }
        });
    }
}
*/



exports.addContribution = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var contribution_sub = req.body.contribution_sub;
        var charge = req.body.charge;
        var description = req.body.description;
        var block_id = req.body.block_id;
        var image = req.body.image;
        var result = {}
        var queryString = "select * from image_temp where id='" + image + "'";
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
                res.send(JSON.stringify(result));
            } else {
                if (rows.length > 0) {
                    var id_imageName = rows[0].imgName;
                    var Q = 'INSERT INTO contribution (`title`, `amount`, `block_id`, `description`, `image`, `status`) VALUES ("' + contribution_sub + '","' + charge + '","' + block_id + '","' + description + '","' + id_imageName + '","0")';
                    pool.query(Q, function(err, rows, fields) {
                        var query = "delete from image_temp where id='" + image + "'";
                        pool.query(query, function(err, rows, fields) {
                            result.status = 200;
                            res.send(JSON.stringify(result));
                        });
                    });
                } else {
                    result.error = "Select Image."
                    res.send(JSON.stringify(result));
                }
            }
        });
    }
}

exports.listContribution = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var block_id = req.body.block_id;
        var result = {}
        var querystring = 'select * from contribution where block_id="' + block_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "Contribution Displayed successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}
