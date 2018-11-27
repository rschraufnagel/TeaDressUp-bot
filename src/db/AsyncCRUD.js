module.exports.getAsync = function(db, sql, parms){
  var that = db;
  return new Promise(function(resolve, reject){
    db.get(sql, parms, function(err, row){
      if(err){
        reject(err);
      }else{
        resolve(row);
      }
    });
  });
}

module.exports.allAsync = function(db, sql, parms){
  var that = db;
  return new Promise(function(resolve, reject){
    db.all(sql, parms, function(err, rows){
      if(err){
        reject(err);
      }else if(rows==null){
        resolve([]);
      }else{
        resolve(rows);
      }
    });
  });
}


module.exports.updateAsync = function(db, sql, parms=[]){
  var that = db;
  return new Promise(function(resolve, reject){
    let stmt = db.prepare(sql)
    stmt.run(parms, (err) => {
      if (err) {
        reject (err);
      }else{
        resolve(stmt.changes);
      }
    });
    stmt.finalize();
  });
}

module.exports.insertAsync = function(db, sql, parms=[]){
  var that = db;
  return new Promise(function(resolve, reject){
    let stmt = db.prepare(sql)
    stmt.run(parms, (err) => {
      if (err) {
        reject (err);
      }else{
        resolve(stmt.lastID);
      }
    });
    stmt.finalize();
  });
}