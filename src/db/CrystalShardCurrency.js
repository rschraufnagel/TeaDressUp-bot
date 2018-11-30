const sqlite3 = require('sqlite3').verbose();
const config = require('../../config');
const getAsync = require('./AsyncCRUD').getAsync;
const allAsync = require('./AsyncCRUD').allAsync;
const updateAsync = require('./AsyncCRUD').updateAsync;
const insertAsync = require('./AsyncCRUD').insertAsync;


module.exports = {
    addUser:addUser,
    selectUserQuantity : selectUserQuantity,
    give : give,
    take : take
  }

async function addUser (userId) {
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  let sql = "INSERT INTO DiscordUserCrystalShard (UserId) VALUES (?)";
  let inserted = await insertAsync(db, sql, [userId]);
  db.close();
  return true;
}

async function selectUserQuantity (userId) {
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  let sql = "SELECT Quantity FROM DiscordUserCrystalShard WHERE UserId = ?";
  let row = await getAsync(db, sql, [userId]);
  if(!row){
    return false;
  }
  db.close();
  return row;
}

async function give (userId, quantity) {
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  let sql = "UPDATE DiscordUserCrystalShard SET Quantity= Quantity + ? WHERE UserId = ?";
  let updated = await updateAsync(db, sql, [Math.abs(quantity), userId]);
  if(updated==0){
    throw Error("User is not registered.");
  }
  db.close();
  return true;
}

async function take (userId, quantity) {
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  let sql = "UPDATE DiscordUserCrystalShard SET Quantity= Quantity - ? WHERE UserId = ? AND Quantity >= ?";
  let updated = await updateAsync(db, sql, [Math.abs(quantity), userId, Math.abs(quantity)]);
  if(updated==0){
    throw Error("Cannot take " + quantity+ " CrystalShards from user.");
  }
  db.close();
  return true;
}