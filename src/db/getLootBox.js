const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

//Retrieve All Loot Box Items
function selectLootBoxItems(lootBoxType) {
    return new Promise(function(resolve, reject) {
      let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
      let sqlRetrieveLootBoxItems = "Select ItemName from DressUpItems INNER JOIN ? ON ?.ItemId = DressUpItems.ItemId"
  
      db.run(sqlRetrieveLootBoxItems, [lootBoxType, lootBoxType], (err) => {
        if (err) {reject (err);}
        resolve(user);
      });
      db.close();
    });
  }