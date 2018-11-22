const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

module.exports = {
  addItem : addItem,
  giveUserItem : giveUserItem,
  addNextSequences : addNextSequences,
  swapSequences : swapSequences,
  removeSequence : removeSequence,
  removeAllSequence : removeAllSequence
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
function updateAsync(db, sql, parms=[]){
  var that = db;
  return new Promise(function(resolve, reject){
    let stmt = db.prepare(sql)
    stmt.run(parms, (err) => {
      if (err) {
        reject (err);
      }else{
        resolve(stmt.changes);
      }
    });
    stmt.finalize();
  });
}
function insertAsync(db, sql, parms=[]){
  var that = db;
  return new Promise(function(resolve, reject){
    let stmt = db.prepare(sql)
    stmt.run(parms, (err) => {
      if (err) {
        reject (err);
      }else{
        resolve(stmt.lastID);
      }
    });
    stmt.finalize();
  });
}


/**
 * 
 * @param {*} userId 
 * @param {*} itemId
 */
async function giveUserItem(userId, itemId){
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
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
 * Adds the given item to the given user return the id of the last
 * @param {string} itemName
 * @param {number} value
 * @param {string} url
 * @return {*} id of the item created.
 */
async function addItem(itemName, value, url, rarity){
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  //SQLITE by default doesn't load enforcing foreign key constraints (turn it on).
  //TODO: Probably need a better way overall to handle db connections across the app.
  let pragma = await updateAsync(db, 'PRAGMA foreign_keys=on');

  let sql = 'INSERT INTO DressUpItems (ItemName, Value, Url, Rarity) VALUES(?, ?, ?, ?)';
  let id = await insertAsync(db, sql, [itemName, value, url, rarity]);
  db.close();

  return id;
}

/**
 * Remove Sequence from all of the given User's items.
 * @param {string} userid
 * @returns {Promise} promise of number of rows updated (change = 1, no change = 0).
 */
async function removeAllSequence(userid){
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
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
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
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
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
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
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
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

