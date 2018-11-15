const ImageBuilder = require('./img/ImageBuilder');
const getDressUpItem = require('./db/getDressUpItems');
const addDressUpItem = require('./db/addDressUpItem');
const Embed = require('./message/Message');
const config = require('./config');
/**
 * Routing all messages
 * @param {*} message 
 */
module.exports = function (message, messageContent = message.content) {
  var args = getArgs(messageContent, 0);
  switch (args[0]) {
    case "items":
    case "i":
      viewMyItems(message, args.slice(1))
      break;
    case "viewchar":
      viewCharacter(message, args.slice(1));
      break;
    case "equip":
      equipItem(message, args.slice(1));
      break;
    case "unequip":
      unEquipItem(message, args.slice(1));
      break;
    case "unequipall":
      unEquipAllItems(message, args.slice(1));
      break;
    case "giveitem":
      giveItem(message, args.slice(1));
      break;
    case "viewlootboxes":
      viewlootboxes(message, args.slice(1));
      break;
    default:
      console.log("Args: "+ args);
      message.channel.send('Invalid Command!');
  }
}
/**
 * Returns all the arguments (space delimited) passed into the message (excluding the 1st which splits the route)
 * Ex: message "gacha showunit 1" will return [1]
 * @param {*} message
 */
function getArgs(messageContent, startIndex=2){
  let args = messageContent.split(/\s+/);
  args = args.slice(startIndex);
  return args;
}
function getUserId(argumentValue){
  var regex = /^<@(.*)>$/;
  return argumentValue.replace(regex, "$1");
}


/**
 * Print the current users Saved Character.
 * @param {*} message 
 */
/**
 * print the given user id's character or the current user's character if no argument given.
 * @param {*} message 
 * @param {*} args userid (optional)
 */
async function viewCharacter(message, args) {
  try{
    let userId = message.author.id;
    if(args.length>0){
      let argUserId = getUserId(args[0]);
      userId = argUserId;
    }
    let items = await getDressUpItem.selectUserCharacterItems(userId);
    let urls = items.map(item=> {return './img'+item.Url});
    if(urls.length==0){
      throw Error("No items allocated to user character.");
    }
    let buffer1 = await ImageBuilder.getBuffer(urls);
    message.channel.send('', {
      files: [buffer1]
    });
  }catch(err){
    console.error('viewCharacter Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}

async function viewMyItems(message, args){
  //TODO: replace this with the data pulled from the database.
  let items = [
    {ItemId:1, ItemName:"Base Character", Value:0, Url:"/input/character_base.png"}
    ,{ItemId:2, ItemName:"Background - Yellow", Value:10, Url:"/input/bg_yellow.png"}
    ,{ItemId:3, ItemName:"Background - Pink", Value:10, Url:"/input/bg_pink.png"}
    ,{ItemId:4, ItemName:"Accessory - Pink Bow", Value:20, Url:"/input/accessory_pink_bow.png"}
    ,{ItemId:5, ItemName:"Shoes - Blue", Value:5, Url:"/input/shoes_blue.png"}
    ,{ItemId:6, ItemName:"Gloves - Cyan", Value:5, Url:"/input/gloves_cyan.png"}
  ];
  
  Embed.printItems(message, items);
}


/**
 * Admin command to give an item (Give to another user. Note if the argumetn doesn't match the User id pattern gives to yourself)
 * @param {*} message 
 * @param {*} args 
 */
async function giveItem(message, args){
  if(config.admins[message.author.id]){
    try{
      let userId = message.author.id;
      if(args.length>1){
        let argUserId = getUserId(args[1]);
        if(argUserId!=args[1]){
          userId = argUserId;
        }
      }
      let success = await addDressUpItem.insertUserItem(userId, args[0]);
      if(success){
        Embed.printMessage(message, "Done");
      }else{
        Embed.printError(message, "Something didn't work");
      }
    }catch(err){
      console.error('viewCharacter Error : ' + err + " - " + err.stack);
      Embed.printError(message, err.message?err.message:err);
    }
  }else{
    Embed.printError(message, "You don't have access to this command.");
  }
}

/**
 * Adds the Given Item # to the current user's character.  Prints the new Character when finished.
 * @param {*} message 
 * @param {*} args 
 */
async function equipItem(message, args){
  try{
      let equippedItems = await getDressUpItem.selectUserCharacterItems(message.author.id);
      let equippedIds = equippedItems.map(item => item.ItemId);
      let itemsToEquip = args.filter(itemId => !equippedIds.includes(parseInt(itemId)));
      
      let alreadyEquipped = args.filter(itemId => !itemsToEquip.includes(itemId));
      
      let errorMsg = "";
      let totalUpdates = 0;
      if(itemsToEquip.length>0){
        let updateResults = await addDressUpItem.updateUserItemSetNextSequence(message.author.id, itemsToEquip);
        let totalUpdates = updateResults.reduce((x, y) => x + y);

        if(totalUpdates!= itemsToEquip.length){
          let notOwned = [];
          for(var index = 0; index < updateResults.length; index++){
            if(updateResults[index]==0){
                notOwned.push(itemsToEquip[index]);
            }
          }
          if(notOwned.length>0){
            errorMsg +="You do not own item(s): " + notOwned
          }
        }
      }
      if(alreadyEquipped.length>0){
        if(errorMsg.length>0){
          errorMsg +="\n"
        }
        errorMsg +="Item(s) already equipped: " + alreadyEquipped
      }
      if(errorMsg.length>0){
        if(totalUpdates>0){
          errorMsg +="\nAll other items have been equipped."
        }
        Embed.printError(message, errorMsg);
      }
      
      if(itemsToEquip.length>0){
        viewCharacter(message)
      }
  }catch(err){
    console.error('equipItem Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}
/**
 * Remove the Given Item # from the current user's character.  Prints the new Character when finished.
 * @param {*} message 
 * @param {*} args 
 */
async function unEquipItem(message, args){
  try{
    let item = await getDressUpItem.getUserItem(message.author.id, args[0]);
    
    if(!item){
      throw Error("You do not own item "+ args[0]);
    }else if(item.Sequence>0){
      let updateCount = await addDressUpItem.updateUserItemRemoveSequence(message.author.id, item.Sequence);
      viewCharacter(message)
    }else{
      throw Error("Item "+ args[0] + " is not currently equipped on your character.");
    }
  }catch(err){
    console.error('unEquipItem Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}
/**
 * Remove the Given Item # from the current user's character.  Prints the new Character when finished.
 * @param {*} message 
 * @param {*} args 
 */
async function unEquipAllItems(message, args){
  try{
    let updateCount = await addDressUpItem.updateUserItemRemoveAllSequence(message.author.id);

    Embed.printMessage(message, "Your character has been cleared.");
  }catch(err){
    console.error('unEquipItem Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}

async function viewlootboxes(message, args) {
  try{
    let lootboxes = await getDressUpItem.selectAllLootBoxes();
    Embed.printLootboxes(message, lootboxes);
  }catch(err){
    console.error('viewCharacter Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}