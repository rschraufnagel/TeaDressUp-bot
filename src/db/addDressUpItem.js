const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

module.exports = {
  insertUserItem : insertUserItem,
  updateUserItemNextSequence : updateUserItemNextSequence
}

/**
 * Adds the given item to the given user
 * @param {string} userid
 * @param {number} itemid
 */
function insertUserItem(userid, itemid) {
  return new Promise(function(resolve, reject) {
    let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
    let sqlInsertUser = 'INSERT INTO DiscordUserDressUpItemsOwned (UserId, ItemId) VALUES(?, ?)';
    
    db.run(sqlInsertUser, [userid, itemid ], (err) => {
      if (err) {reject (err);}
      resolve(true);
    });
    db.close();
  });
}

/**
 * Adds the given item to the user's active item list at the next highest position
 * @param {string} userid
 * @param {number} itemid
 * @returns {Promise} promise of number of rows updated (change = 1, no change = 0).
 */
function updateUserItemNextSequence(userid, itemid) {
  console.log("DB:"+ config.connection);
  return new Promise(function(resolve, reject) {
    let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
    let sql = 'UPDATE DiscordUserDressUpItemsOwned set Sequence = IFNULL(IFNULL(Sequence, (SELECT 1+MAX(Sequence) FROM DiscordUserDressUpItemsOwned WHERE UserId=?)),1) WHERE UserId=? AND ItemId=?';
    let stmt = db.prepare(sql)
    .run([userid, userid, itemid], (err) => {
      if (err) {reject (err);}
      console.log("Rows: "+ stmt.changes);
      resolve(stmt.changes);
    });
    stmt.finalize();
    db.close();
  });
}