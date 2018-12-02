const Jimp = require('jimp');
const ImageBuilder = require('./ImageBuilder');
module.exports = class Workspace {
  constructor(item) {
    this.template = item;
    this.WorkspaceId = null;
    this.Hue = 0;
    this.Value = 0;
    this.Chroma = 0;
    this.MixColor = '';
    this.MixAmount = 0;
    this.RedShift = 0;
    this.GreenShift = 0;
    this.BlueShift = 0;
    this.FlipHorizontal = 0;
    this.FlipVertical = 0;
  }

  async getPreviewBuffer(){
    let ref = this;
    let buffer = await Jimp.read(ImageBuilder.getFilePath(ref.template.FileName))
      .then(image => {
        if(ref.flipHorizontal || ref.flipVertical){
          let horizontal = ref.flipHorizontal ? true : false;
          let vertical = ref.flipVertical ? true : false;
          image.flip(horizontal, vertical);
        }


        let colorUpdates = [];

        
        //Change the Color
        if(ref.RedShift!=0){
          colorUpdates.push({apply: 'red', params: [parseInt(ref.RedShift)]});
        }
        if(ref.GreenShift!=0){
          colorUpdates.push({apply: 'green', params: [parseInt(ref.GreenShift)]});
        }
        if(ref.BlueShift!=0){
          colorUpdates.push({apply: 'blue', params: [parseInt(ref.BlueShift)]});
        }
        if(ref.MixColor!='' && ref.MixAmount>0){
          colorUpdates.push({apply: 'mix', params: [ref.MixColor, ref.MixAmount]});
        }

        //Value
        if(ref.Value>0){
          colorUpdates.push({apply: 'lighten', params: [ref.Value]});
        }else if(ref.Value<0){
          colorUpdates.push({apply: 'darken', params: [Math.abs(ref.Value)]});
        }
        //Chroma
        if(ref.Chroma>0){
          colorUpdates.push({apply: 'saturate', params: [ref.Chroma]});
        }else if(ref.Chroma<0){
          colorUpdates.push({apply: 'desaturate', params: [Math.abs(ref.Chroma)]});
        }
        //Hue
        if(ref.Hue!=0){
          colorUpdates.push({apply: 'spin', params: [parseInt(ref.Hue)]});
        }


       if(colorUpdates.length>0){
         image.color(colorUpdates);
       }
        return image.getBufferAsync(Jimp.MIME_PNG);
      });
    return buffer;
  }
}