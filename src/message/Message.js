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

