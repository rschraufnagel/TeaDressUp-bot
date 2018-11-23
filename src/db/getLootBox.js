const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

module.exports = {
  selectLootBoxItems : selectLootBoxItems,
  selectAllLootBoxes : selectAllLootBoxes,
  selectLootBoxCost : selectLootBoxCost,
  selectRarityPoolsConfig: selectRarityPoolsConfig
}

//Retrieve All Loot Box Items
function selectLootBoxItems(lootBoxId) {
      let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
      let sqlquery = "select * from LootBoxItems inner join DressUpItems on LootBoxItems.ItemId = DressUpItems.ItemId where LootBoxItems.LootBoxId = ?"
      return new Promise(function(resolve, reject) {
        db.all(sqlquery, [lootBoxId], (err, rows) => {
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

  //Retrieve All Loot boxes
function selectAllLootBoxes() {
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select LootBoxName, LootBoxId from Lootboxes";
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

function selectLootBoxCost(lootBoxId){
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select * from Lootboxes where lootboxid = ?";
  return new Promise(function(resolve, reject) {
    db.all(sqlquery, [lootBoxId], (err, rows) => {
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

function selectRarityPoolsConfig(lootBoxId){
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select Basic, Fine, Masterwork, Rare, Exotic, Legendary, Special from RarityPools where lootboxid = ?";
  return new Promise(function(resolve, reject) {
    db.all(sqlquery, [lootBoxId], (err, rows) => {
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