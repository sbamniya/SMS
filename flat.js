exports.addFlat = function(pool){
  return function(req,res){
    var block_id =  req.body.block_id;
    var storey_no = req.body.storey_number;
    var flat_no= req.body.flat_no;
    var type= req.body.type_of_flat;    

    var queryString="INSERT INTO flat_master(block_id, storey_number,flat_number,type_of_flat,status) VALUES("+block_id+" ,"+storey_no+", '"+flat_no+"',"+type+", 1)";
    var result = {};

    pool.query(queryString, function(err, rows, fields)  {
      if (err)
      {
        result.error= err;
      }
      else{
        result.success = "Flat inserted successfully";
      }
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result)); 
    });  
  };
};


exports.getFlatList = function(pool){
  return function(req,res){  
    var id = req.body.id;
    var storey_number = req.body.storey_number;

    res.setHeader('Content-Type', 'application/json');
    var result = {};
    var query = "select * from `flat_master` where block_id='"+id+"' and storey_number ='"+storey_number+"'";
    pool.query(query, function(err, rows, fields){
      if(err){
        console.log('error');
      }else{
        var query ="update block_master set is_updated = 1 where id = "+id;
          pool.query(query, function(err, rows, fields){

          result.success="Flat added successfully";
        });
        result.success = rows;
        res.send(JSON.stringify(result));
        return;
      }
    });
  }
};

exports.updateFlatDetails = function(pool){
  return function(req,res){  
    var id = req.body.flat_id;
    var area = req.body.area;
    var location = req.body.location;
    var parking_slots = req.body.parking_slots;
    var parking_avail = req.body.parking_avail;
    res.setHeader('Content-Type', 'application/json');
    var result = {};
    console.log();
    if (parking_avail==1) {
      var parking_slot = parking_slots.join();
      var Q = 'INSERT INTO flat_parking_association(flat_id, parking_id) VALUES("'+id+'", "'+parking_slot+'") ON DUPLICATE KEY UPDATE parking_id="'+parking_slot+'"';

      pool.query(Q, function(err, rows, fields){
        if (err) {
          console.log(err);
          return;
        }
      });
    }
    var query = 'update flat_master set area="'+area+'", location="'+location+'" where id="'+id+'"';
    pool.query(query, function(err, rows, fields){
      if(err){
        console.log('error');
      }else{
        var parking_ids = parking_slots;
        for (var i = parking_ids.length - 1; i >= 0; i--) {
          var Query = 'update parking_master set status=1 where id="'+parking_ids[i]+'"';
          pool.query(Query, function(err, rows, fields){
            if (err) {
              console.log(err);
              return;
            }
          });
        }
        result.success = "Updated Successfully !";
        res.send(JSON.stringify(result));
        return;
      }
    });
  }
};

exports.getFlatDetails = function(pool){
  return function(req,res){  
    var id = req.body.flat_id;

    res.setHeader('Content-Type', 'application/json');
    var result = {};

    var query = 'select fm.*, concat(r.first_name, " ", r.last_name) as residen_name, r.email as residen_email, r.contact_no as residen_contact_number, r.ownership as resdent_type, bm.parking_avail, pm.parking_id from flat_master fm inner join block_master bm on bm.id=fm.block_id left join residents r on fm.id=r.flat_id left join flat_parking_association pm on fm.id = pm.flat_id where fm.id="'+id+'"';
    pool.query(query, function(err, rows, fields){
      if(err){
        console.log(err);
      }else{
        result.success = rows[0];
        res.send(JSON.stringify(result));
        return;
      }
    });
  }
};

exports.AllFlatsOfBlock = function(pool){
  return function(req,res){  
    var id = req.body.id;

    res.setHeader('Content-Type', 'application/json');
    var result = {};
    var query = "select * from `flat_master` where block_id='"+id+"'";
    pool.query(query, function(err, rows, fields){
      if(err){
        console.log('error');
      }else{
        result.status = 200;
        result.data = rows;
        res.send(JSON.stringify(result));
        return;
      }
    });
  }
};s