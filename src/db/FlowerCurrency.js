const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

module.exports = {
    getFlowers:getFlowers,
    spendFlowers:spendFlowers
  }

function getFlowers (dUser) {
    let db = new sqlite3.Database("./database/NadekoBot.db", (err) => {if (err) {reject(err);}});
    let sqlquery = "select Amount from currency where userid = ?";
    return new Promise(function(resolve, reject) {
      db.all(sqlquery, [dUser], (err, rows) => {
        if (err) {reject (err);}
        if(rows==null){
          resolve([]);
        }else{
          resolve(rows);
        }
      });
      db.close();
    });
}


function spendFlowers(dUser, amount){
  let db = new sqlite3.Database("./database/NadekoBot.db", (err) => {if (err) {reject(err);}});
  let sql = "UPDATE currency SET Amount = Amount-? where UserId = ?";
  return new Promise(function(resolve, reject){
    let stmt = db.prepare(sql)
    stmt.run([Math.abs(amount), dUser], (err) => {
      if (err) {
        reject(err);
      }else{
        resolve(stmt.changes);
      }
    });
    stmt.finalize();
    db.close();
  });
}
