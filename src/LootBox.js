const config = require('./config');
const getDressUpItem = require('./db/getDressUpItems');
const getLootbox = require('./db/getLootBox');
const updateDressUpItem = require('./db/updateDressUpItem');
const Embed = require('./message/Message');
const FlowerCurrency = require('./db/FlowerCurrency');
const CrystalShardCurrency = require('./db/CrystalShardCurrency');
const ImageBuilder = require('./img/ImageBuilder');

module.exports = {
    BuyLootBox:BuyLootBox
  }

  //I known it's messy but basic idea is here.
  async function BuyLootBox(message, userid, lootBoxId)
  {
    //get lootbox
    let lootBoxinfo = await getLootbox.selectLootBox(lootBoxId);
    if(!lootBoxinfo){
        throw Error("Lootbox " + lootBoxId + " doesn't exist.");
    }
    let Currency;
    if(lootBoxinfo.Currency=="CrystalShards"){
        Currency = CrystalShardCurrency;
    }else if(lootBoxinfo.Currency=="Flowers"){
        Currency = FlowerCurrency;
    }else{
        throw Error("Lootbox uses an unknown currency: " + lootBoxinfo.Currency);
    }

    //get flowers
    let userCurrency = await Currency.selectUserQuantity(userid);
    var currentCurrency = userCurrency.Quantity;
    
    
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
    if(currentCurrency >= 0)
    {
        var rngNum = Math.floor((Math.random()*100));
        //sample: legendary(0), exotic(10),rare(0),masterwork(40),fine(70),basic(100)
        //Special
        if (rngNum < RarityPool.Special) {
            foundItem = await getDressUpItem.getRandomSpecialItem(lootBoxId);
            if(highestRarity == "special")
            {
                Embed.printMessage(message, "<:inAwe:417515935331778560> WOW! "+ message.author.username+" is super lucky! <:inAwe:417515935331778560>");
            }
            itemRarity = "Special";
        }
        //Legendary
        if (!foundItem && rngNum < RarityPool.Legendary) {
            foundItem = await getDressUpItem.getRandomRarityItem("legendary");
            if(highestRarity == "legendary")
            {
                Embed.printMessage(message, "<:inAwe:417515935331778560> WOW! "+ message.author.username+" is super lucky! <:inAwe:417515935331778560>");
            }
            if(Math.abs(RarityPool.Special - rngNum) <= 3 && !RarityPool.Special)
            {
                Embed.printMessage(message, message.author.username+" was so close to a Special item! <:tehepelo:412986455640768516>");
            }
            itemRarity = "Legendary";
        }
        //Exotic
        if (!foundItem && rngNum < RarityPool.Exotic) {
            foundItem = await getDressUpItem.getRandomRarityItem("exotic");
            if(highestRarity == "exotic")
            {
                Embed.printMessage(message, "<:inAwe:417515935331778560> WOW! "+ message.author.username+" is super lucky! <:inAwe:417515935331778560>");
            }
            if(Math.abs(RarityPool.Legendary - rngNum) <= 3 && !RarityPool.Legendary)
            {
                Embed.printMessage(message, message.author.username+" was so close to a Legendary item! <:tehepelo:412986455640768516>");
            }
            itemRarity = "Exotic";
        }
        //Rare
        if (!foundItem && rngNum < RarityPool.Rare) {
            foundItem = await getDressUpItem.getRandomRarityItem("rare");
            if(highestRarity == "rare")
            {
                Embed.printMessage(message, "<:inAwe:417515935331778560> WOW! "+ message.author.username+" is super lucky! <:inAwe:417515935331778560>");
            }
            if(Math.abs(RarityPool.Exotic - rngNum) <= 3 && !RarityPool.Exotic)
            {
                Embed.printMessage(message, message.author.username+" was so close to an Exotic item! <:tehepelo:412986455640768516>");
            }
            itemRarity = "Rare";
        }
        //Masterwork
        if (!foundItem && rngNum < RarityPool.Masterwork) {
            foundItem = await getDressUpItem.getRandomRarityItem("masterwork");
            if(highestRarity == "masterwork")
            {
                Embed.printMessage(message, "<:inAwe:417515935331778560> WOW! "+ message.author.username+" is super lucky! <:inAwe:417515935331778560>");
            }
            if(Math.abs(RarityPool.Rare - rngNum) <= 3 && !RarityPool.Rare)
            {
                Embed.printMessage(message, message.author.username+" was so close to a Rare item! <:tehepelo:412986455640768516>");
            }
            itemRarity = "Masterwork";
        }
        //Fine
        if (!foundItem && rngNum < RarityPool.Fine) {
            foundItem = await getDressUpItem.getRandomRarityItem("fine");
            if(highestRarity == "fine")
            {
                Embed.printMessage(message, "<:inAwe:417515935331778560> WOW! "+ message.author.username+" is super lucky! <:inAwe:417515935331778560>");
            }
            if(Math.abs(RarityPool.Masterwork - rngNum) <= 3 || !RarityPool.Masterwork)
            {
                Embed.printMessage(message, message.author.username+" was so close to a Masterwork item! <:tehepelo:412986455640768516>");
            }
            itemRarity = "Fine";
        }
        //Basic
        if (!foundItem && rngNum < RarityPool.Basic) {
            foundItem = await getDressUpItem.getRandomRarityItem("basic");
            if(Math.abs(RarityPool.Fine - rngNum) <= 3 || RarityPool.Fine)
            {
                Embed.printMessage(message, message.author.username+" was so close to a fine item! <:tehepelo:412986455640768516>");
            }
            itemRarity = "Basic";
        }

        let currencyTaken = await Currency.take(userid, lootBoxCost);
        if(!currencyTaken){
            throw Error("Unable to take Flowers.");
        }

        

        if(!foundItem){
            throw Error("Oops.  "+message.author.username+"'s box appeared to be empty.  Better luck next time.");
        }


        let itemGiven = await updateDressUpItem.giveUserItem(userid, foundItem.ItemId);
        if(itemGiven!=1){
            throw Error("Unable to give Item.");
        }


        Embed.printMessage(message, message.author.username+" rolled " + foundItem.ItemName + " (" + itemRarity + ") #"+ foundItem.ItemId);
        let imageNames = await ImageBuilder.getPreviewSequence([foundItem.FileName]);
        let buffer1 = await ImageBuilder.getBuffer(imageNames);
        await Embed.printMessage(message, message.author.username + " now has " + currentCurrency + config.currencyemoji[lootBoxinfo.Currency], buffer1);
    }
    else 
    {
        Embed.printError(message, "Nothing happened because "+message.author.username+" is poor " + config.currencyemoji[lootBoxinfo.Currency]);
        //Message bad things
    }
  }
