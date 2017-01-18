exports.login = function(crypto,pool){
    return function(req,res){  
        sess=req.session;

        /*console.log("DB connection established");*/
        var userName = req.body.userName;
        var password = req.body.password;
        var queryString = 'SELECT * FROM admin_master where username = "'+userName+'"';
        var result = {};
        pool.query(queryString, function(err, rows, fields) {

            if (err)
            {
                result.error= err;
            }
            else
            {
                if(rows.length==0)
                {
                    result.error= "User not Exist.";
                }
                else
                {
                    if (rows[0].status==1) 
                    {   //Creating hash with received password value for comparison : DR
                        var passwordn = crypto.createHash('md5').update(password).digest("hex");
                        if (passwordn == rows[0].password) 
                        {
                            sess.userID = rows[0].id;
                            sess.userPrivilege = 1;
                            sess.userLevel = "admin";
                            result.success = rows[0];
                        }
                        else
                        {
                            result.error = "Password didn't match.";
                        }
                    }
                    else
                    {
                        result.error = "User Not Varified.";
                    }
                }
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result)); 
        });
    };
};

exports.authenticated = function(req,res){
    var userLevel = req.params.access;
    sess=req.session;
    var result = {};
    if(typeof sess.userID !=='undefined' && sess.userID!='' && sess.userLevel==userLevel){
        result.status = 'success';
    }else{
        result.status = 'fail';
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result)); 
};
//Logout Route Handling
exports.logout = function(req,res){
    var result = {};
    sess = req.session;
    sess.userID ='' ;
    sess.userPrivilege = 0;
    sess.userLevel = '';
    result.success = 'Logged out successfully';
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result)); 
}
//Reset Password Process
exports.resetPasswordProcess = function(transporter,randomstring,pool){
    return function(req,res){
        var host = req.protocol+'://'+req.headers.host+'/'; 
        var email = req.body.email;
        var result = {};  
        var queryString = 'select * from admin_master where email ="'+email+'"';
        pool.query(queryString, function(err, rows, fields)  {
            if (err){
                result.error= err;
                console.log(err);
            } 
            else
            { 
                if(rows.length==0){
                    result.error="Email Not Exist";
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(result));   
                }else{
                    var adminid = rows[0].id;
                    var userObj = rows[0];
                    var randS = randomstring.generate();    
                    queryString1 = 'UPDATE admin_master SET forget_token= "'+randS+'" where id = '+adminid;

                    pool.query(queryString1, function(err, rows, fields)  {
                        if (err)
                        {
                            result.error= err;
                            result.success="Please contact Administrator";
                            res.setHeader('Content-Type', 'application/json');
                            res.send(JSON.stringify(result));   
                        }
                        else
                        {  
                            transporter.sendMail({
                                from: 'kalika.deltabee@gmail.com',
                                to: userObj.email,
                                subject: 'Reset Password',
                                html: 'Hey '+userObj.username+'!<br/> Please click <a href="'+host+'#/newPassword/'+randS+'/'+userObj.id+'">here</a> to Reset Password!'
                            }, function(error, response) {
                                if (error) {
                                console.log(error);
                                } else {
                                console.log('Message sent');
                                }
                            });
                            result.success="Please check mail to reset password";
                            res.setHeader('Content-Type', 'application/json');
                            res.send(JSON.stringify(result));   
                        }
                    });
                }
            }
        });
    };
};

exports.confirmToken= function (pool){
    return function(req,res){
        var token = req.body.token;
        var id = req.body.userid;
        var result = {};


        var queryString = 'select * from admin_master where  forget_token ="'+token+'" and id = "'+id+'"';
        pool.query(queryString, function(err, rows, fields)  {
            if (err){
                result.error= err;
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result));   
            }
            else
            {
                if(rows.length==0)
                {
                    result.error= "You are not authorize to change password for the user";
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(result));   
                }
                else
                {
                    result.succes = "go";
                    result.id = id;
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(result));       
                }
            }
        });
    };
};

exports.updatePassword=  function(crypto,pool){
    return function(req,res){

        var id = req.body.id;
        var newpass = req.body.pass;
        var passwordn = crypto.createHash('md5').update(newpass).digest("hex");
        var result = {};

        var queryString = 'UPDATE admin_master SET  password ="'+passwordn+'",forget_token=""  where id = "'+id+'"';

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
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result));       
    };
};