const Discord = require("discord.js");
var config = require("../config");

module.exports = {
  createEmbedPage: createEmbedPage,
  addListeners: addListeners
}

/**
 * Create an embed message of a single page of items.
 * This function is formated to be used in the paginate function.
 * @param {*} page page number to display
 * @param {*} items list of items to print in the message
 * @param {*} title 
 * @param {*} itemEmbedFunction Function to pass items into to generate a single page message.
 */
function createEmbedPage(page, items, title, itemEmbedFunction){
  var pageLength = config.pageLength;
  var curPage = parseInt(page);
  var maxPage = Math.ceil(items.length / pageLength);
  var printItems = items.slice((pageLength * (curPage - 1)), (pageLength * curPage));
  if(printItems.length==0){
    curPage=0;
  }
  var msgEmbed = new Discord.RichEmbed();
  msgEmbed.setColor(parseInt(config.colours.normal));
  msgEmbed.setTitle("**__" + title + "     p. " +curPage + "/" + maxPage + "__**");
  msgEmbed = itemEmbedFunction(msgEmbed, printItems);
  return msgEmbed;
}

/**
 * Apply Pagination Listener emotes to teh given message (response)
 * @param {*} message initial message triggering the pagination list (only needed for the user id to stop listening for other user reactions.)
 * @param {*} response the message to listen to for pagination
 * @param {*} page page number which was displayed in the response
 * @param {*} itemList full list of items to paginate over
 * @param {*} title message title needed when rebuilding the message's next page
 * @param {*} itemEmbedFunction function to build the next page.
 */
async function addListeners(message, response, page, itemList, title, itemEmbedFunction){
  var filterPrev = (reaction, user) => { return (reaction.emoji.name === '◀' && user.id === message.author.id) };
  var filterNext = (reaction, user) => { return (reaction.emoji.name === '▶' && user.id === message.author.id) };

  await response.react("◀");
  await response.react("▶");

  const collectPrev = response.createReactionCollector(filterPrev, { time: 15000 });
  collectPrev.on('collect', async (r1) => {
    console.log('CATCH PREV : ' + r1);
    if (page > 1) {
      page -= 1;
      console.log("CurPage down to " + page);
    }
    var newMsg = createEmbedPage(page, itemList, title, itemEmbedFunction)
    response.edit(newMsg);
  });

  const collectNext = response.createReactionCollector(filterNext, { time: 15000 });
  collectNext.on('collect', async (r1) => {
    console.log('CATCH PREV : ' + r1);
    var maxPage = Math.ceil(itemList.length / config.pageLength);
    if (page < maxPage) {
      page += 1;
      console.log("CurPage down to " + page);
    }
    var newMsg = createEmbedPage(page, itemList, title, itemEmbedFunction)
    response.edit(newMsg);
  });
}