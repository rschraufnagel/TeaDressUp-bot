const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

module.exports = {
  selectLootSpecialItems : selectLootSpecialItems,
  selectAllLootBoxes : selectAllLootBoxes,
  selectLootBox : selectLootBox,
  selectBoxRarityPool: selectBoxRarityPool
}

//Retrieve All Loot Box Items
function selectLootSpecialItems(lootBoxId) {
      let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
      let sqlquery = "select * from LootBoxSpecialItem inner join DressUpItems on LootBoxSpecialItem.ItemId = DressUpItems.ItemId where LootBoxSpecialItem.LootBoxId = ?"
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
  let sqlquery = "Select LootBoxName, LootBoxId, Cost, Basic, Fine, Masterwork, Rare, Exotic, Legendary, Special from LootBox LEFT JOIN RarityPool ON LootBox.RarityPoolId = RarityPool.RarityPoolId";
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

function selectLootBox(lootBoxId){
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select * from LootBox LEFT JOIN RarityPool ON LootBox.RarityPoolId = RarityPool.RarityPoolId where LootBoxId = ?";
  return new Promise(function(resolve, reject) {
    db.get(sqlquery, [lootBoxId], (err, row) => {
      if (err) {reject (err);}
      resolve(row);
    });
    db.close();
  });
}

function selectBoxRarityPool(lootBoxId){
  let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
  let sqlquery = "Select Basic, Fine, Masterwork, Rare, Exotic, Legendary, Special from RarityPool INNER JOIN LootBox ON LootBox.RarityPoolId = RarityPool.RarityPoolId  where LootBoxId = ?";
  return new Promise(function(resolve, reject) {
    db.get(sqlquery, [lootBoxId], (err, row) => {
      if (err) {reject (err);}
      resolve(row);
    });
    db.close();
  });
}
