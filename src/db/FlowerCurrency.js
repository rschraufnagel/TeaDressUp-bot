const sqlite3 = require('sqlite3').verbose();
const config = require('../config');
const getAsync = require('./AsyncCRUD').getAsync;
const allAsync = require('./AsyncCRUD').allAsync;
const updateAsync = require('./AsyncCRUD').updateAsync;

module.exports = {
  selectUserQuantity : selectUserQuantity,
  take : take
}

async function selectUserQuantity (userId) {
  let db = new sqlite3.Database(config.nadeko_connection, (err) => {if (err) {reject(err);}});
  let sql = "select Amount AS Quantity from currency where userid = ?";
  let row = await getAsync(db, sql, [userId]);
  if(!row){
    row = {Quantity:0};
  }
  db.close();
  return row;
}

async function take (userId, quantity) {
  let db = new sqlite3.Database(config.nadeko_connection, (err) => {if (err) {reject(err);}});
  let sql = "UPDATE currency SET Amount = Amount-? where UserId = ? AND Amount >= ?";
  let updated = await updateAsync(db, sql, [Math.abs(quantity), userId, Math.abs(quantity)]);
  if(updated==0){
    throw Error("Cannot take " + quantity+ " Flowers from user.");
  }
  db.close();
  return true;
}
