const Jimp = require('jimp');
const ImageBuilder = require('./ImageBuilder');
module.exports = class Workspace {
  constructor(item) {
    this.template = item;
    this.hue = 0;
    this.value = 0;
    this.chroma = 0;
    this.mixColor = '';
    this.mixAmount = 0;
    this.redShift = 0;
    this.greenShift = 0;
    this.blueShift = 0;
    this.flipHorizontal = 0;
    this.flipVertical = 0;
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
        if(ref.redShift!=0){
          colorUpdates.push({apply: 'red', params: [parseInt(ref.redShift)]});
        }
        if(ref.greenShift!=0){
          colorUpdates.push({apply: 'green', params: [parseInt(ref.greenShift)]});
        }
        if(ref.blueShift!=0){
          colorUpdates.push({apply: 'blue', params: [parseInt(ref.blueShift)]});
        }
        if(ref.mixColor!='' && ref.mixAmount>0){
          colorUpdates.push({apply: 'mix', params: [ref.mixColor, ref.mixAmount]});
        }

        //Value
        if(ref.value>0){
          colorUpdates.push({apply: 'lighten', params: [ref.value]});
        }else if(ref.value<0){
          colorUpdates.push({apply: 'darken', params: [Math.abs(ref.value)]});
        }
        //Chroma
        if(ref.chroma>0){
          colorUpdates.push({apply: 'saturate', params: [ref.chroma]});
        }else if(ref.chroma<0){
          colorUpdates.push({apply: 'desaturate', params: [Math.abs(ref.chroma)]});
        }
        //Hue
        if(ref.hue!=0){
          colorUpdates.push({apply: 'spin', params: [parseInt(ref.hue)]});
        }


       if(colorUpdates.length>0){
         image.color(colorUpdates);
       }
        console.log("Buffering 2");
        return image.getBufferAsync(Jimp.MIME_PNG);
      });
    console.log("Buffering 3");
    return buffer;
  }
}