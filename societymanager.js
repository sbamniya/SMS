exports.getmanagerList= function(pool){
  return function(req,res){  

    var draw = req.query.draw;
    var start = req.query.start;
    var length = req.query.length;
    var search_key = req.query.search.value;
    var end = parseInt(start) + parseInt(length);

    var pageSize = length != null ? parseInt(length) : 0;
    var skip = start != null ? parseInt(start) : 0;
    var recordsTotal = 0;

    res.setHeader('Content-Type', 'application/json');
    var result = {};
    var query = "select * from  `society_manager`";
    if(search_key!=''){
      query +=' WHERE manager_name like "%'+search_key+'%" or email like "%'+search_key+'%"';
    }

    query += " order by id desc";
    pool.query(query, function(err, rows, fields){
      if(err){
        console.log(err);
      }else{
        result.draw = draw;
        recordsTotal = rows.length;
        result.recordsTotal = recordsTotal;

        var resultData = []
        resultData.push(rows.slice(skip, parseInt(skip)+parseInt(pageSize)));

        result.recordsFiltered = recordsTotal;
        result.success = JSON.stringify(resultData[0]);
        res.send(JSON.stringify(result));
        return;
      }
    });
  }
};

exports.ActiveManagersList= function(pool){
  return function(req,res){  
    res.setHeader('Content-Type', 'application/json');
    var result = {};
    var query = "select * from  `society_manager` where status=1 order by id desc";

    pool.query(query, function(err, rows, fields){
      if(err){
        console.log(err);
      }else{
        result.success = JSON.stringify(rows);
        res.send(JSON.stringify(result));
        return;
      }
    });
  }
};


exports.addManager=function(pool,randomstring,crypto, transporter){
  return function(req,res){
    res.setHeader('Content-Type', 'application/json');
    var email = req.body.email;
    var result = {};  
    var queryString = 'select * from society_manager where email ="'+email+'"';
    pool.query(queryString, function(err, rows, fields){
      if (err)
      {
        console.log(err);
        result.error= err;
        res.send(JSON.stringify(result));   
        return;
      } 
      else
      {
        if(rows.length>0)
        {
          result.error="Email Already Exist";
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(result));  
          return;
        }
        else
        { 
          $data = req.body;
          var idType =  $data.idType;
          var idNumber = $data.idNumber;
          var manager_name= $data.manager_name;
          var email =$data.email;
          var description = $data.description;
          var text = "";
          var randS = randomstring.generate();    
          for( var i=0; i < 5; i++ ){
            text += randS.charAt(Math.floor(Math.random() * randS.length));
          }
          var password = crypto.createHash('md5').update(text).digest("hex");
          var query = "INSERT INTO society_manager (`idType`,`idNumber`, `manager_name`,  `email`,`password`,`description` ,`status`) VALUES ('"+idType+"','"+idNumber+"','"+manager_name+"','"+email+"','"+password+"','"+description+"','1')";
          pool.query(query, function(err, rows, fields){
            if (err){
              console.log(err);
              result.error= err;
              res.send(JSON.stringify(result));   
              return;
            } 
            else
            { 
              transporter.sendMail(
              {
                from: 'kalika.deltabee@gmail.com',
                to: email,
                subject: 'Check  Id & Password',
                html: 'Hey '+manager_name+'<br/>Your id is: '+email+'<br/>Your password is: '+text+' '

              }, function(error, response) {
                if (error) 
                {
                  console.log(error);
                } 
                else 
                {
                  console.log('Message sent');
                }

              });
              if(rows.insertId>0){
                var manager_id = rows.insertId;
                var merchant_id = req.body.merchant_id;
                var marchant_key = req.body.marchant_key;
                var marchant_salt = req.body.marchant_salt;
                var Q = 'INSERT INTO society_manager_meta(`merchant_id`, `marchant_key`, `marchant_salt`, `manager_id`, `status`) VALUES ("'+merchant_id+'","'+marchant_key+'","'+marchant_salt+'","'+manager_id+'","1")';
                pool.query(Q, function(err, rows, fields){
                  if (err){
                    console.log(err);
                    result.error= err;
                  }else{
                    result.success="Manager Registered Successfully";
                    res.send(JSON.stringify(result));   
                    return;
                  }
                });
              };
            }
          });
        };
      };
    });
  };
};
exports.societyBlockList= function(pool){
  return function(req,res){  
    sess=req.session;
    var id =  sess.userID;
    res.setHeader('Content-Type', 'application/json');
    var result = {};
    var query = "SELECT sm.name as society_name, bm.name as block_name, bm.id FROM block_master as bm INNER JOIN society_master as sm on sm.id=bm.parent_id where bm.block_manager='"+id+"' and bm.status= 1 "; 
    pool.query(query, function(err, rows, fields){
      if(err)
      {
        console.log(err);
      }
      else
      {
        result.success = rows;
        res.send(JSON.stringify(result));
        return;
      }
    });
  };
};

exports.checkForSocietyManager= function(pool){
  return function(req,res){  
    var managerId =req.body.managerId;
    var blockId =req.body.block_id;
    res.setHeader('Content-Type', 'application/json');
    var result = {};
    var query = "select sm.*, bm.id as block_id from  society_master sm INNER JOIN block_master bm on bm.parent_id=sm.id where sm.society_manager = '"+managerId+"' and bm.id = '"+blockId+"' and sm.status =1 "; 

    pool.query(query, function(err, rows, fields){
      if(err)
      {
        console.log('error');
      }
      else
      {
        if(rows.length>0)
        {
          result.is_societymanager = 1;
        }else{
          result.is_societymanager = 0;
        }
        res.send(JSON.stringify(result));
        return;
      }
    });
  };
};

exports.deleteManager = function(pool){
  return function(req,res){
    var id =  req.body.id;
    var result = {}
    pool.query("DELETE FROM society_manager WHERE id=?",[id],function(err, rows, fields){
      if(err)
      {
        result.error = err;
      }
      else
      {
        result.success = "Manager deleted successfully";
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result)); 
      };  
    });
  };
};

exports.updatePassword=  function(crypto,pool){
  return function(req,res){
    sess=req.session;
    var id =sess.userID;
    var newpass = req.body.pass;
    var passwordn = crypto.createHash('md5').update(newpass).digest("hex");
    var result = {};
    var queryString = 'UPDATE society_manager SET  password ="'+passwordn+'",forget_token=""  where id = "'+id+'"';

    pool.query(queryString, function(err, rows, fields)  {
      if (err){
        result.error= err;
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result));   
      }
      else
      {  
        result.succes = "Your Password has been changed successfully.";
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result));       
      }
    });
  };
};