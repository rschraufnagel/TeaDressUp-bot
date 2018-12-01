

const config = require('../config');
const Sharp = require('sharp');
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
function getPreviewSequence(previewFileNames){
  let background = [];
  let foreground = [];
  let regex_Back = /.*_[^_]*back[^_]*/;
  for(let i=0; i<previewFileNames.length; i++){
    let result = previewFileNames[i].match(regex_Back);
    if(result && previewFileNames[i] == result[0]){
      background.push(previewFileNames[i]);
    }else{
      foreground.push(previewFileNames[i]);
    }
  }
  background.push(config.previewBodyFileName);
  return background.concat(foreground);
}

/**
 * Create a new file given fileNames for component images.
 * @param {*} fileNames 
 * @returns {Promise} promise of a buffer for the composite image.
 */
function getBuffer(fileNames, multiplier=1){
  let initialImagePromise = Sharp('./img/input/'+fileNames[0]).toBuffer();

  let bufferMergePromise = fileNames.slice(1).reduce(function(imagePromise, component){
    return imagePromise.then(function(image){
      return Sharp(image)
      .overlayWith('./img/input/'+component, { gravity: Sharp.gravity.southeast } )
      .toBuffer()
    })
  }, initialImagePromise)


  return bufferMergePromise.then(function(image){
    return Sharp(image)
    .resize(192,192,{kernel: Sharp.kernel.nearest})
    .toBuffer();
  });
}



