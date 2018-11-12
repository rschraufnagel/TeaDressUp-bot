const ImageBuilder = require('./img/ImageBuilder');

/**
 * Routing all messages
 * @param {*} message 
 */
module.exports = function (message) {
  var args = getArgs(message, 1);
  switch (args[0]) {
    case "view":
    case "v":
      viewCharacter(message, args.slice(1));
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
 * 
 * @param {*} message 
 * @param {*} args 
 */
async function viewCharacter(message, args) {
  img1 = [
    './img/input/bg_yellow.png'
   ,'./img/input/character_base.png'
   ,'./img/input/gloves_cyan.png'
   ,'./img/input/accessory_pink_bow.png'
   ,'./img/input/shoes_blue.png'
 ]
  try{
    let buffer1 = await ImageBuilder.getBuffer(img1);
    message.channel.send('Composite 1 Image Below', {
      files: [buffer1]
    });
  }catch(err){
    console.error(err);
  }
}