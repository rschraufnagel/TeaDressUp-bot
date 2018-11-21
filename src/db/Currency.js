const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

module.exports = {
    getFlowers:getFlowers
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