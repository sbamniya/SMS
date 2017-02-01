exports.getSlug = function(pool, slug) {
    return function(req, res) {
        var slug = req.body.slug;
        res.setHeader('Content-Type', 'application/json');
        var queryString = "select * from slug_master where slug='" + slug + "'";
        var result = {};
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
            } else {
                if (rows.length == 0) {
                    result.error = 'Slug not Found';
                    res.send(JSON.stringify(result));
                    return;
                }
                var from_table = rows[0].from_table;
                var id = rows[0].primary_id;
                var query = "select * from `" + from_table + "` where id=" + id;
                pool.query(query, function(err, rows, fields) {
                    if (err) {
                        console.log('error');
                    } else {
                        result.success = rows[0];
                        res.send(JSON.stringify(result));
                        return;
                    }
                });
            }
        });
    };
};

exports.getActiveSocieties = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select sm.id,name,sm.slug,sm.address,sm.lattitute,sm.longtitute,sm.owner,DATE_FORMAT(sm.established_date,'%d, %b %Y') as established_date,sm.contact_number,sm.chair_person, sm.chair_person_contact,sm.secretary,sm.secretary_contact,sm.treasurer,sm.treasurer_contact,sm.society_manager,sm.cover_img,sm.general_img,sm.has_blocks,sm.last_update_time,sm.updated_by_ip,sm.status, sMan.manager_name from society_master as sm inner join society_manager as sMan on sm.society_manager = sMan.id where sm.status='1'";
        query += " order by id desc";
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                result.success = rows;
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};

exports.getSocietyDetail = function(pool, slug) {
    return function(req, res) {
        var id = req.body.id;
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select sm.id,name,sm.slug,sm.address,sm.lattitute,sm.longtitute,sm.owner,DATE_FORMAT(sm.established_date,'%d, %b %Y') as established_date,sm.contact_number,sm.chair_person, sm.chair_person_contact,sm.secretary,sm.secretary_contact,sm.treasurer,sm.treasurer_contact,sm.society_manager,sm.cover_img,sm.general_img,sm.has_blocks,sm.last_update_time,sm.updated_by_ip,sm.status, sMan.manager_name from society_master as sm inner join society_manager as sMan on sm.society_manager = sMan.id where sm.id='" + id + "'";
        query += " order by id desc";
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                result.success = JSON.stringify(rows[0]);
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};

exports.addSociety = function(formidable, fs, pool, step) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        $data = req.body;
        var name = $data.name;
        var slug = $data.slug;
        var address = $data.address;
        var lat = $data.latitude;
        var long = $data.longitude;
        var owner = $data.owner;
        var contact_number = $data.contact_number;
        var chair_person = $data.chair_person;
        var chair_person_contact = $data.chair_person_contact;
        var secretary = $data.secretary;
        var secretary_contact = $data.secretary_contact;
        var treasurer = $data.treasurer;
        var treasurer_contact = $data.treasurer_contact;
        var manager = $data.manager;
        var society_id = '';
        if ($data.has_blocks == 'Y') {
            var has_block = 1;
        } else {
            var has_block = 0;
        }
        var established_date = new Date($data.EstDate);
        var newDate = established_date.getFullYear() + '-' + (established_date.getMonth() + 1) + '-' + established_date.getDate();
        var datetimestamp = Date.now();
        var cover_img_id = $data.coverImg;
        var logo_img_id = $data.logoImg;
        var updated_by_ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
        var result = {};
        if (name == '' || slug == '' || address == '' || lat == '' || long == '' || owner == '' || contact_number == '' || chair_person == '' || chair_person_contact == '' || secretary == '' || secretary_contact == '' || treasurer == '' || treasurer_contact == '' || $data.EstDate == '' || cover_img_id == '' || logo_img_id == '') {
            result.error = 'Parameter Msissing';
            res.send(JSON.stringify(result));
            return;
        }
        step(
            function getuploaded() {
                pool.query("select imgName from image_temp where id='" + cover_img_id + "'", this);
            },
            function coverImgName(err, rows, fields) {
                if (err) {
                    console.log('coverIMg');
                } else {
                    cover_img = rows[0].imgName;
                    pool.query("select imgName from image_temp where id='" + logo_img_id + "'", this);
                }
            },
            function logoImgName(err, rows, fields) {
                if (err) {
                    console.log('LogoImg');
                } else {
                    logo_img = rows[0].imgName;
                    var inQuery = "INSERT INTO society_master (`name`,`slug`, `address`, `lattitute`, `longtitute`, `owner`, `established_date`, `contact_number`,`chair_person`, `chair_person_contact`,`secretary`,`secretary_contact`,`treasurer`,`treasurer_contact`,`society_manager`, `cover_img`, `general_img`,`has_blocks`, `last_update_time` , `updated_by_ip` , `status`) VALUES ('" + name + "','" + slug + "','" + address + "','" + lat + "','" + long + "','" + owner + "','" + newDate + "','" + contact_number + "', '" + chair_person + "','" + chair_person_contact + "','" + secretary + "','" + secretary_contact + "','" + treasurer + "','" + treasurer_contact + "'," + manager + ",'" + cover_img + "', '" + logo_img + "' ," + has_block + ", '', '" + updated_by_ip + "' ,'1')";
                    pool.query(inQuery, this);
                }
            },
            function insertResponse(err, rows, fields) {
                if (err) {
                    console.log(err);
                } else {
                    result.success = 'true';
                    result.lastInsertId = rows.insertId;
                    society_id = result.lastInsertId;
                    pool.query("delete from image_temp where id='" + cover_img_id + "'", this);
                }
            },
            function coverTempDeltHandler(err, rows) {
                //
                if (err) {} else {
                    pool.query("delete from image_temp where id='" + logo_img_id + "'", this);
                }
            },
            function logoTempDeltHandler(err, rows) {
                if (err) {} else {
                    if (result.lastInsertId > 0) {
                        pool.query("insert into slug_master values('NULL','" + slug + "','society_master','" + result.lastInsertId + "','1')", this);
                    }
                }
            },
            function successHandler(err, rows) {
                if (err) {} else {
                    if (rows.insertId > 0) {
                        var manager_id = society_id; /*society id*/
                        var merchant_id = req.body.merchant_id;
                        var marchant_key = req.body.marchant_key;
                        var marchant_salt = req.body.marchant_salt;
                        var Q = 'INSERT INTO society_manager_meta(`merchant_id`, `marchant_key`, `marchant_salt`, `manager_id`, `status`) VALUES ("' + merchant_id + '","' + marchant_key + '","' + marchant_salt + '","' + manager_id + '","1")';
                        pool.query(Q, function(err, rows, fields) {
                            if (err) {
                                console.log(err);
                                result.error = err;
                            } else {
                                result.success = "Society Registered Successfully";
                                res.send(JSON.stringify(result));
                                return;
                            }
                        });

                    }
                }
            }
        );
    };
};

exports.getsocietyList = function(pool, slug) {
    return function(req, res) {
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
        var query = "select sm.id,name,sm.slug,sm.address,sm.lattitute,sm.longtitute,sm.owner,DATE_FORMAT(sm.established_date,'%d, %b %Y') as established_date,sm.contact_number,sm.chair_person, sm.chair_person_contact,sm.secretary,sm.secretary_contact,sm.treasurer,sm.treasurer_contact,sm.society_manager,sm.cover_img,sm.general_img,sm.has_blocks,sm.last_update_time,sm.updated_by_ip,sm.status, sMan.manager_name from society_master as sm inner join society_manager as sMan on sm.society_manager = sMan.id";
        if (search_key != '') {
            query += ' WHERE sm.name like "%' + search_key + '%" or sm.owner like "%' + search_key + '%"';
        }
        query += " order by sm.id desc";
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log('error');
            } else {
                result.draw = draw;
                recordsTotal = rows.length;
                result.recordsTotal = recordsTotal;
                var resultData = []
                resultData.push(rows.slice(skip, parseInt(skip) + parseInt(pageSize)));
                result.recordsFiltered = recordsTotal;
                result.success = JSON.stringify(resultData[0]);
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};

exports.deleteSociety = function(pool) {
    return function(req, res) {
        var id = req.body.id;
        var data = {}
        res.setHeader('Content-Type', 'application/json');
        pool.query("SELECT * FROM block_master WHERE parent_id=" + id, function(err, rows, fields) {
            if (err) {
                data.error = err;
            } else {
                if (rows.length > 0) {
                    for (var i = 0; i <= rows.length - 1; i++) {
                        pool.query("DELETE FROM slug_master WHERE primary_id = " + rows[i].id + " AND slug = '" + rows[i].slug + "' ", function(err, rows, fields) {});
                    }
                }
                pool.query("DELETE FROM block_master WHERE  parent_id =?", [id], function(err, rows, fields) {
                    if (err) {
                        data.error = err;
                    } else {
                        pool.query("DELETE FROM society_master WHERE id=?", [id], function(err, rows, fields) {
                            if (err) {
                                data.error = err;
                            } else {
                                pool.query("DELETE FROM slug_master WHERE primary_id = " + id + " AND from_table = 'society_master'", function(err, rows, fields) {});
                            }
                            data.success = "Society deleted Successfully";
                            res.send(data);
                            return;
                        });
                    };
                });
            };
        });
    };
};

exports.getAllSocieties = function(pool) {
    return function(req, res) {
        var query = "select * from society_master where status=1";
        var data = {};
        res.setHeader('Content-Type', 'application/json');
        pool.query(query, function(err, rows, fields) {
            if (err) {
                data.error = err;
            } else {
                data.success = rows;
                res.send(JSON.stringify(data));
            }
        });
    }
}

exports.getBySocietyId = function(pool) {
    return function(req, res) {
        var id = req.body.id;
        var query = "SELECT * FROM block_master WHERE parent_id=" + id;
        var data = {};
        res.setHeader('Content-Type', 'application/json');
        pool.query(query, function(err, rows, fields) {
            if (err) {
                data.error = err;
            } else {
                data.success = rows;
                res.send(JSON.stringify(data));
            }
        });
    }
}

exports.getResidentsForAdminByBlockId = function(pool) {
    return function(req, res) {
        var block_id = req.body.blockId;
        var query = "select r.*, fm.flat_number, bm.name as block_name, sm.name as society_name from `residents` r INNER join flat_master fm on fm.id=r.flat_id INNER join block_master bm on bm.id=fm.block_id INNER join society_master sm on sm.id=bm.parent_id where fm.block_id = '" + block_id + "'";
        var data = {};
        res.setHeader('Content-Type', 'application/json');
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                data.error = err;
            } else {
                data.success = rows;
                res.send(JSON.stringify(data));
            }
        });
    }
}

exports.getTenatsForAdminByBlockId = function(pool) {
    return function(req, res) {
        var block_id = req.body.blockId;
        var type = req.body.Group;
        var where = '';
        if (type != 3) {
            where = ' and t.status="' + type + '"';
        }
        var query = "select t.*, concat(r.first_name, ' ', r.last_name) as resident_name, fm.flat_number, bm.name as block_name, sm.name as society_name from tenant_master t INNER join `residents` r on r.id = t.resident_id INNER join flat_master fm on fm.id=r.flat_id INNER join block_master bm on bm.id=fm.block_id INNER join society_master sm on sm.id=bm.parent_id where fm.block_id = '" + block_id + "' " + where;
        var data = {};
        res.setHeader('Content-Type', 'application/json');
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                data.error = err;
            } else {
                data.success = rows;
                res.send(JSON.stringify(data));
            }
        });
    }
}
