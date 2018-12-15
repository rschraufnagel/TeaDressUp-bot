const sqlite3 = require('sqlite3').verbose();
const config = require('../../config');
const getAsync = require('./AsyncCRUD').getAsync;
const allAsync = require('./AsyncCRUD').allAsync;
const updateAsync = require('./AsyncCRUD').updateAsync;
const insertAsync = require('./AsyncCRUD').insertAsync;

module.exports = {
  insertColor : insertColor,
  selectColorsById : selectColorsById
}

async function insertColor(workspace){
  let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
  let pragma = await updateAsync(db, 'PRAGMA foreign_keys=on');

  let sql = 'INSERT INTO ItemStudioColor (Name, Hue, Value, Chroma, MixColor, MixAmount, RedShift, GreenShift, BlueShift) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)';
  let id = await insertAsync(db, sql, [workspace.Name, workspace.Hue, workspace.Value, workspace.Chroma, workspace.MixColor, workspace.MixAmount, workspace.RedShift, workspace.GreenShift, workspace.BlueShift]);
  db.close();
  workspace.WorkspaceId = id;
  return id;
}

/**
 * Query the Colors return in the order the ids were provided.
 */
async function selectColorsById(colorIds){
  let items = [];
  if(colorIds.length>0){
    let db = new sqlite3.Database(config.dressup_connection, (err) => {if (err) {reject(err);}});
    let sql = 'WITH Sequence (Sort, Id) AS (VALUES ';
    let parms = [];
    for(index=0; index<colorIds.length; index++){
      parms.push(index);
      parms.push(colorIds[index]);
      sql += "(?,?),";
    }
    sql = sql.substring(0, sql.length-1)
    sql += ') SELECT Item.* FROM ItemStudioColor As Item INNER JOIN Sequence On Item.ColorId = Id ORDER BY Sort ASC';
    items = await allAsync(db, sql, parms);
    db.close();
  }
  return items;
}