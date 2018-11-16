const getDressUpItem = require('./db/getDressUpItems');
const getLootbox = require('./db/getLootBox');
const Embed = require('./message/Message');

module.exports = {
    RollLootBox:RollLootBox
  }

  async function RollLootBox(message) {
      var dropChanceRoll = Math.floor((Math.random()*100) + 1)
      
      let items = [
        {DropChance:10}
        ,{DropChance:20}
        ,{DropChance:30}
        ,{DropChance:40}
        ,{DropChance:50}
        ,{DropChance:60}
      ];


    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if(item.DropChance <= dropChanceRoll)
        {
            return Embed.printMessage(message, "You got an item with a " + item.DropChance + " Drop Chance!!!");
        }
    }
  }