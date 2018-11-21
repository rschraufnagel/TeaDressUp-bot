const getDressUpItem = require('./db/getDressUpItems');
const getLootbox = require('./db/getLootBox');
const Embed = require('./message/Message');
const Currency = require('./db/Currency');
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
    let lootBoxinfo = await getLootbox.selectLootBoxCost(lootBoxId);
    var lootBoxCost = lootBoxinfo[0].Cost;
    //get Rarities
    let RarityPool = await getLootbox.selectRarityPoolsConfig(lootBoxId);
    var FoundRarity = false;
    var TypeOfRarity;

    currentCurrency = currentCurrency - lootBoxCost;

    //Check if user has the money for said box.
    if(currentCurrency > 0)
    {
        //Checking if user rolls for box.
        if(RollForRarityRoll(RarityPool.Special))
        {
            FoundRarity = true;
            TypeOfRarity = "special";
        }
        if(RollForRarityRoll(RarityPool.Legendary) || !FoundRarity)
        {
            FoundRarity = true;
            TypeOfRarity = "legendary";
        }
        if(RollForRarityRoll(RarityPool.Exotic) || !FoundRarity)
        {
            FoundRarity = true;
            TypeOfRarity = "exotic";
        }
        if(RollForRarityRoll(RarityPool.Rare) || !FoundRarity)
        {
            FoundRarity = true;
            TypeOfRarity = "rare";
        }
        if(RollForRarityRoll(RarityPool.Fine) || !FoundRarity)
        {
            FoundRarity = true;
            TypeOfRarity = "fine";
        }
        else{
            TypeOfRarity = "basic";
        }

        let FilteredItemsByLootBoxIdAndRarity = await getDressUpItem.RandomItemBasedOnRarity(TypeOfRarity);

            let buffer1 = await ImageBuilder.getBuffer(['./img'+FilteredItemsByLootBoxIdAndRarity.Url]);
            message.channel.send('', {
              files: [buffer1]
            });
            Embed.printMessage(message, "You rolled " + FilteredItemsByLootBoxIdAndRarity.ItemName,);
            //TODO add sql call to subtract currency for users.
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
    if(dropChance <= dropChanceRoll)
    {
        return true;
    }
    else
    {
        return false;
    }
  }