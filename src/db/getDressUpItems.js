const sqlite3 = require('sqlite3').verbose();
const config = require('../config');


//Retrieve All Items the User Has
function selectUsersItems(userid) {
  return new Promise(function(resolve, reject) {
    let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
    let sqlRetrieveItems = "Select ItemName from DressUpItems INNER JOIN DiscordUserDressUpItemsOwned ON DiscordUserDressUpItemsOwned.UserId=DressUpItems.user_id WHERE user_id = ?"

    db.run(sqlRetrieveItems, [userid], (err) => {
      if (err) {reject (err);}
      resolve(user);
    });
    db.close();
  });
}

//Retrieve All Dressup Items to display
function selectAllDressUpItems() {
    return new Promise(function(resolve, reject) {
        let db = new sqlite3.Database(config.connection, (err) => {if (err) {reject(err);}});
        let sqlRetrieveItems = "Select * from DressUpItems"
    
        db.run(sqlRetrieveItems, [userid], (err) => {
          if (err) {reject (err);}
          resolve(user);
        });
        db.close();
      });
}



