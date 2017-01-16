exports.service_request = function(pool){
    return function(req,res){
        res.setHeader('Content-Type', 'application/json');
        var resident_id = req.body.resident_id ;
        var service_id = req.body.service_id;
        var resident_comment = req.body.resident_comment;
        var date = new Date(req.body.req_date);
        var hours = date.getHours();
        var minutes = date.getMinutes();

        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes;
        var month = parseInt(date.getMonth());
        var req_date = date.getFullYear() +"-"+ (month+1) + "-" + date.getDate() + "  " + strTime;

        var queryString='INSERT INTO service_request( service_type ,resident_id,date,status, resident_comment) VALUES("'+service_id+'" ,"'+resident_id+'","'+req_date+'","0", "'+resident_comment+'")';
        var result = {};
        pool.query(queryString, function(err, rows, fields)  {
            if (err)
            {
                result.error= err;
                console.log(err);
            }
            else{
                result.success = "service requested successfully";
                res.send(JSON.stringify(result)); 
            }
        });  
    };
};

exports.requestedServicesListToAdmin = function(pool){
    return function(req,res){
        res.setHeader('Content-Type', 'application/json');
        var queryString = 'select sr.*, r.id as resident_id, concat(r.first_name," ",r.last_name) as resident_name,fm.flat_number as flat_number ,sm.service_name as service_name, sr.date as reqired_date, (case sr.status when 0 then "Requested" when 1 then "Under Servigillance" when 2 then "Done" end) as status, sm.description from service_request sr INNER JOIN service_master sm ON sm.id = sr.service_type INNER JOIN residents r ON r.id = sr.resident_id INNER JOIN flat_master fm ON fm.id = r.flat_id';
        var result = {};
        pool.query(queryString, function(err, rows, fields)  {
            if (err)
            {
                result.error= err;
                console.log(err);
            }
            else{
                result.data = rows;
                result.success = "List request displayed successfully";
                res.send(JSON.stringify(result)); 
            }

        });  
    };
};

exports.addService = function(pool){
    return function(req,res){
        res.setHeader('Content-Type', 'application/json');
        var service_name = req.body.service_name;
        var description = req.body.description;
        var queryString='INSERT INTO service_master(service_name,description,status) VALUES("'+service_name+'","'+description +'","0")';
        var result = {};
        pool.query(queryString, function(err, rows, fields)  {
            if (err)
            {
                result.error= err;
                console.log(err);
            }
            else{
                result.success = "service inserted successfully";
                res.send(JSON.stringify(result)); 
            }
        });  
    };
};

exports.deleteService = function(pool){
    return function(req,res){
        res.setHeader('Content-Type', 'application/json');
        var service_id = req.body.service_id;
        var queryString='delete from service_master where id = "'+service_id+'"';
        var result = {};
        pool.query(queryString, function(err, rows, fields)  {
            if (err)
            {
                result.error= err;
                console.log(err);
            }
            else
            {
                result.success = "service Deleted successfully";
                res.send(JSON.stringify(result)); 
            }
        });  
    };
};

exports.ListServices = function(pool){
    return function(req,res){
        res.setHeader('Content-Type', 'application/json');
        var queryString='select * from service_master';
        var result = {};
        pool.query(queryString, function(err, rows, fields)  {
            if (err)
            {
                result.error = err;
                console.log(err);
            }
            else{
                result.success = "Run Successfully !";
                result.data = rows;
                res.send(JSON.stringify(result)); 
            }
        });                                   
    };
};

exports.updateServiceRequestStatus= function(pool){
    return function(req,res){
        res.setHeader('Content-Type', 'application/json');
        $data = req.body;
        var request_id = $data.id; 
        var status= $data.status;
        var comment= $data.comment;
        var result = {};
        var setData = ' status="'+status+'"';
        if (status==2) {
            setData += ', admin_comment="'+comment+'"';
        }

        var query='UPDATE service_request SET '+setData+' WHERE id="'+request_id+'"';
        console.log(query);
        pool.query(query, function(err, rows, fields){
            if(err){
                console.log(err);
                result.error = err;
            }
            else{
                result.success = "Service Status Updated Successfully";
                res.send(JSON.stringify(result)); 
            }
        });
    }
}

exports.listOfRequestedServicesToResident = function(pool){
    return function(req,res){
        res.setHeader('Content-Type', 'application/json');

        var  resident_id = req.body.id; 
        var result = {};
        var Q='select sm.id, sm.service_name, sr.* from service_master sm INNER JOIN service_request sr ON sm.id = sr.service_type where sr.resident_id = "'+resident_id+'" ';

        pool.query(Q, function(err, rows, fields){

            if(err){
                console.log(err);
                result.error = err;
            }
            else{
                result.data = rows ;  
                result.success = "Service Displayed Successfully" ;
                res.send(JSON.stringify(result)); 
            }
        });
    } 
}