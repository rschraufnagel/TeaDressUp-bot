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
function getAsync(db, sql, parms){
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
function allAsync(db, sql, parms){
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


async function selectItemsByTag(orderby="ItemName", tags) {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});

  let sqlquery = "Select ItemId,ItemName,FileName,Value from DressUpItems";
  let parms = [];
  for(index=0; index<tags.length; index++){
    parms.push("%"+tags[index]+"%");
    parms.push("%"+tags[index]+"%");
    if(index==0){
      sqlquery += " WHERE"
    }else{
      sqlquery += " AND"
    }
    sqlquery += " (ItemName LIKE ? OR FileName LIKE ?)";
  }
  if(tags.length>0){
    sqlquery +=" COLLATE NOCASE";
  }
  sqlquery +=" ORDER BY "+orderby+" ASC";

  let rows = await allAsync(db, sqlquery, parms);
  db.close();

  return rows;
}

async function  selectItemById(itemid) {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select ItemId,ItemName,FileName,Value from DressUpItems WHERE ItemId = ?";
  let row = await getAsync(db, sqlquery, [itemid]);
  db.close();

  return row;
}

async function  selectItemByFileName(fileName) {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select ItemId,ItemName,FileName,Value from DressUpItems WHERE FileName = ?";
  let row = await getAsync(db, sqlquery, [fileName]);
  db.close();

  return row;
}

async function  selectUserItem(userid, unitid) {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select DressUpItems.ItemId,Sequence,ItemName,FileName,Value from DressUpItems INNER JOIN DiscordUserDressUpItemsOwned ON DiscordUserDressUpItemsOwned.ItemId = DressUpItems.ItemId WHERE UserId = ? AND DressUpItems.ItemId = ?";
  let row = await getAsync(db, sqlquery, [userid, unitid]);
  db.close();

  return row;
}

async function  selectUserItems(userid) {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select DressUpItems.ItemId,Sequence,ItemName,FileName,Value,Quantity from DressUpItems INNER JOIN DiscordUserDressUpItemsOwned ON DiscordUserDressUpItemsOwned.ItemId = DressUpItems.ItemId WHERE UserId = ?";
  let rows = await allAsync(db, sqlquery, [userid]);
  db.close();

  return rows;
}

async function  selectUserCharacterValue(userid) {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select sum(Value) AS Value from DressUpItems INNER JOIN DiscordUserDressUpItemsOwned ON DiscordUserDressUpItemsOwned.ItemId = DressUpItems.ItemId WHERE UserId = ? AND Sequence>0";
  let row = await getAsync(db, sqlquery, [userid]);
  db.close();

  return row;
}

async function  selectUserCharacterItems(userid) {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select DressUpItems.ItemId,Sequence,ItemName,FileName,Value from DressUpItems INNER JOIN DiscordUserDressUpItemsOwned ON DiscordUserDressUpItemsOwned.ItemId = DressUpItems.ItemId WHERE UserId = ? and Sequence is not null ORDER BY Sequence ASC";
  let rows = await allAsync(db, sqlquery, [userid]);
  db.close();

  return rows;
}

/**
 * Getting Filtered Items from the database)
 * @param {number} LootBoxId 
 * @param {string} Rarity
 */
async function  FilteredItemsByLootBoxIdAndRarity(LootBoxId, Rarity) {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select DressUpItems.ItemId, ItemName, Value, FileName, DropChance from DressUpItems inner join LootBoxItems on DressUpItems.ItemId = LootBoxItems.ItemId where LootBoxItems.LootBoxId = ? and DressUpItems.Rarity = ? Order by DropChance ASC";
  let rows = await allAsync(db, sqlquery, [LootBoxId, Rarity]);
  db.close();

  return rows;
}

/**
 * Getting Random Rarity Item from the database)
 * @param {string} Rarity
 */
async function  RandomItemBasedOnRarity(Rarity) {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select DressUpItems.ItemId, ItemName, Value, FileName, DropChance from DressUpItems inner join LootBoxItems on DressUpItems.ItemId = LootBoxItems.ItemId where LootBoxItems.LootBoxId = ? and DressUpItems.Rarity = ? Order by DropChance ASC";
  let rows = await allAsync(db, sqlquery, [LootBoxId, Rarity]);
  db.close();

  return rows;
}

