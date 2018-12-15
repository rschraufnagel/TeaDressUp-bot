const Jimp = require('jimp');
const ImageBuilder = require('./ImageBuilder');
module.exports = class Workspace {
  constructor(item) {
    this.colors = [];
    this.items = [];
    

    this.template = item;
    this.WorkspaceId = null;
  }

  addItems(newItems){
    //Prevent Duplicate with existing Items
    let existingItemIds = this.items.map(item => item.ItemId);
    newItems = newItems.filter(newItem => !existingItemIds.includes(newItem.ItemId));

    this.items = this.items.concat(newItems);
  }
  addColors(newColors){
    //TODO: Validate each of these newColors is valid?
    this.colors = this.colors.concat(newColors);
  }
  addNewColor(){
    //TODO: Validate each of these newColors is valid?
    this.colors.unshift(
      {
        Name:''
        ,Hue:0
        ,Value:0
        ,Chroma:0
        ,MixColor:''
        ,MixAmount:0
        ,RedShift:0
        ,GreenShift:0
        ,BlueShift:0
      }
    );
  }

  async getItemColorBuffer(itemIndex = 0, colorIndex = 0){
    if(this.items.length<=itemIndex){
      throw Error("Workspace doesn't have item at index " + itemIndex);
    }
    if(this.colors.length<=colorIndex){
      throw Error("Workspace doesn't have color at index " + colorIndex);
    }
    let previewItem = this.items[itemIndex];
    let previewColor = this.colors[colorIndex];
    let buffer = await Jimp.read(ImageBuilder.getFilePath(previewItem.FileName))
      .then(image => {
        let colorUpdates = [];
        
        //Change the Color
        if(previewColor.RedShift!=0){
          colorUpdates.push({apply: 'red', params: [parseInt(previewColor.RedShift)]});
        }
        if(previewColor.GreenShift!=0){
          colorUpdates.push({apply: 'green', params: [parseInt(previewColor.GreenShift)]});
        }
        if(previewColor.BlueShift!=0){
          colorUpdates.push({apply: 'blue', params: [parseInt(previewColor.BlueShift)]});
        }
        if(previewColor.MixColor!='' && previewColor.MixAmount>0){
          colorUpdates.push({apply: 'mix', params: [previewColor.MixColor, previewColor.MixAmount]});
        }


        

        //Brightness
        if(previewColor.Brightness>0){
          colorUpdates.push({apply: 'brighten', params: [previewColor.Brightness]});
        }
        //Value
        if(previewColor.Value>0){
          colorUpdates.push({apply: 'lighten', params: [previewColor.Value]});
        }else if(previewColor.Value<0){
          colorUpdates.push({apply: 'darken', params: [Math.abs(previewColor.Value)]});
        }
        //Chroma
        if(previewColor.Chroma>0){
          colorUpdates.push({apply: 'saturate', params: [previewColor.Chroma]});
        }else if(previewColor.Chroma<0){
          colorUpdates.push({apply: 'desaturate', params: [Math.abs(previewColor.Chroma)]});
        }
        //Hue
        if(previewColor.Hue!=0){
          colorUpdates.push({apply: 'spin', params: [parseInt(previewColor.Hue)]});
        }


       if(colorUpdates.length>0){
         image.color(colorUpdates);
       }
        return image.getBufferAsync(Jimp.MIME_PNG);
      });
    return buffer;
  }
}