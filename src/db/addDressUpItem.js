const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

module.exports = {
  insertUserItem : insertUserItem,
  updateUserItemSetNextSequence : updateUserItemSetNextSequence,
  updateUserItemRemoveSequence : updateUserItemRemoveSequence,
  updateUserItemRemoveAllSequence : updateUserItemRemoveAllSequence
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
 * Adds the given items to the user's active item list at the next highest position (items already in the active list remain at their current position)
 * @param {string} userid 
 * @param {array} itemids array of itemIds
 */
function updateUserItemSetNextSequence(userid, itemids) {
  return new Promise(function(resolve, reject) {
    let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
    let sql = 'UPDATE DiscordUserDressUpItemsOwned set Sequence = IFNULL(IFNULL(Sequence, (SELECT 1+MAX(Sequence) FROM DiscordUserDressUpItemsOwned WHERE UserId=?)),1) WHERE UserId=? AND ItemId=?';
    let resultUpdates = [];
    db.serialize(async function(){
      let stmt = db.prepare(sql);

      let statementsReturned = 0;
      for(var i=0; i<itemids.length; i++){
        let parms = [userid, userid, itemids[i]];
        stmt.run(parms, (err) => {
          statementsReturned++;
          if (err) {
            reject (err);
          }
          resultUpdates.push(stmt.changes);
          if(statementsReturned==itemids.length){
            resolve(resultUpdates);
          }
        });
      }
      stmt.finalize();
    });
    db.close();
  });
}



/**
 *  Update the Items owned by the given UserId using the following logic:
 *  set sequenceNumber = null where sequenceNumber = the # provided.
 *  set sequenceNumber = sequenceNumber-1 where sequenceNumber> the # provided.
 * @param {string} userid
 * @param {number} sequenceNumber
 * @returns {Promise} promise of number of rows updated (change = 1, no change = 0).
 */
function updateUserItemRemoveSequence(userid, sequenceNumber) {
  console.log("DB:"+ config.connection);
  return new Promise(function(resolve, reject) {
    let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
    let sql = 'UPDATE DiscordUserDressUpItemsOwned set Sequence = CASE WHEN Sequence=? THEN null ELSE Sequence-1 END WHERE UserId=? AND Sequence>=?';
    let stmt = db.prepare(sql)
    .run([sequenceNumber, userid, sequenceNumber], (err) => {
      if (err) {reject (err);}
      console.log("Rows: "+ stmt.changes);
      resolve(stmt.changes);
    });
    stmt.finalize();
    db.close();
  });
}

/**
 * Remove Sequence from all of the given User's items.
 * @param {string} userid
 * @returns {Promise} promise of number of rows updated (change = 1, no change = 0).
 */
function updateUserItemRemoveAllSequence(userid) {
  console.log("DB:"+ config.connection);
  return new Promise(function(resolve, reject) {
    let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
    let sql = 'UPDATE DiscordUserDressUpItemsOwned set Sequence = null WHERE UserId=? AND Sequence is not null';
    let stmt = db.prepare(sql)
    .run([userid], (err) => {
      if (err) {reject (err);}
      console.log("Rows: "+ stmt.changes);
      resolve(stmt.changes);
    });
    stmt.finalize();
    db.close();
  });
}