const sharp = require('sharp');
const fs = require('fs');
const request = require('request-promise-native');


module.exports = {
  downloadImage : downloadImage,
  getBuffer : getBuffer
}

function downloadImage(fileName, imageName, callbackFunction){
  request.head(fileName, function(err, response, body){
    console.log('content-type:', response.headers['content-type']);
    console.log('content-length:', response.headers['content-length']);

    request(fileName).pipe(fs.createWriteStream('./img/input/'+imageName)).on('close',callbackFunction);
  });
  console.log("Done Outer");
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



