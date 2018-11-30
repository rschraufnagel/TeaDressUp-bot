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
  if(isNaN(page)){
    page=1;
  }
  var curPage = parseInt(page);
  var maxPage = Math.ceil(items.length / pageLength);
  curPage = Math.max(curPage, 1);
  curPage = Math.min(curPage, maxPage);
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
 * @param {*} firstTime Boolean should be true unless being called from itself (this adds the initial reactions to the response.)
 */
async function addListeners(authorId, response, page, itemList, title, itemEmbedFunction, firstTime = true){
  //var filterPrev = (reaction, user) => { return (reaction.emoji.name === '◀' && user.id === authorId) };
  //var filterNext = (reaction, user) => { return (reaction.emoji.name === '▶' && user.id === authorId) };

  
  var filterReactions = (reaction, user) => { return ( ['◀', '▶'].includes(reaction.emoji.name) && user.id === authorId) };
  if(firstTime){
    await response.react('◀');
    await response.react('▶');
  }
  
  let collector = response.createReactionCollector(filterReactions, {time: 15000});
  collector.on('collect', async (r1) =>{
    var minPage = 1;
    var maxPage = Math.ceil(itemList.length / config.pageLength);
    var nextPage = page;
    collector.stop();
    switch (r1.emoji.name) {
      case '◀':
        nextPage--;
        break;
      case '▶':
        nextPage++;
        break;
    };
    nextPage = Math.max(nextPage, minPage);
    nextPage = Math.min(nextPage, maxPage);

    var newMsg = createEmbedPage(nextPage, itemList, title, itemEmbedFunction)
    response.edit(newMsg);
    addListeners(authorId, response, nextPage, itemList, title, itemEmbedFunction, false);
  });
}