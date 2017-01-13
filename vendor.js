exports.addVendor = function(pool){
  return function(req,res){
    res.setHeader('Content-Type', 'application/json');  
    var vandor_name = req.body.vendor_name;  
    var email = req.body.email;
    var contact =  req.body.contact;
    var id_proof =  req.body.id_proof;
    var block_id =  req.body.block_id;
    var description = req.body.description;  

    var result = {}
    var queryString = "select * from image_temp where id='"+id_proof+"'";
    pool.query(queryString, function(err, rows, fields) {
        if (err){
            result.error= err;
            res.send(JSON.stringify(result)); 
        }else{
            if (rows.length>0) {
                var id_imageName = rows[0].imgName;
                var Q = 'INSERT INTO vendor_master ( `vendor_name`, `email`, `contact`, `id_poof`, `status`, `block_id`, `description`) VALUES ("'+vandor_name+'","'+email+'","'+contact+'","'+id_imageName+'","1", "'+block_id+'", "'+description+'")';
                pool.query(Q, function(err, rows, fields) {
                    var query = "delete from image_temp where id='"+id_proof+"'";
                    pool.query(query, function(err, rows, fields) {
                        result.status = 200;
                        res.send(JSON.stringify(result)); 
                    });
                });
            }else{
                result.error = "Select ID Image."
                res.send(JSON.stringify(result)); 
            }
        }
    });
  }
}

exports.listvendors = function(pool){
  return function(req,res){
    res.setHeader('Content-Type', 'application/json');  
    var block_id = req.body.block_id;
    var result = {}
    var querystring='select * from vendor_master where block_id="'+block_id+'"';
    pool.query(querystring,function(err, rows, fields){
          if(err)
          {
              result.error = err;
          }
        else
          {
            result.data=rows;  
            result.success = "vendor list displayed successfully";
            res.send(JSON.stringify(result)); 
          };  
      });

  }
}

exports.deleteVendor = function(pool){
  return function(req,res){
    res.setHeader('Content-Type', 'application/json');
    var vendor_id = req.body.id;  
    var result = {}
    var querystring='delete from vendor_master where id="'+vendor_id +'"';
    pool.query(querystring,function(err, rows, fields){
          if(err)
          {
              result.error = err;
          }
        else
          {
            result.success = "vendor Deleted successfully";
            res.send(JSON.stringify(result)); 
          };  
      });
  }
}

exports.updateVendor = function(pool){
  return function(req,res){
    res.setHeader('Content-Type', 'application/json');
    var vendor_id = req.body.id;
    var description = req.body.description;  
    var vendor_name = req.body.vendor_name;
    var vendor_email = req.body.email;  
    var contact = req.body.contact;  
    var result = {};
    var querystring='update vendor_master SET vendor_name = "'+vendor_name+'", email = "'+vendor_email+'",contact ="'+contact+'",description="'+description+'" where id="'+vendor_id +'"';
    pool.query(querystring,function(err, rows, fields){
          if(err)
          {
              result.error = err;
          }
        else
          {
            result.data=rows;  
            result.success = "vendor updated successfully";
            res.send(JSON.stringify(result)); 
          };  
      });
  }
}
