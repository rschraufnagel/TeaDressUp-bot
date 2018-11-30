const sqlite3 = require('sqlite3').verbose();
const config = require('../../config');
const getAsync = require('./AsyncCRUD').getAsync;
const allAsync = require('./AsyncCRUD').allAsync;

module.exports = {
  selectItemsMissingPreview : selectItemsMissingPreview,
  selectItemsById : selectItemsById,
  selectItemById : selectItemById,
  selectItemByFileName : selectItemByFileName,
  selectItemsByTag : selectItemsByTag,
  selectUserItem : selectUserItem,
  selectUserItems : selectUserItems,
  selectUserCharacterValue : selectUserCharacterValue,
  selectUserCharacterTopValue : selectUserCharacterTopValue,
  selectUserCharacterItems : selectUserCharacterItems,
  getRandomRarityItem: getRandomRarityItem,
  getRandomSpecialItem : getRandomSpecialItem,
  selctUserCharacterItemsNotEquipped:selctUserCharacterItemsNotEquipped
}



async function selectItemsByTag(orderby="ItemName", tags) {
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});

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

async function  selectItemsMissingPreview() {
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select ItemId,ItemName,FileName,Value from DressUpItems WHERE PreviewURL is null";
  let rows = await allAsync(db, sqlquery, []);
  db.close();

  return rows;
}

async function  selectItemsById(itemids) {
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select ItemId,ItemName,FileName,Value from DressUpItems WHERE ItemId in (" + "?,".repeat(itemids.length).substring(0, end-1) + ")";
  let rows = await allAsync(db, sqlquery, itemids);
  db.close();

  return rows;
}
async function  selectItemById(itemid) {
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select ItemId,ItemName,FileName,Value from DressUpItems WHERE ItemId = ?";
  let row = await getAsync(db, sqlquery, [itemid]);
  db.close();

  return row;
}

async function  selectItemByFileName(fileName) {
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select ItemId,ItemName,FileName,Value from DressUpItems WHERE FileName = ?";
  let row = await getAsync(db, sqlquery, [fileName]);
  db.close();

  return row;
}

async function  selectUserItem(userid, unitid) {
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select DressUpItems.ItemId,Sequence,ItemName,FileName,Value from DressUpItems INNER JOIN DiscordUserDressUpItemsOwned ON DiscordUserDressUpItemsOwned.ItemId = DressUpItems.ItemId WHERE UserId = ? AND DressUpItems.ItemId = ?";
  let row = await getAsync(db, sqlquery, [userid, unitid]);
  db.close();

  return row;
}

async function  selectUserItems(userid) {
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select DressUpItems.ItemId,Sequence,ItemName,FileName,Value,Quantity from DressUpItems INNER JOIN DiscordUserDressUpItemsOwned ON DiscordUserDressUpItemsOwned.ItemId = DressUpItems.ItemId WHERE UserId = ?";
  let rows = await allAsync(db, sqlquery, [userid]);
  db.close();

  return rows;
}

async function  selectUserCharacterValue(userid) {
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select sum(Value) AS Value from DressUpItems INNER JOIN DiscordUserDressUpItemsOwned ON DiscordUserDressUpItemsOwned.ItemId = DressUpItems.ItemId WHERE UserId = ? AND Sequence>0";
  let row = await getAsync(db, sqlquery, [userid]);
  db.close();

  return row;
}
async function  selectUserCharacterTopValue(userid, limit) {
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select sum(Value) AS Value FROM (SELECT Value FROM DressUpItems INNER JOIN DiscordUserDressUpItemsOwned ON DiscordUserDressUpItemsOwned.ItemId = DressUpItems.ItemId WHERE UserId = ? AND Sequence>0 ORDER BY Sequence DESC Limit ?)";
  let row = await getAsync(db, sqlquery, [userid, limit]);
  db.close();

  return row;
}

async function  selectUserCharacterItems(userid) {
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select DressUpItems.ItemId,Sequence,ItemName,FileName,Value from DressUpItems INNER JOIN DiscordUserDressUpItemsOwned ON DiscordUserDressUpItemsOwned.ItemId = DressUpItems.ItemId WHERE UserId = ? and Sequence is not null ORDER BY Sequence ASC";
  let rows = await allAsync(db, sqlquery, [userid]);
  db.close();

  return rows;
}

async function  selctUserCharacterItemsNotEquipped(userid) {
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select DressUpItems.ItemId,Sequence,ItemName,FileName,Value from DressUpItems INNER JOIN DiscordUserDressUpItemsOwned ON DiscordUserDressUpItemsOwned.ItemId = DressUpItems.ItemId WHERE UserId = ?";
  let rows = await allAsync(db, sqlquery, [userid]);
  db.close();

  return rows;
}

/**
 * Getting Random Rarity Item from the database)
 * @param {int} LootBoxId
 * @param {string} Rarity
 */
async function  getRandomRarityItem(rarity) {
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select DressUpItems.ItemId, ItemName, Value, FileName from DressUpItems where DressUpItems.Rarity = ? Order by random() limit 1";
  let row = await getAsync(db, sqlquery, [rarity]);
  db.close();
  return row;
}
async function getRandomSpecialItem(lootBoxId){
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select DressUpItems.ItemId, ItemName, Value, FileName from DressUpItems inner join LootBoxSpecialItem on DressUpItems.ItemId = LootBoxSpecialItem.ItemId where LootBoxSpecialItem.LootBoxId = ? Order by random() limit 1";
  let row = await getAsync(db, sqlquery, [lootBoxId]);
  db.close();
  return row;
}

