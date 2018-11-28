const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

//Retrieve UserId for DressUpItemsOwned
function selectUser(user) {
  return new Promise(function(resolve, reject) {
    let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
    let sqlSelectUser = "SELECT userid from DiscordUser WHERE username = ?"

    db.run(sqlSelectUser, [user.username], (err) => {
      if (err) {reject (err);}
      resolve(user);
    });
    db.close();
  });
}