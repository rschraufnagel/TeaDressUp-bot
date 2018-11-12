const sharp = require('sharp');

module.exports = {
  getBuffer: getBuffer
}

/**
 * Create a new file given urls for component images.
 * @param {*} urls 
 * @returns {Promise} promise of a buffer for the composite image.
 */
function getBuffer(urls){
  let initial = sharp(urls[0]).toBuffer();
  return urls.slice(1).reduce(function(imagePromise, component){
    return imagePromise.then(function(image){
      return sharp(image)
      .overlayWith(component, { gravity: sharp.gravity.southeast } )
      .toBuffer()
    })
  }, initial);
}



