const ImageBuilder = require('./img/ImageBuilder');
const getDressUpItem = require('./db/getDressUpItems');
const addDressUpItem = require('./db/addDressUpItem');
const Embed = require('./message/Message');
const config = require('./config');
/**
 * Routing all messages
 * @param {*} message 
 */
module.exports = function (message) {
  var args = getArgs(message, 1);
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
function getArgs(message, startIndex=2){
  let args = message.content.split(/\s+/);
  args = args.slice(startIndex);
  return args;
}

/**
 * Print the current users Saved Character.
 * @param {*} message 
 */
async function viewCharacter(message) {
  try{
    let items = await getDressUpItem.selectUserCharacterItems(message.author.id);
    let urls = items.map(item=> {return './img'+item.Url});
    if(urls.length==0){
      throw Error("You have no items allocated to your character.");
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
 * Admin command to give an item (currently only gives to yourself TODO: give to a different user)
 * @param {*} message 
 * @param {*} args 
 */
async function giveItem(message, args){
  if(config.admins[message.author.id]){
    let success = await addDressUpItem.insertUserItem(message.author.id, args[0]);
    if(success){
      Embed.printMessage(message, "Done");
    }else{
      Embed.printError(message, "Something didn't work");
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
    let updateCount = await addDressUpItem.updateUserItemNextSequence(message.author.id, args[0]);
    let item = await getDressUpItem.getUserItem(message.author.id, args[0]);
    if(!item){
      throw Error("You do not own item "+ args[0]);
    }else if(updateCount==0){
      throw Error("Your character already has item "+ args[0]);
    }else{
      viewCharacter(message)
    }
  }catch(err){
    console.error('addToCharacter Error : ' + err + " - " + err.stack);
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