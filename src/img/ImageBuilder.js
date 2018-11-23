const sharp = require('sharp');
const fs = require('fs');
const request = require('request-promise-native');

module.exports = {
  getPreviewSequence : getPreviewSequence,
  downloadImage : downloadImage,
  getBuffer : getBuffer
}

function downloadImage(url, imageName, callbackFunction){
  request.head(url, function(err, response, body){
    request(url).pipe(fs.createWriteStream('./img/input/'+imageName)).on('close',callbackFunction);
  });
}

/**
 * Return an array of file names where the given body is inbetween back & foreground items
 */
function getPreviewSequence(previewBodyFileName, previewFileNames){
  let background = [];
  let foreground = [];
  let keyword_back = "back";
  for(let i=0; i<previewFileNames.length; i++){
    if(previewFileNames[i].includes(keyword_back)){
      background.push(previewFileNames[i]);
    }else{
      foreground.push(previewFileNames[i]);
    }
  }
  background.push(previewBodyFileName);
  return background.concat(foreground);
}

/**
 * Create a new file given fileNames for component images.
 * @param {*} fileNames 
 * @returns {Promise} promise of a buffer for the composite image.
 */
function getBuffer(fileNames, multiplier=1){
  let initialImagePromise = sharp('./img/input/'+fileNames[0]).toBuffer();

  let bufferMergePromise = fileNames.slice(1).reduce(function(imagePromise, component){
    return imagePromise.then(function(image){
      return sharp(image)
      .overlayWith('./img/input/'+component, { gravity: sharp.gravity.southeast } )
      .toBuffer()
    })
  }, initialImagePromise)


  return bufferMergePromise.then(function(image){
    return sharp(image)
    .resize(192,192,{kernel: sharp.kernel.nearest})
    .toBuffer();
  });
}



