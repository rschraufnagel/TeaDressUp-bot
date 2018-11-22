const ImageBuilder = require('./img/ImageBuilder');
const getDressUpItem = require('./db/getDressUpItems');
const addDressUpItem = require('./db/updateDressUpItem');
const getLootbox = require('./db/getLootBox');
const Embed = require('./message/Message');
const config = require('./config');
const lootBox = require('./LootBox');

/**
 * Routing all messages
 * @param {*} message 
 */
module.exports = function (message, messageContent = message.content) {
  var args = getArgs(messageContent, 0);
  switch (args[0]) {
    case "viewallitems":
    case "viewallitemsbyname":
      printAllItems(message, "ItemName", args.slice(1));
      break;
    case "viewallitemsbyid":
      printAllItems(message, "ItemId", args.slice(1));
      break;
    case "vieweq":
    case "viewequips":
      printCharacterItems(message, args.slice(1));
      break;
    case "viewinventory":
    case "viewinv":
      printInventoryItems(message, args.slice(1));
      break;
    case "viewitem":
      viewitem(message, args.slice(1));
      break;
    case "viewchar":
      viewCharacter(message, args.slice(1));
      break;
    case "charval":
      printCharacterValue(message, args.slice(1));
      break;
    case "replace":
      replaceItem(message, args.slice(1));
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
    case "addnewitem":
        addNewItem(message, args.slice(1));
        break;
    case "viewlb":
    if (args.length > 1)
    {
      viewLootBoxItems(message, args.slice(1));
      break;
    }
    case "buylb":
    if (args.length > 1)
    {
      buyLootBox(message, args.slice(1));
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
    if(args && args.length>0){
      let argUserId = getUserId(args[0]);
      userId = argUserId;
    }
    let items = await getDressUpItem.selectUserCharacterItems(userId);
    let fileNames = items.map(item=> {return item.FileName});
    if(fileNames.length==0){
      throw Error("No items allocated to user character.");
    }
    let buffer1 = await ImageBuilder.getBuffer(fileNames);
    message.channel.send('', {
      files: [buffer1]
    });
  }catch(err){
    console.error('viewCharacter Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}
/**
 * Print the value of the current user or the given User if provided in the 1st argument.
 * @param {*} message 
 * @param {*} args 
 */
async function printCharacterValue(message, args) {
  try{
    let userId = message.author.id;
    if(args && args.length>0){
      let argUserId = getUserId(args[0]);
      userId = argUserId;
    }
    let row = await getDressUpItem.selectUserCharacterValue(userId);

    let username = message.client.users.get(userId).username;
    Embed.printMessage(message, username + "'s value is " + row.Value);
  }catch(err){
    console.error('printCharacterValue Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}


async function printAllItems(message, orderBy, args){
  try{
    let items = await getDressUpItem.selectItemsByTag(orderBy, args);
    Embed.printItems(message, items);  
  }catch(err){
    console.error('printAllItems Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }  
}
async function printCharacterItems(message, args){
  try{
    let items = await getDressUpItem.selectUserCharacterItems(message.author.id);
    Embed.printItems(message, items);  
  }catch(err){
    console.error('printCharacterItems Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}
async function printInventoryItems(message, args){
  try{
    let items = await getDressUpItem.selectUserItems(message.author.id);
    Embed.printInventoryItems(message, items);  
  }catch(err){
    console.error('printInventoryItems Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}

async function viewitem(message, args){
  try{
    let item = await getDressUpItem.selectItemById(args[0]);
    if(!item){
      throw Error("Item "+ args[0] + " does not exist.");
    }else{
      let baseBody = await getDressUpItem.selectItemById(config.previewBaseBodyId);
      let images = [item.FileName];
      let keyword_back = "back";
      if(item.FileName.includes(keyword_back)){
        images.push(baseBody.FileName)
      }else{
        images.unshift(baseBody.FileName); 
      }
      let buffer1 = await ImageBuilder.getBuffer(images);
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
      let success = await addDressUpItem.giveUserItem(userId, args[0]);
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
 * Admin command to give an item (Give to another user. Note if the argumetn doesn't match the User id pattern gives to yourself)
 * @param {*} message 
 * @param {*} args 
 */
async function buildMissingPreviews(message, args){
  if(config.admins[message.author.id]){
    try{
      let userId = message.author.id;
      if(args.length>1){
        let argUserId = getUserId(args[1]);
        if(argUserId!=args[1]){
          userId = argUserId;
        }
      }
      let success = await addDressUpItem.giveUserItem(userId, args[0]);
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
 * Admin command to add a new item to the Database
 * @param {*} message 
 * @param {*} args 
 */
async function addNewItem(message, args){
  if(config.admins[message.author.id]){
    try{
      if(message.attachments.size!=1){
        throw Error("Message must contain 1 attachment.");
      }
      if(args.length<3){
        throw Error("Message must provide 3 arguments Rariry, Value, and Item Name.");
      }
      let itemRariry = args[0];
      let value = parseInt(args[1]);
      if(isNaN(value)){
        throw Error("Value is not a number.");
      }
      let itemName = args.slice(2).join(" ").trim();
      if(itemName.length==0){
        throw Error("Item Name cannot be empty.");
      }
      let attachmentFile = message.attachments.first();
      let fileName = attachmentFile.filename;
      let foundFileNameItem = await getDressUpItem.selectItemByFileName(fileName);
      if( foundFileNameItem ){
        throw Error(fileName + " already exists.");
      }

      ImageBuilder.downloadImage(attachmentFile.fileName, fileName, async function(){
        try{
          let index = await addDressUpItem.addItem(itemName, value, fileName, itemRariry);
          Embed.printMessage(message, "Item added at index: " + index);
        }catch(err){
          console.error('downloadImageCallback Error : ' + err + " - " + err.stack);
          Embed.printError(message, err.message?err.message:err);
        }
      });
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
        let updateResults = await addDressUpItem.addNextSequences(message.author.id, itemsToEquip);
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
      let updateCount = await addDressUpItem.removeSequence(message.author.id, item.Sequence);
      viewCharacter(message)
    }else{
      throw Error("Item "+ args[0] + " is not currently equipped on your character.");
    }
  }catch(err){
    console.error('unEquipItem Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}
async function replaceItem(message, args){
  try{
    if(args.length<2){
      throw Error("Must provide Old Item and New Item");
    }
    let oldItem = await getDressUpItem.selectUserItem(message.author.id, args[0]);
    let newItem = await getDressUpItem.selectUserItem(message.author.id, args[1]);
    if(!oldItem){
      throw Error("You do not own item "+ args[0]);
    }else if(!newItem){
      throw Error("You do not own item "+ args[1]);
    }else{
      let updateCount = await addDressUpItem.swapSequences(message.author.id, oldItem, newItem);
      viewCharacter(message)
    }

  }catch(err){
    console.error('replaceEquipItem Error : ' + err + " - " + err.stack);
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
    let updateCount = await addDressUpItem.removeAllSequence(message.author.id);

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

async function buyLootBox(message, args){
  try{
    lootBox.BuyLootBox(message, message.author.id, args[0]);
  }
  catch(err){
    console.error('viewCharacter Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}