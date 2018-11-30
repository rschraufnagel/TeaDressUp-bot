const sqlite3 = require('sqlite3').verbose();
const config = require('../../config');
const updateAsync = require('./AsyncCRUD').updateAsync;
const insertAsync = require('./AsyncCRUD').insertAsync;

module.exports = {
  addItem : addItem,
  setItemPreviewURL : setItemPreviewURL,
  giveUserItem : giveUserItem,
  takeUserItem : takeUserItem,
  addNextSequences : addNextSequences,
  swapSequences : swapSequences,
  removeSequence : removeSequence,
  removeAllSequence : removeAllSequence
}


/**
 * 
 * @param {*} userId 
 * @param {*} itemId
 */
async function giveUserItem(userId, itemId){
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  //SQLITE by default doesn't load enforcing foreign key constraints (turn it on).
  //TODO: Probably need a better way overall to handle db connections across the app.
  let pragma = await updateAsync(db, 'PRAGMA foreign_keys=on');

  let sqlInsert = 'INSERT OR IGNORE INTO DiscordUserDressUpItemsOwned (UserId, ItemId) VALUES(?, ?)';
  let inserted = await updateAsync(db, sqlInsert, [userId, itemId]);
  if(inserted==0){
    let sqlUpdate = 'UPDATE DiscordUserDressUpItemsOwned SET Quantity = Quantity+1 WHERE UserId = ? AND ItemId = ?';
    let updated = await updateAsync(db, sqlUpdate, [userId, itemId]);
  }
  db.close();

  return true;
}
/**
 * Take an item away from a user.  Only allowed to take an item if it is not currently equipped (ie. if the user only has 1 and it is equipped do not take.)
 */
async function takeUserItem(userId, itemId){
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  //SQLITE by default doesn't load enforcing foreign key constraints (turn it on).
  //TODO: Probably need a better way overall to handle db connections across the app.
  let pragma = await updateAsync(db, 'PRAGMA foreign_keys=on');

  let sqlDelete = 'DELETE FROM DiscordUserDressUpItemsOwned WHERE UserId=? AND ItemId=? AND Quantity = 1 AND Sequence is NULL';
  let sqlUpdated = await updateAsync(db, sqlDelete, [userId, itemId]);
  if(sqlUpdated==0){
    let sqlUpdate = 'UPDATE DiscordUserDressUpItemsOwned SET Quantity = Quantity-1 WHERE UserId = ? AND ItemId = ? AND Quantity != 1';
    sqlUpdated = await updateAsync(db, sqlUpdate, [userId, itemId]);
  }
  db.close();

  if(sqlUpdated==0){
    return false; //Nothing was updated
  }else{
    return true; //Something was updated
  }
}

/**
 * Adds the given item to the given user return the id of the last
 * @param {string} itemName
 * @param {number} value
 * @param {string} fileName
 * @return {*} id of the item created.
 */
async function addItem(itemName, value, fileName, rarity){
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  //SQLITE by default doesn't load enforcing foreign key constraints (turn it on).
  //TODO: Probably need a better way overall to handle db connections across the app.
  let pragma = await updateAsync(db, 'PRAGMA foreign_keys=on');

  let sql = 'INSERT INTO DressUpItems (ItemName, Value, FileName, Rarity) VALUES(?, ?, ?, ?)';
  let id = await insertAsync(db, sql, [itemName, value, fileName, rarity]);
  db.close();

  return id;
}

async function setItemPreviewURL(itemId, previewURL){
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  //SQLITE by default doesn't load enforcing foreign key constraints (turn it on).
  //TODO: Probably need a better way overall to handle db connections across the app.
  let pragma = await updateAsync(db, 'PRAGMA foreign_keys=on');

  let sql = 'UPDATE DressUpItems set PreviewURL = ? WHERE ItemId = ?';
  let updateCount = await updateAsync(db, sql, [previewURL, itemId]);
  if(updateCount<1){
    throw Error("Item " + itemId + " doesn't exist.");
  }
  db.close();
  return true;
}

/**
 * Remove Sequence from all of the given User's items.
 * @param {string} userid
 * @returns {Promise} promise of number of rows updated (change = 1, no change = 0).
 */
async function removeAllSequence(userid){
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  //SQLITE by default doesn't load enforcing foreign key constraints (turn it on).
  //TODO: Probably need a better way overall to handle db connections across the app.
  let pragma = await updateAsync(db, 'PRAGMA foreign_keys=on');

  let sql = 'UPDATE DiscordUserDressUpItemsOwned set Sequence = null WHERE UserId=? AND Sequence is not null';
  let updates = await updateAsync(db, sql, [userid]);
  db.close();

  return updates;
}


/**
 *  Update the Items owned by the given UserId using the following logic:
 *  set sequenceNumber = null where sequenceNumber = the # provided.
 *  set sequenceNumber = sequenceNumber-1 where sequenceNumber> the # provided.
 * @param {string} userid
 * @param {number} sequenceNumber
 * @returns {*} promise of number of rows updated (change = 1, no change = 0).
 */
async function removeSequence(userid, sequenceNumber){
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  //SQLITE by default doesn't load enforcing foreign key constraints (turn it on).
  //TODO: Probably need a better way overall to handle db connections across the app.
  let pragma = await updateAsync(db, 'PRAGMA foreign_keys=on');

  let sql = 'UPDATE DiscordUserDressUpItemsOwned set Sequence = CASE WHEN Sequence=? THEN null ELSE Sequence-1 END WHERE UserId=? AND Sequence>=?';
  let updates = await updateAsync(db, sql, [sequenceNumber, userid, sequenceNumber]);
  db.close();

  return updates;
}


/**
 *  Update the Items owned by the given UserId using the following logic:
 *  set sequenceNumber = null where sequenceNumber = the # provided.
 *  set sequenceNumber = sequenceNumber-1 where sequenceNumber> the # provided.
 * @param {string} userid
 * @param {number} sequenceNumber
 * @returns {*} promise of number of rows updated (change = 1, no change = 0).
 */
async function swapSequences(userid, item1, item2){
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  //SQLITE by default doesn't load enforcing foreign key constraints (turn it on).
  //TODO: Probably need a better way overall to handle db connections across the app.
  let pragma = await updateAsync(db, 'PRAGMA foreign_keys=on');

  let sql = 'UPDATE DiscordUserDressUpItemsOwned set Sequence = CASE WHEN ItemId=? THEN ? ELSE ? END WHERE UserId=? AND ItemId in (?,?)';
  let updates = await updateAsync(db, sql, [item1.ItemId, item2.Sequence, item1.Sequence, userid, item1.ItemId, item2.ItemId]);
  db.close();

  return updates;
}

/**
 * Adds the given items to the user's active item list at the next highest position (items already in the active list remain at their current position)
 * @param {string} userid 
 * @param {array} itemids array of itemIds
 */
async function addNextSequences(userid, itemids){
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  //SQLITE by default doesn't load enforcing foreign key constraints (turn it on).
  //TODO: Probably need a better way overall to handle db connections across the app.
  let pragma = await updateAsync(db, 'PRAGMA foreign_keys=on');

  let sql = 'UPDATE DiscordUserDressUpItemsOwned set Sequence = IFNULL(IFNULL(Sequence, (SELECT 1+MAX(Sequence) FROM DiscordUserDressUpItemsOwned WHERE UserId=?)),1) WHERE UserId=? AND ItemId=?';
  let resultUpdates = [];
  for(var i=0; i<itemids.length; i++){
    let updates = await updateAsync(db, sql, [userid, userid, itemids[i]]);
    resultUpdates.push(updates);
  }
  db.close();
  return resultUpdates;
}

