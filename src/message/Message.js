var config = require("../config");
var Paginate = require("./Paginate");


module.exports.printItems = async function (message, items, p1=1, title="Items") {
  var msgEmbed = Paginate.createEmbedPage(p1, items, title, itemEmbed)
  var response = await message.channel.send(msgEmbed);
  
  if (config.pageLength < items.length) {
    Paginate.addListeners(message, response, p1, items, title, itemEmbed);
  }
}

function itemEmbed(msgEmbed, items) {
  var newEmbed = msgEmbed;
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var details = "**Value:** " + item.Value;
    
    newEmbed.addField(item.ItemId + ". " + item.ItemName, details + "\n---------------------------------------------", true);
  }
  return newEmbed;
}

module.exports.printInventoryItems = async function (message, items, p1=1, title="Items") {
  var msgEmbed = Paginate.createEmbedPage(p1, items, title, inventoryItemEmbed)
  var response = await message.channel.send(msgEmbed);
  
  if (config.pageLength < items.length) {
    Paginate.addListeners(message, response, p1, items, title, inventoryItemEmbed);
  }
}
function inventoryItemEmbed(msgEmbed, items) {
  var newEmbed = msgEmbed;
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var details = "**Value:** " + item.Value;
    details += "\n**Quantity:** " + item.Quantity;
    
    newEmbed.addField(item.ItemId + ". " + item.ItemName, details + "\n---------------------------------------------", true);
  }
  return newEmbed;
}


function lootBoxEmbed(msgEmbed, lootboxes){
  var newEmbed = msgEmbed;
  for (var i = 0; i < lootboxes.length; i++) {
    var lootbox = lootboxes[i];
    
    var details = "**Lootbox Id:** " + lootbox.LootBoxId;
    newEmbed.addField(lootbox.LootBoxName, details + "\n---------------------------------------------", true);
  return newEmbed;
  }
}

function lootBoxItemsEmbed(msgEmbed, lootBoxItems){
  var newEmbed = msgEmbed;
  for (var i = 0; i < lootBoxItems.length; i++) {
    var lootBoxItem = lootBoxItems[i];
    
    var details = "**Drop Chance:** " + lootBoxItem.DropChance;
    newEmbed.addField(lootBoxItem.ItemName, details + "\n---------------------------------------------", true);
  }
  return newEmbed;
}

module.exports.printLootboxes = async function (message, lootboxes, p1=1, title="Loot boxes") {
  var msgEmbed = Paginate.createEmbedPage(p1, lootboxes, title, lootBoxEmbed)
  var response = await message.channel.send(msgEmbed);
  
  if (config.pageLength < lootboxes.length) {
    Paginate.addListeners(message, response, p1, lootboxes, title, lootBoxEmbed);
  }
}

module.exports.printLootBoxItems = async function (message, lootBoxItems, p1=1, title="Basic Lootbox Contains") {
  var msgEmbed = Paginate.createEmbedPage(p1, lootBoxItems, title, lootBoxItemsEmbed)
  var response = await message.channel.send(msgEmbed);
  
  if (config.pageLength < lootBoxItems.length) {
    Paginate.addListeners(message, response, p1, lootboxes, title, lootBoxItemsEmbed);
  }
}

module.exports.printMessage = function (message, text) {
  var msg = {
    embed: {
      color: parseInt(config.colours.normal),
      description: text
    }
  }
  message.channel.send(msg);
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