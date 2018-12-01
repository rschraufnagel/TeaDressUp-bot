var config = require("../config");
var Paginate = require("./Paginate");


module.exports.printItems = async function (message, items, p1=1, title="Items") {
  var msgEmbed = Paginate.createEmbedPage(p1, items, title, itemEmbed)
  var response = await message.channel.send(msgEmbed);
  
  if (config.pageLength < items.length) {
    Paginate.addListeners(message.author.id, response, p1, items, title, itemEmbed);
  }
}

function itemEmbed(msgEmbed, items) {
  var newEmbed = msgEmbed;
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var details = "**Val:** " + item.Value;
    details += " `"+config.rarityemoji[item.Rarity]+"`";
    newEmbed.addField(item.ItemId + ". " + item.ItemName, details + "\n---------------------------------------------", false);
  }
  return newEmbed;
}

module.exports.printInventoryItems = async function (message, items, p1=1, title="Items") {
  var msgEmbed = Paginate.createEmbedPage(p1, items, title, inventoryItemEmbed)
  var response = await message.channel.send(msgEmbed);
  
  if (config.pageLength < items.length) {
    Paginate.addListeners(message.author.id, response, p1, items, title, inventoryItemEmbed);
  }
}
function inventoryItemEmbed(msgEmbed, items) {
  var newEmbed = msgEmbed;
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var details = "**Qty:** " + item.Quantity
    details += " **Val:** " + item.Value;
    details += " `"+config.rarityemoji[item.Rarity]+"`";
    newEmbed.addField(item.ItemId + ". " + item.ItemName, details + "\n---------------------------------------------", false);
  }
  return newEmbed;
}

module.exports.printLootBox = async function(message, lootbox){

  let text = "**"+lootbox.LootBoxName + "** (#"+lootbox.LootBoxId+")";
  text += "\n**Cost:** "+lootbox.Cost + " " + config.currencyemoji[lootbox.Currency];
  text += "\n__**Box Contents:**__";
  if(lootbox.Basic){
    //No white Heart :(
      text += "\n`"+config.rarityemoji.Basic+"` Basic Items"
  }
  if(lootbox.Fine){
    text += "\n`"+config.rarityemoji.Fine+"` Fine Items"
  }
  if(lootbox.Masterwork){
    text += "\n`"+config.rarityemoji.Masterwork+"` Masterwork Items"
  }
  if(lootbox.Rare){
    text += "\n`"+config.rarityemoji.Rare+"` Rare Items"
  }
  if(lootbox.Exotic){
    text += "\n`"+config.rarityemoji.Exotic+"` Exotic Items"
  }
  if(lootbox.Legendary){
    text += "\n`"+config.rarityemoji.Legendary+"` Legendary Items"
  }
  if(lootbox.Special){
    text += "\n`"+config.rarityemoji.Special+"` Specialty Items"
  }
  var msg = {
    embed: {
      color: parseInt(config.colours.normal),
      description: text
    }
  }
  message.channel.send(msg);
}

function lootBoxListEmbed(msgEmbed, lootboxes){
  var newEmbed = msgEmbed;
  for (var i = 0; i < lootboxes.length; i++) {
    var lootbox = lootboxes[i];
    
    var details = "**"+lootbox.Cost + "** " + config.currencyemoji[lootbox.Currency];
    details += "\n**__Loot:__** `"
    if(lootbox.Basic){
      //No white Heart :(
      details += config.rarityemoji.Basic;
    }
    if(lootbox.Fine){
      details += config.rarityemoji.Fine;
    }
    if(lootbox.Masterwork){
      details += config.rarityemoji.Masterwork;
    }
    if(lootbox.Rare){
      details += config.rarityemoji.Rare;
    }
    if(lootbox.Exotic){
      details += config.rarityemoji.Exotic;
    }
    if(lootbox.Legendary){
      details += config.rarityemoji.Legendary;
    }
    if(lootbox.Special){
      details += config.rarityemoji.Special;
    }
    details += "`"
    newEmbed.addField(lootbox.LootBoxId + ". " + lootbox.LootBoxName, details + "\n---------------------------------------------", true);
  }
  return newEmbed;
}

module.exports.printLootboxes = async function (message, lootboxes, p1=1, title="Loot boxes") {
  var msgEmbed = Paginate.createEmbedPage(p1, lootboxes, title, lootBoxListEmbed)
  var response = await message.channel.send(msgEmbed);
  
  if (config.pageLength < lootboxes.length) {
    Paginate.addListeners(message.author.id, response, p1, lootboxes, title, lootBoxListEmbed);
  }
}

module.exports.printMessage = function (message, text, fileBuffer) {
  var msg = {
  };
  if(text.length>1){
    msg.embed = {
      color: parseInt(config.colours.normal),
      description: text
    }
  }
  if(fileBuffer){
    msg.files =[fileBuffer];
  }
  return message.channel.send(msg);
}

module.exports.printError = function (message, text) {
  var msg = {
    embed: {
      color: parseInt(config.colours.error),
      description: text
    }
  }
  return message.channel.send(msg);
}