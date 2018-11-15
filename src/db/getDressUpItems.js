const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

module.exports = {
  selectItemById : selectItemById,
  selectItemsByTag : selectItemsByTag,
  selectUserItem : selectUserItem,
  selectUserCharacterItems : selectUserCharacterItems,
  selectAllLootBoxes: selectAllLootBoxes
}
function selectItemsByTag(tags) {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select ItemId,ItemName,Url,Value from DressUpItems";

  let parms = [];
  for(index=0; index<tags.length; index++){
    parms.push("%"+tags[index]+"%");
    parms.push("%"+tags[index]+"%");
    if(index==0){
      sqlquery += " WHERE"
    }else{
      sqlquery += " AND"
    }
    sqlquery += " (ItemName LIKE ? OR Url LIKE ?)";
  }
  if(tags.length>0){
    sqlquery +=" COLLATE NOCASE";
  }

  sqlquery +=" ORDER BY ItemName ASC";

  return new Promise(function(resolve, reject) {
    db.all(sqlquery, parms, (err, rows) => {
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

function selectItemById(itemid) {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select ItemId,ItemName,Url,Value from DressUpItems WHERE ItemId = ?";
  return new Promise(function(resolve, reject) {
    db.get(sqlquery, [itemid], (err, row) => {
      if (err) {reject (err);}
      resolve(row);
    });
    db.close();
  });
}

function selectUserItem(userid, unitid) {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select DressUpItems.ItemId,Sequence,ItemName,Url,Value from DressUpItems INNER JOIN DiscordUserDressUpItemsOwned ON DiscordUserDressUpItemsOwned.ItemId = DressUpItems.ItemId WHERE UserId = ? AND DressUpItems.ItemId = ?";
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
  let sqlquery = "Select DressUpItems.ItemId,Sequence,ItemName,Url,Value from DressUpItems INNER JOIN DiscordUserDressUpItemsOwned ON DiscordUserDressUpItemsOwned.ItemId = DressUpItems.ItemId WHERE UserId = ? and Sequence is not null ORDER BY Sequence ASC";
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

//Retrieve All Dressup Items to display
function selectAllLootBoxes() {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select LootBoxName from Lootboxes";
  return new Promise(function(resolve, reject) {
    db.all(sqlquery, (err, rows) => {
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



