const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

module.exports = {
  getUserItem : getUserItem,
  selectUserCharacterItems : selectUserCharacterItems,
}

function getUserItem(userid, unitid) {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select Sequence,ItemName,Url from DressUpItems INNER JOIN DiscordUserDressUpItemsOwned ON DiscordUserDressUpItemsOwned.ItemId = DressUpItems.ItemId WHERE UserId = ? AND DressUpItems.ItemId = ?";
  return new Promise(function(resolve, reject) {
    db.get(sqlquery, [userid, unitid], (err, row) => {
      if (err) {reject (err);}
      resolve(row);
    });
    db.close();
  });
}
function selectUserCharacterItems(userid) {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select Sequence,ItemName,Url from DressUpItems INNER JOIN DiscordUserDressUpItemsOwned ON DiscordUserDressUpItemsOwned.ItemId = DressUpItems.ItemId WHERE UserId = ? and Sequence is not null ORDER BY Sequence ASC";
  return new Promise(function(resolve, reject) {
    db.all(sqlquery, [userid], (err, rows) => {
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



