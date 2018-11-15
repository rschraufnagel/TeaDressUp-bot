const Discord = require("discord.js")
    , fs = require('fs')    
    , config = require("./config")
    , DressUpRouter = require("./src/DressUpRoutes")
    , client = new Discord.Client()
    ;

client.on("ready", () => {
  console.log("I am ready!");
});

client.on("message", (message) => {

  var msg = message.content
     ,pf = config.prefix;
  if (!msg.startsWith(pf) || message.author.bot) return;
  msg = msg.slice(pf.length );
  DressUpRouter(message, msg);
});

client.login(config.token);
