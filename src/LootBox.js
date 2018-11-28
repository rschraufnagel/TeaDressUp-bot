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
    var highestRarity;
    var highestRarityFound = false;
    var itemRarity;

    if(!RarityPool.Special == 0)
    {
        highestRarity = "special";
        highestRarityFound = true;
    }
    if(!RarityPool.Legendary == 0 && !highestRarityFound)
    {
        highestRarity = "legendary";
        highestRarityFound = true;
    }
    if(!RarityPool.Exotic == 0 && !highestRarityFound)
    {
        highestRarity = "exotic";
        highestRarityFound = true;
    }
    if(!RarityPool.Rare == 0 && !highestRarityFound)
    {
        highestRarity = "rare";
        highestRarityFound = true;
    }
    if(!RarityPool.Masterwork == 0 && !highestRarityFound)
    {
        highestRarity = "masterwork";
        highestRarityFound = true;
    }
    if(!RarityPool.Fine == 0 && !highestRarityFound)
    {
        highestRarity = "fine";
        highestRarityFound = true;
    }

    
    currentCurrency = currentCurrency - lootBoxCost;

    //Check if user has the money for said box.
    if(currentCurrency > 0)
    {
        var rngNum = Math.floor((Math.random()*100));
        //sample: legendary(0), exotic(10),rare(0),masterwork(40),fine(70),basic(100)
        //Special
        if (rngNum < RarityPool.Special) {
            foundItem = await getDressUpItem.getRandomRarityItem(lootBoxId);
            if(highestRarity == "special")
            {
                Embed.printMessage(message, "<:inAwe:417515935331778560> WOW! You are super lucky! <:inAwe:417515935331778560>");
            }
            itemRarity = "Special";
        }
        //Legendary
        if (!foundItem && rngNum < RarityPool.Legendary) {
            foundItem = await getDressUpItem.getRandomRarityItem("legendary");
            if(highestRarity == "legendary")
            {
                Embed.printMessage(message, "<:inAwe:417515935331778560> WOW! You are super lucky! <:inAwe:417515935331778560>");
            }
            if(Math.abs(RarityPool.Special - rngNum) <= 3 && !RarityPool.Special)
            {
                Embed.printMessage(message, "You were so close to a Special item! <:tehepelo:458997346617786378>");
            }
            itemRarity = "Legendary";
        }
        //Exotic
        if (!foundItem && rngNum < RarityPool.Exotic) {
            foundItem = await getDressUpItem.getRandomRarityItem("exotic");
            if(highestRarity == "exotic")
            {
                Embed.printMessage(message, "<:inAwe:417515935331778560> WOW! You are super lucky! <:inAwe:417515935331778560>");
            }
            if(Math.abs(RarityPool.Legendary - rngNum) <= 3 && !RarityPool.Legendary)
            {
                Embed.printMessage(message, "You were so close to a Legendary item! <:tehepelo:458997346617786378>");
            }
            itemRarity = "Exotic";
        }
        //Rare
        if (!foundItem && rngNum < RarityPool.Rare) {
            foundItem = await getDressUpItem.getRandomRarityItem("rare");
            if(highestRarity == "rare")
            {
                Embed.printMessage(message, "<:inAwe:417515935331778560> WOW! You are super lucky! <:inAwe:417515935331778560>");
            }
            if(Math.abs(RarityPool.Exotic - rngNum) <= 3 && !RarityPool.Exotic)
            {
                Embed.printMessage(message, "You were so close to an Exotic item! <:tehepelo:458997346617786378>");
            }
            itemRarity = "Rare";
        }
        //Masterwork
        if (!foundItem && rngNum < RarityPool.Masterwork) {
            foundItem = await getDressUpItem.getRandomRarityItem("masterwork");
            if(highestRarity == "masterwork")
            {
                Embed.printMessage(message, "<:inAwe:417515935331778560> WOW! You are super lucky! <:inAwe:417515935331778560>");
            }
            if(Math.abs(RarityPool.Rare - rngNum) <= 3 && !RarityPool.Rare)
            {
                Embed.printMessage(message, "You were so close to a Rare item! <:tehepelo:458997346617786378>");
            }
            itemRarity = "Masterwork";
        }
        //Fine
        if (!foundItem && rngNum < RarityPool.Fine) {
            foundItem = await getDressUpItem.getRandomRarityItem("fine");
            if(highestRarity == "fine")
            {
                Embed.printMessage(message, "<:inAwe:417515935331778560> WOW! You are super lucky! <:inAwe:417515935331778560>");
            }
            if(Math.abs(RarityPool.Masterwork - rngNum) <= 3 || !RarityPool.Masterwork)
            {
                Embed.printMessage(message, "You were so close to a Masterwork item! <:tehepelo:458997346617786378>");
            }
            itemRarity = "Fine";
        }
        //Basic
        if (!foundItem && rngNum < RarityPool.Basic) {
            foundItem = await getDressUpItem.getRandomRarityItem("basic");
            if(Math.abs(RarityPool.Fine - rngNum) <= 3 || RarityPool.Fine)
            {
                Embed.printMessage(message, "You were so close to a fine item! <:tehepelo:458997346617786378>");
            }
            itemRarity = "Basic";
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
        Embed.printMessage(message, "You rolled " + foundItem.ItemName + " (" + itemRarity + ")");
    }
    else 
    {
        Embed.printError(message, "Nothing happened because you are poor")
        //Message bad things
    }
  }