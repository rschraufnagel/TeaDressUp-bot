const getDressUpItem = require('./db/getDressUpItems');
const getLootbox = require('./db/getLootBox');
const updateDressUpItem = require('./db/updateDressUpItem');
const Embed = require('./message/Message');
const Currency = require('./db/FlowerCurrency');
const ImageBuilder = require('./img/ImageBuilder');

module.exports = {
    BuyLootBox:BuyLootBox
  }

  //I known it's messy but basic idea is here.
  async function BuyLootBox(message, userid, lootBoxId)
  {
      //get flowers
    let userCurrency = await Currency.getFlowers(userid);
    var currentCurrency = userCurrency[0].Amount;
    //get lootbox cost
    let lootBoxinfo = await getLootbox.selectLootBox(lootBoxId);
    var lootBoxCost = lootBoxinfo.Cost;
    //get Rarities
    let RarityPool = await getLootbox.selectBoxRarityPool(lootBoxId);
    var foundItem;

    currentCurrency = currentCurrency - lootBoxCost;

    //Check if user has the money for said box.
    if(currentCurrency > 0)
    {
        var rngNum = Math.floor((Math.random()*100));
        //sample: legendary(0), exotic(10),rare(0),masterwork(40),fine(70),basic(100)
        if (rngNum < RarityPool.Special) {
            foundItem = await getDressUpItem.getRandomRarityItem(lootBoxId);
        }
        if (!foundItem && rngNum < RarityPool.Legendary) {
            foundItem = await getDressUpItem.getRandomRarityItem("legendary");
        }
        if (!foundItem && rngNum < RarityPool.Exotic) {
            foundItem = await getDressUpItem.getRandomRarityItem("exotic");
        }
        if (!foundItem && rngNum < RarityPool.Rare) {
            foundItem = await getDressUpItem.getRandomRarityItem("rare");
        }
        if (!foundItem && rngNum < RarityPool.Masterwork) {
            foundItem = await getDressUpItem.getRandomRarityItem("masterwork");
        }
        if (!foundItem && rngNum < RarityPool.Fine) {
            foundItem = await getDressUpItem.getRandomRarityItem("fine");
        }
        if (!foundItem && rngNum < RarityPool.Basic) {
            foundItem = await getDressUpItem.getRandomRarityItem("basic");
        }

        let currencyTaken = await Currency.spendFlowers(userid, lootBoxCost);
        if(currencyTaken!=1){
            throw Error("Unable to take Flowers.");
        }

        if(!foundItem){
            throw Error("Oops.  Your box appeared to be empty.  Better luck next time.");
        }


        let itemGiven = await updateDressUpItem.giveUserItem(userid, foundItem.ItemId);
        if(itemGiven!=1){
            throw Error("Unable to give Item.");
        }

        let buffer1 = await ImageBuilder.getBuffer([foundItem.FileName]);
        message.channel.send('', {
            files: [buffer1]
        });
        Embed.printMessage(message, "You rolled " + foundItem.ItemName);
    }
    else 
    {
        Embed.printError(message, "Nothing happened because you are poor")
        //Message bad things
    }
  }

  function RollForRarityRoll(dropChance)
  {
    var dropChanceRoll = Math.floor((Math.random()*100) + 1);
    console.log(dropChance + " >= " + dropChanceRoll);
    if(dropChance >= dropChanceRoll)
    {
        console.log("True");
        return true;
    }
    else
    {
        console.log("False");
        return false;
    }
  }