const sharp = require('sharp');

module.exports = {
  getBuffer: getBuffer
}

/**
 * Create a new file given urls for component images.
 * @param {*} urls 
 * @returns {Promise} promise of a buffer for the composite image.
 */
function getBuffer(urls, multiplier=1){
  let initialImagePromise = sharp(urls[0]).toBuffer();

  let bufferMergePromise = urls.slice(1).reduce(function(imagePromise, component){
    return imagePromise.then(function(image){
      return sharp(image)
      .overlayWith(component, { gravity: sharp.gravity.southeast } )
      .toBuffer()
    })
  }, initialImagePromise)


  return bufferMergePromise.then(function(image){
    return sharp(image)
    .resize(192,192,{kernel: sharp.kernel.nearest})
    .toBuffer();
  });
}



