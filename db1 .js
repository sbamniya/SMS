var mySQL = require('mysql');
    var pool  = mySQL.createPool({
        host:  'localhost',
        user:'root',
        password:'',
        database:'society_management'
    });
    
    module.exports = pool;