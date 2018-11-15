const config = require('./config');

module.exports = {
    getFlowers:getFlowers
  }

function getFlowers (dUser) {
    const sqlite3 = require('sqlite3');
    let userFlowers = 0;
    let db = new sqlite3.Database(); // dis mine
    let sqlquery = "SELECT CurrencyAmount FROM DiscordUser WHERE UserID = ?;";
    return new Promise(function(resolve, reject) {
        db.get(sqlquery, [dUser], (err, row) => {
            if (err) {
              console.log(err);
              reject(err);
            }
            if (row.CurrencyAmount !== null) {
                console.log("Amount: " + row.CurrencyAmount);
                userFlowers = parseInt(row.CurrencyAmount);
                resolve(row.CurrencyAmount);
            } else {
                console.log("No user found with that ID.");
            }
        })
        db.close();
    });
}