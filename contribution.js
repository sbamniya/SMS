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

exports.deleteContri = function(pool){
    return function(req,res){
        res.setHeader('Content-Type', 'application/json');
        var contri_id = req.body.id; 
        var result = {}
        var querystring='delete from contribution where id="'+contri_id +'"';
        pool.query(querystring,function(err, rows, fields){
            if(err)
            {
                result.error = err;
                console.log(err);
            }
            else
            {
                result.data=rows;  
                result.success = "Contribution Deleted successfully";
                res.send(JSON.stringify(result)); 
            };  
        });
    }
}

exports.getSingleContributions = function(pool){
    return function(req,res){
        res.setHeader('Content-Type', 'application/json');  
        var id = req.body.id;
        var result = {}
        var querystring='select * from contribution where id="'+id+'"';
        pool.query(querystring,function(err, rows, fields){
            if(err)
            {
                console.log(err);
                result.error = err;
            }
            else
            {
                result.data = rows[0];  
                result.success = "Contribution Displayed successfully";
                res.send(JSON.stringify(result)); 
            };  
        });
    }
}

exports.listOfPaidContributionByResident = function(pool){
    return function(req,res){
        res.setHeader('Content-Type', 'application/json');  
        var contribution_id = req.body.id;
        var result = {}
        var querystring='select DISTINCT c.*,cm.*,r.* from contribution c INNER JOIN contribution_master cm ON c.id = cm.contribution_id INNER JOIN residents r ON r.id = cm.resident_id INNER Join flat_master fm ON fm.id = r.flat_id INNER JOIN block_master bm ON fm.block_id = bm.id INNER JOIN contribution cc ON bm.id = cc.block_id where c.id = "'+contribution_id+'"';
        pool.query(querystring,function(err, rows, fields){
            if(err)
            {
                console.log(err);
                result.error = err;
            }
            else
            {
                result.data = rows[0];  
                result.success = "Contribution List Displayed successfully";
                res.send(JSON.stringify(result)); 
            };  
        });
    }
}

/*
exports.listOfUnpaidContributionByResidentToManager = function(pool){
    return function(req,res){
        res.setHeader('Content-Type', 'application/json');  
        var contribution_id = req.body.id;
        var result = {}
        var querystring='select DISTINCT c.*,cm.*,r.* from contribution c INNER JOIN contribution_master cm ON c.id = cm.contribution_id INNER JOIN residents r ON r.id = cm.resident_id INNER Join flat_master fm ON fm.id = r.flat_id INNER JOIN block_master bm ON fm.block_id = bm.id INNER JOIN contribution cc ON bm.id = cc.block_id where c.id = "'+contribution_id+'"';
        pool.query(querystring,function(err, rows, fields){
            if(err)
            {
                console.log(err);
                result.error = err;
            }
            else
            {
                result.data = rows[0];  
                result.success = "Contribution Displayed successfully";
                res.send(JSON.stringify(result)); 
            };  
        });
    }
}*/
