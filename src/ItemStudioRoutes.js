const ImageBuilder = require('./img/ImageBuilder');
const Embed = require('./message/Message');
const config = require('./config');
const GetDressUpItem = require('./db/getDressUpItems');
const StudioWorkspace = require('./db/StudioWorkspace');
const Workspace = require('./img/ImageWorkspace');
const updateDressUpItem = require('./db/updateDressUpItem');

const StudioUsers = {};

/**
 * Routing all messages (Good Example image: 193)
 * @param {*} message 
 */
module.exports = async function (message, args) {
  if(config.admins[message.author.id]){
    if(args.length==0){
      help(message);
    }else{
      let myWorkspace = StudioUsers[message.author.id];
      if(!myWorkspace){
        myWorkspace = new Workspace();
        StudioUsers[message.author.id] = myWorkspace;
      }
      switch (args[0].toLowerCase()) {
        case "nc":
        case "newcolor":
          newColor(message, myWorkspace, args.slice(1));
          break;
        case "lc":
        case "loadcolor":
        case "loadcolors":
          loadColors(message, myWorkspace, args.slice(1));
          break;
        case "pc":
        case "printcolor":
        case "printcolors":
          printColors(message, myWorkspace, args.slice(1));
          break;
        case "pi":
        case "printitem":
        case "printitems":
          printItems(message, myWorkspace, args.slice(1));
          break;
        case "saveas":
          saveColorAs(message, myWorkspace, args.slice(1));
          break;
        case "close":
        case "clear":
            clearWorkspace(message, myWorkspace, args.slice(1));
            break;
        case "print":
          print(message, myWorkspace, args.slice(1));
          break;


        case "ai":
        case "additem":
          addItem(message, myWorkspace, args.slice(1));
          break;


        case "render":
          renderImages(message, myWorkspace, args.slice(1));
          break;


        case "brighten":
          brighten(message, myWorkspace, args.slice(1));
          break;


        case "lighten":
          lighten(message, myWorkspace, args.slice(1));
          break;
        case "darken":
          darken(message, myWorkspace, args.slice(1));
          break;
        case "value":
          value(message, myWorkspace, args.slice(1));
          break;


        case "saturate":
          saturate(message, myWorkspace, args.slice(1));
          break;
        case "desaturate":
          desaturate(message, myWorkspace, args.slice(1));
          break;
        case "greyscale":
          greyscale(message, myWorkspace, args.slice(1));
          break;
        case "chroma":
          chroma(message, myWorkspace, args.slice(1));
          break;

        case "spin":
        case "hue":
          hue(message, myWorkspace, args.slice(1));
          break;


        case "shade":
          shade(message, myWorkspace, args.slice(1));
          break;
        case "tint":
          tint(message, myWorkspace, args.slice(1));
          break;
        case "mix":
          mix(message, myWorkspace, args.slice(1));
          break;


        case "red":
          redShift(message, myWorkspace, args.slice(1));
          break;
        case "green":
          greenShift(message, myWorkspace, args.slice(1));
          break;
        case "blue":
          blueShift(message, myWorkspace, args.slice(1));
          break;

        default:
          console.log("Args: "+ args);
          message.channel.send('Invalid Item Studio workspace command!');
      }
    }
  }else{
    Embed.printError(message, message.author.username + " doesn't have access to Item Studio command.");
  }
}

async function help(message){
  Embed.printMessage(message, "Help here.");
}

async function clearWorkspace(message, args){
  try{
    delete StudioUsers[message.author.id];
    Embed.printMessage(message, message.author.username + "'s workspace has been deleted.");
  }catch(err){
    console.error('setupWorkspace Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}
async function newColor(message, workspace, args){
  workspace.addNewColor();
  Embed.printMessage(message, "A new Color has been added to " + message.author.username + "'s workspace at index 0.");
}
async function loadColors(message, workspace, args){
  try{
    if(args.length==0){
      throw Error("Command Syntax: \n loadcolor <number>... \n <number>: ids of previously saved colors");
    }
    let colors = await StudioWorkspace.selectColorsById(args);
    let foundIds = colors.map(color => color.ColorId);
    let colorsNotFound = args.filter(itemId => !foundIds.includes(parseInt(itemId)));
    if(colorsNotFound.length>0){
      Embed.printError(message, "Color(s) were not found for the following Ids: \n" + colorsNotFound.join(", "));
    }
    if(colors.length>0){
      workspace.addColors(colors);
      printColors(message, workspace);
    }
  }catch(err){
    console.error('loadColors Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}
async function printColors(message, workspace){
  try{
    Embed.printWorkspaceColors(message, workspace.colors, 1, message.author.username + "'s Workspace Colors");
  }catch(err){
    console.error('printColors Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}
async function printItems(message, workspace){
  try{
    Embed.printItems(message, workspace.items, 1, message.author.username + "'s Workspace Items");
  }catch(err){
    console.error('printItems Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}


async function saveColorAs(message, workspace, args){
  try{
    if(args.length==0 || args[0].length==0 || args[0].includes("_")){
      throw Error("Command Syntax: \n saveas <string> \n <string>: name of the color.  Name cannot contain underscores ('_') \n Note: Color index 0 is the only color which will be saved.");
    }
    workspace.colors[0].Name = args[0];
    let newColorId = await StudioWorkspace.insertColor(workspace.colors[0]);
    workspace.colors[0].ColorId = newColorId;
    Embed.printMessage(message, message.author.username + "'s workspace color has been saved to index " + newColorId);
  }catch(err){
    console.error('saveColorAs Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}



async function addItem(message, workspace, args){
  try{
    if(args.length==0){
      throw Error("Command Syntax: \n additem <number>... \n <number>: ids of items to use in the  saved colors");
    }
    let items = await GetDressUpItem.selectItemsById(args);
    let foundIds = items.map(item => item.ItemId);
    let itemsNotFound = args.filter(itemId => !foundIds.includes(parseInt(itemId)));
    if(itemsNotFound.length>0){
      Embed.printError(message, "Items(s) were not found for the following Ids: \n" + itemsNotFound.join(", "));
    }
    if(items.length>0){
      workspace.addItems(items);
      printItems(message, workspace);
    }
  }catch(err){
    console.error('addItem Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}



async function renderImages(message, workspace, args){
  try{
    if(workspace.items.length==0 || workspace.colors.length==0){
      throw Error("Command: \n render can only be called when there is at least 1 item and 1 color.");
    }

    let fileNames = workspace.items.map(item => {
      let fileNameSplit = item.FileName.split("_");
      if(fileNameSplit.length!=3 && fileNameSplit.length!=4 ){
        throw Error(item.FileName + " does not follow the standard file name logic of category_color_tags.png or category_color_tags_descriptor.png");
      }
      let x = {
         prefix: fileNameSplit[0]+ "_"
        ,suffix: "_"+fileNameSplit.slice(2, fileNameSplit.length).join("_")
        ,baseRarity: item.Rarity
        ,baseValue: item.Value
      }
      return x;
    });

    let unsavedColors = workspace.colors.filter(color => color.Name=="" || color.Name==undefined);
    if(unsavedColors.length>0){
      throw Error("Workspace cannot render images with unsaved Colors");
    }


    for(let colorIdx = 0; colorIdx<workspace.colors.length; colorIdx++){
      let newColorName = workspace.colors[colorIdx].Name
      for(let itemIdx = 0; itemIdx<workspace.items.length; itemIdx++){
        let fileName = fileNames[itemIdx].prefix + newColorName + fileNames[itemIdx].suffix;
        let buffer = await workspace.getItemColorBuffer(itemIdx, colorIdx);
        await ImageBuilder.saveFile(fileName, buffer);

        let itemName = fileName.substring(0, fileName.lastIndexOf("."));
        
        let item = GetDressUpItem.selectItemByFileName(fileName);
        if(!item){
          //TODO: automate rarity and value
          let index = await updateDressUpItem.addItem(itemName, 0, fileName, "");
          item = await GetDressUpItem.selectItemById(index);
        }
        
        //TODO: Refactor into separate process.
        let imageNames = ImageBuilder.getPreviewSequence([item.FileName]);
        let buffer1 = await ImageBuilder.getBuffer(imageNames);
        let previewMessage = await Embed.printMessage(message, '', buffer1);
        
        let attachmentFile = previewMessage.attachments.first();
        let url = attachmentFile.url;
        await updateDressUpItem.setItemPreviewURL(item.ItemId, url);
        Embed.printMessage(message, 'Image loaded to id ' + index);
      }
    }
  }catch(err){
    console.error('renderImages Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}









async function brighten(message, workspace, args){
  try{
    if(args.length==0 || isNaN(args[0]) || Math.abs(args[0])>100 || args[0]<0){
      throw Error("Command Syntax: \n brighten <number> \n <number>: [0 to 100]");
    }
    if(workspace.colors.length==0){
      throw Error("No colors are added to the current workspace.");
    }
    workspace.colors[0].Brightness = args[0];
    print(message, workspace);
  }catch(err){
    console.error('brighten Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}
async function lighten(message, workspace, args){
  try{
    if(args.length==0 || isNaN(args[0]) || args[0]>100 || args[0]<0){
      throw Error("Command Syntax: \n lighten <number> \n <number>: [0 to 100] where 100 always returns white. \n Note: this will remove Darkness");
    }
    if(workspace.colors.length==0){
      throw Error("No colors are added to the current workspace.");
    }
    let newargs = [];
    newargs.push(args[0]);
    await value(message, workspace, newargs);
  }catch(err){
    console.error('lighten Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}
async function darken(message, workspace, args){
  try{
    if(args.length==0 || isNaN(args[0]) || args[0]>100 || args[0]<0){
      throw Error("Command Syntax: \n darken <number> \n <number>: [0 to 100] where 100 always returns black. \n Note: this will remove Lightness");
    }
    if(workspace.colors.length==0){
      throw Error("No colors are added to the current workspace.");
    }
    let newargs = [];
    newargs.push(args[0]*-1);
    await value(message, workspace, newargs);
  }catch(err){
    console.error('darken Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}
async function value(message, workspace, args){
  try{
    if(args.length==0 || isNaN(args[0]) || Math.abs(args[0])>100){
      throw Error("Command Syntax: \n value <number> \n <number>: [-100 to 100] where 100 always returns white and -100 returns black.");
    }
    if(workspace.colors.length==0){
      throw Error("No colors are added to the current workspace.");
    }
    workspace.colors[0].Value = args[0];
    print(message, workspace);
  }catch(err){
    console.error('value Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}


async function saturate(message, workspace, args){
  try{
    if(args.length==0 || isNaN(args[0]) || args[0]>100 || args[0]<0){
      throw Error("Command Syntax: \n saturate <number> \n <number>: [0 to 100] \n Note: this will remove desaturation & greyscale");
    }
    if(workspace.colors.length==0){
      throw Error("No colors are added to the current workspace.");
    }
    let newargs = [];
    newargs.push(args[0]);
    await chroma(message, workspace, newargs);
  }catch(err){
    console.error('saturate Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}
async function desaturate(message, workspace, args){
  try{
    if(args.length==0 || isNaN(args[0]) || args[0]>100 || args[0]<0){
      throw Error("Command Syntax: \n desaturate <number> \n <number>: [0 to 100] \n Note: this will remove saturation & greyscale (value of 100 is equivalent to greyscale)");
    }
    if(workspace.colors.length==0){
      throw Error("No colors are added to the current workspace.");
    }
    let newargs = [];
    newargs.push(args[0]*-1);
    await chroma(message, workspace, newargs);
  }catch(err){
    console.error('saturate Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}
async function greyscale(message, workspace, args){
  try{
    if(args.length==0 || !["1","yes","y","true","t","0","no","n","false","f"].includes(args[0].toLowerCase())){
      throw Error("Command Syntax: \n greyscale <boolean> \n <boolean>: [yes/no, y/n, true/false, t/f, 1/0] \n Note: greyscale is equivalent to desaturation 100. Turning this on/off will reset all other saturation settings.");
    }
    if(workspace.colors.length==0){
      throw Error("No colors are added to the current workspace.");
    }
    let newargs = [];
    if(['1','yes','y','true','t'].includes(args[0].toLowerCase())){
      newargs.push(-100);
    }else{
      newargs.push(0);
    }
    await chroma(message, workspace, newargs);
  }catch(err){
    console.error('saturate Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}
async function chroma(message, workspace, args){
  try{
    if(args.length==0 || isNaN(args[0]) || Math.abs(args[0])>100){
      throw Error("Command Syntax: \n chroma <number> \n <number>: [-100 to 100] where + is saturation and - is desaturation. \n Note: see also saturate, desaturate, greyscale");
    }
    if(workspace.colors.length==0){
      throw Error("No colors are added to the current workspace.");
    }
    workspace.colors[0].Chroma = args[0];
    print(message, workspace);
  }catch(err){
    console.error('chroma Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}


async function hue(message, workspace, args){
  try{
    if(args.length==0 || isNaN(args[0]) || Math.abs(args[0])>360){
      throw Error("Command Syntax: \n hue <number> \n <number>: [-360 to 360] spins the colors \n Note: 0, -360, and 360 set back to the original hue");
    }
    if(workspace.colors.length==0){
      throw Error("No colors are added to the current workspace.");
    }
    workspace.colors[0].Hue = args[0];
    print(message, workspace);
  }catch(err){
    console.error('hue Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}



async function shade(message, workspace, args){
  try{
    if(args.length==0 || isNaN(args[0]) || args[0]>100 || args[0]<0){
      throw Error("Command Syntax: \n shade <number> \n <number>: [0 to 100] opacity to apply black shade \n Note: this will remove mix & tint.");
    }
    if(workspace.colors.length==0){
      throw Error("No colors are added to the current workspace.");
    }
    let newargs = [0,0,0, args[0]];
    await mix(message, workspace, newargs);
  }catch(err){
    console.error('shade Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}
async function tint(message, workspace, args){
  try{
    if(args.length==0 || isNaN(args[0]) || args[0]>100 || args[0]<0){
      throw Error("Command Syntax: \n tint <number> \n <number>: [0 to 100] opacity to apply white tint \n Note: this will remove mix & shade.");
    }
    if(workspace.colors.length==0){
      throw Error("No colors are added to the current workspace.");
    }
    let newargs = [255,255,255, args[0]];
    await mix(message, workspace, newargs);
  }catch(err){
    console.error('tint Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}
async function mix(message, workspace, args){
  try{
    if(args.length<4){
      throw Error("Command Syntax: \n mix <number> <number> <number> <number> \n<number>: [0 to 255] red \n<number>: [0 to 255] green \n<number>: [0 to 255] blue \n <number>: [0 to 100] opacity to overlay color (0 turns off mix) \n Note: see also tint, shade");
    }
    if(workspace.colors.length==0){
      throw Error("No colors are added to the current workspace.");
    }
    let color = "rgb("+args[0]+","+args[1]+","+args[2]+")";
    workspace.colors[0].MixColor = color;
    workspace.colors[0].MixAmount = args[3];
    print(message, workspace);
  }catch(err){
    console.error('mix Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}

async function redShift(message, workspace, args){
  try{
    if(args.length<1 || Math.abs(args[0])>255){
      throw Error("Command Syntax: \n red <number> \n<number>: [-255 to 255] add or subtract this value from red within the image.");
    }
    if(workspace.colors.length==0){
      throw Error("No colors are added to the current workspace.");
    }
    workspace.colors[0].RedShift = args[0];
    print(message, workspace);
  }catch(err){
    console.error('redShift Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}
async function greenShift(message, workspace, args){
  try{
    if(args.length<1 || Math.abs(args[0])>255){
      throw Error("Command Syntax: \n green <number> \n<number>: [-255 to 255] add or subtract this value from green within the image.");
    }
    if(workspace.colors.length==0){
      throw Error("No colors are added to the current workspace.");
    }
    workspace.colors[0].GreenShift = args[0];
    print(message, workspace);
  }catch(err){
    console.error('greenShift Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}
async function blueShift(message, workspace, args){
  try{
    if(args.length<1 || Math.abs(args[0])>255){
      throw Error("Command Syntax: \n blue <number> \n<number>: [-255 to 255] add or subtract this value from blue within the image.");
    }
    if(workspace.colors.length==0){
      throw Error("No colors are added to the current workspace.");
    }
    workspace.colors[0].BlueShift = args[0];
    print(message, workspace);
  }catch(err){
    console.error('blueShift Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}


async function print(message, workspace){
  let buffer = await workspace.getItemColorBuffer();
  buffer = await ImageBuilder.sizeUpBuffer(buffer);
  let text = message.author.username + "'s workspace:" + JSON.stringify(workspace);
  Embed.printMessage(message, text, buffer);

}


async function testImage(message, args){
  let buffer1 = await ImageBuilder.getTestTintScale("hair_brown_ponytail_center-back.png");
  await Embed.printMessage(message, '', buffer1);  
}