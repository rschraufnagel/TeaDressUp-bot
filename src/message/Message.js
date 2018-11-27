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
    var details = "**Value:** " + item.Value;
    
    newEmbed.addField(item.ItemId + ". " + item.ItemName, details + "\n---------------------------------------------", true);
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
    var details = "**Value:** " + item.Value;
    details += "\n**Quantity:** " + item.Quantity;
    
    newEmbed.addField(item.ItemId + ". " + item.ItemName, details + "\n---------------------------------------------", true);
  }
  return newEmbed;
}

module.exports.printLootBox = async function(message, lootbox){
  let text = "**"+lootbox.LootBoxName + "** (#"+lootbox.LootBoxId+")";
  text += "\n**Cost:** "+lootbox.Cost + " :cherry_blossom:";
  text += "\n__**Box Contents:**__";
  if(lootbox.Basic){
    //No white Heart :(
      text += "\n`⚪` Basic Items"
  }
  if(lootbox.Fine){
    text += "\n`💙` Fine Items"
  }
  if(lootbox.Masterwork){
    text += "\n`💚` Masterwork Items"
  }
  if(lootbox.Rare){
    text += "\n`💛` Rare Items"
  }
  if(lootbox.Exotic){
    text += "\n`🧡` Exotic Items"
  }
  if(lootbox.Legendary){
    text += "\n`💜` Legendary Items"
  }
  if(lootbox.Special){
    text += "\n`🌟` Specialty Items"
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
    
    var details = "**"+lootbox.Cost + "** :cherry_blossom:";
    details += "\n**__Loot:__** `"
    if(lootbox.Basic){
      //No white Heart :(
      details += "⚪"
    }
    if(lootbox.Fine){
      details += "💙"
    }
    if(lootbox.Masterwork){
      details += "💚"
    }
    if(lootbox.Rare){
      details += "💛"
    }
    if(lootbox.Exotic){
      details += "🧡"
    }
    if(lootbox.Legendary){
      details += "💜"
    }
    if(lootbox.Special){
      details += "🌟"
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