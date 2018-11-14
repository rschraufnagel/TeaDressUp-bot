const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

module.exports = {
  getUserItem : getUserItem,
  selectUserCharacterItems : selectUserCharacterItems
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


//Retrieve All Items the User Has
function selectUsersItems(userid) {
  return new Promise(function(resolve, reject) {
    let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
    let sqlRetrieveItems = "Select ItemName from DressUpItems INNER JOIN DiscordUserDressUpItemsOwned ON DiscordUserDressUpItemsOwned.UserId=DressUpItems.user_id WHERE user_id = ?"

    db.run(sqlRetrieveItems, [userid], (err) => {
      if (err) {reject (err);}
      resolve(user);
    });
    db.close();
  });
}

//Retrieve All Dressup Items to display
function selectAllDressUpItems() {
    return new Promise(function(resolve, reject) {
        let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
        let sqlRetrieveItems = "Select * from DressUpItems"
    
        db.run(sqlRetrieveItems, [userid], (err) => {
          if (err) {reject (err);}
          resolve(user);
        });
        db.close();
      });
}



