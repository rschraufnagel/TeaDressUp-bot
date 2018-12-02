const ImageBuilder = require('./img/ImageBuilder');
const Embed = require('./message/Message');
const config = require('./config');
const GetDressUpItem = require('./db/getDressUpItems');
const Workspace = require('./img/ImageWorkspace');

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
      if(myWorkspace){
        switch (args[0].toLowerCase()) {
          case "close":
          case "clear":
            clearWorkspace(message);
            break;
          case "print":
            print(message, myWorkspace, args.slice(1));
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


                case "fliph":
                case "fliphorizontal":
                  flipHorizontal(message, myWorkspace, args.slice(1));
                  break;
                case "flipv":
                case "flipvertical":
                  flipVertical(message, myWorkspace, args.slice(1));
                  break;
          default:
            console.log("Args: "+ args);
            message.channel.send('Invalid Item Studio workspace command!');
        }
      }else{
        switch (args[0].toLowerCase()) {
          case "start":
            setupWorkspace(message, args.slice(1));
            break;
          default:
            console.log("Args: "+ args);
            message.channel.send('Invalid command with no workspace! Use the "start" command to begin.');
        }
      }
    }
  }else{
    Embed.printError(message, message.author.username + " doesn't have access to Item Studio command.");
  }
}

async function help(message){
  Embed.printMessage(message, "Help here.");
}
async function setupWorkspace(message, args){
  try{
    if(args.length==0){
      throw Error("Workspace requires an item id to start.");
    }
    let item = await GetDressUpItem.selectItemById(args[0]);
    let workspace = new Workspace(item);
    StudioUsers[message.author.id] = workspace;
    Embed.printMessage(message, message.author.username + "'s workspace has been created.");
    print(message, workspace);
  }catch(err){
    console.error('setupWorkspace Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
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



async function brighten(message, workspace, args){
  try{
    if(args.length==0 || isNaN(args[0]) || Math.abs(args[0])>100 || args[0]<0){
      throw Error("Command Syntax: \n brighten <number> \n <number>: [0 to 100]");
    }
    workspace.brightness = args[0];
    print(message, workspace);
  }catch(err){
    console.error('lighten Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}
async function lighten(message, workspace, args){
  try{
    if(args.length==0 || isNaN(args[0]) || args[0]>100 || args[0]<0){
      throw Error("Command Syntax: \n lighten <number> \n <number>: [0 to 100] where 100 always returns white. \n Note: this will remove Darkness");
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
    workspace.value = args[0];
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
    workspace.chroma = args[0];
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
    workspace.hue = args[0];
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
    let color = "rgb("+args[0]+","+args[1]+","+args[2]+")";
    workspace.mixColor = color;
    workspace.mixAmount = args[3];
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
    workspace.redShift = args[0];
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
    workspace.greenShift = args[0];
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
    workspace.blueShift = args[0];
    print(message, workspace);
  }catch(err){
    console.error('blueShift Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}


async function flipHorizontal(message, workspace, args){
  try{
    if(args.length==0 || !["1","yes","y","true","t","0","no","n","false","f"].includes(args[0].toLowerCase())){
      throw Error("Command Syntax: \n fliph <boolean> \n <boolean>: [yes/no, y/n, true/false, t/f, 1/0]");
    }
    if(['1','yes','y','true','t'].includes(args[0].toLowerCase())){
      workspace.flipHorizontal = 1;
    }else{
      workspace.flipHorizontal = 0;
    }
    print(message, workspace);
  }catch(err){
    console.error('flipHorizontal Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}
async function flipVertical(message, workspace, args){
  try{
    if(args.length==0 || !["1","yes","y","true","t","0","no","n","false","f"].includes(args[0].toLowerCase())){
      throw Error("Command Syntax: \n flipv <boolean> \n <boolean>: [yes/no, y/n, true/false, t/f, 1/0]");
    }
    if(['1','yes','y','true','t'].includes(args[0].toLowerCase())){
      workspace.flipVertical = 1;
    }else{
      workspace.flipVertical = 0;
    }
    print(message, workspace);
  }catch(err){
    console.error('flipVertical Error : ' + err + " - " + err.stack);
    Embed.printError(message, err.message?err.message:err);
  }
}


async function print(message, workspace){
  let buffer = await workspace.getPreviewBuffer();
  buffer = await ImageBuilder.sizeUpBuffer(buffer);
  let text = message.author.username + "'s workspace:" + JSON.stringify(workspace);
  Embed.printMessage(message, text, buffer);

}


async function testImage(message, args){
  let buffer1 = await ImageBuilder.getTestTintScale("hair_brown_ponytail_center-back.png");
  await Embed.printMessage(message, '', buffer1);  
}