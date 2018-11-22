const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

module.exports = {
  selectItemById : selectItemById,
  selectItemByFileName : selectItemByFileName,
  selectItemsByTag : selectItemsByTag,
  selectUserItem : selectUserItem,
  selectUserItems : selectUserItems,
  selectUserCharacterValue : selectUserCharacterValue,
  selectUserCharacterItems : selectUserCharacterItems,
  FilteredItemsByLootBoxIdAndRarity: FilteredItemsByLootBoxIdAndRarity,
  RandomItemBasedOnRarity: RandomItemBasedOnRarity
}
function selectItemsByTag(orderby="ItemName", tags) {
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

  sqlquery +=" ORDER BY "+orderby+" ASC";

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
function selectItemByFileName(fileName) {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select ItemId,ItemName,Url,Value from DressUpItems WHERE Url = ?";
  return new Promise(function(resolve, reject) {
    db.get(sqlquery, [fileName], (err, row) => {
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
function selectUserItems(userid) {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select DressUpItems.ItemId,Sequence,ItemName,Url,Value,Quantity from DressUpItems INNER JOIN DiscordUserDressUpItemsOwned ON DiscordUserDressUpItemsOwned.ItemId = DressUpItems.ItemId WHERE UserId = ?";
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
function selectUserCharacterValue(userid) {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select sum(Value) AS Value from DressUpItems INNER JOIN DiscordUserDressUpItemsOwned ON DiscordUserDressUpItemsOwned.ItemId = DressUpItems.ItemId WHERE UserId = ? AND Sequence>0";
  return new Promise(function(resolve, reject) {
    db.get(sqlquery, [userid], (err, row) => {
      if (err) {reject (err);}
      if(row.Value==null){
        resolve({Value:0});
      }else{
        resolve(row);
      }
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

/**
 * Getting Filtered Items from the database)
 * @param {number} LootBoxId 
 * @param {string} Rarity
 */
function FilteredItemsByLootBoxIdAndRarity(LootBoxId, Rarity) {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select DressUpItems.ItemId, ItemName, Value, Url, DropChance from DressUpItems inner join LootBoxItems on DressUpItems.ItemId = LootBoxItems.ItemId where LootBoxItems.LootBoxId = ? and DressUpItems.Rarity = ? Order by DropChance ASC";
  return new Promise(function(resolve, reject) {
    db.all(sqlquery, [LootBoxId, Rarity], (err, rows) => {
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

/**
 * Getting Random Rarity Item from the database)
 * @param {string} Rarity
 */
function RandomItemBasedOnRarity(Rarity) {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select DressUpItems.ItemId, ItemName, Value, Url, DropChance from DressUpItems inner join LootBoxItems on DressUpItems.ItemId = LootBoxItems.ItemId where LootBoxItems.LootBoxId = ? and DressUpItems.Rarity = ? Order by DropChance ASC";
  return new Promise(function(resolve, reject) {
    db.all(sqlquery, [LootBoxId, Rarity], (err, rows) => {
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


