const ImageBuilder = require('./img/ImageBuilder');
const getDressUpItem = require('./db/getDressUpItems');
const addDressUpItem = require('./db/addDressUpItem');
const getLootbox = require('./db/getLootBox');
const Embed = require('./message/Message');
const config = require('./config');
/**
 * Routing all messages
 * @param {*} message 
 */
module.exports = function (message, messageContent = message.content) {
  var args = getArgs(messageContent, 0);
  switch (args[0]) {
    case "viewallitems":
    case "viewallitemsbyname":
      viewAllItems(message, "ItemName", args.slice(1));
      break;
    case "viewallitemsbyid":
      viewAllItems(message, "ItemId", args.slice(1));
      break;
    case "vieweq":
    case "viewequips":
      viewMyItems(message, args.slice(1))
      break;
    case "viewitem":
      viewitem(message, args.slice(1))
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
    case "additem":
    case "giveitem":
      giveItem(message, args.slice(1));
      break;
    case "viewlb":
    if (args.length > 1)
    {
      viewLootBoxItems(message, args.slice(1));
      break;
    }
    case "viewlootboxes":
    case "viewlb":
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
async function viewAllItems(message, orderBy, args){
  try{
    let items = await getDressUpItem.selectItemsByTag(orderBy, args);
    Embed.printItems(message, items);  
  }catch(err){
    console.error('viewAllItems Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }  
}
async function viewMyItems(message, args){
  try{
    let items = await getDressUpItem.selectUserCharacterItems(message.author.id);
    Embed.printItems(message, items);  
  }catch(err){
    console.error('viewMyItems Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}

async function viewitem(message, args){
  try{
    let item = await getDressUpItem.selectItemById(args[0]);
    if(!item){
      throw Error("Item "+ args[0] + " does not exist.");
    }else{
      let buffer1 = await ImageBuilder.getBuffer(['./img'+item.Url]);
      message.channel.send('', {
        files: [buffer1]
      });
    }
  }catch(err){
    console.error('viewitem Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }  
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
    let item = await getDressUpItem.selectUserItem(message.author.id, args[0]);
    
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
    let lootboxes = await getLootbox.selectAllLootBoxes();
    Embed.printLootboxes(message, lootboxes);
  }catch(err){
    console.error('viewCharacter Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}

async function viewLootBoxItems(message, args) {
  try{
    let lootboxes = await getLootbox.selectLootBoxItems(args[0]);
    Embed.printLootBoxItems(message, lootboxes);
  }catch(err){
    console.error('viewCharacter Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}