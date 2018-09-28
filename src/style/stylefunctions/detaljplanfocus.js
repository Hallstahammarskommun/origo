var ol = require('openlayers');

module.exports = function detaljplanFocusStyle(params) {
  return function (feature, resolution) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var pixelRatio = ol.has.DEVICE_PIXEL_RATIO;
    var fill;
    var style;

    // Generate a canvasPattern with two circles on white background
    var prickmark = (function () {
      canvas.width = 8 * pixelRatio;
      canvas.height = 8 * pixelRatio;
      context.fillStyle = 'rgb(0, 0, 0)';
      context.beginPath();
      context.arc(4 * pixelRatio, 4 * pixelRatio, 1 * pixelRatio, 0, 2 * Math.PI);
      context.fill();
      return context.createPattern(canvas, 'repeat');
    }());

    var korsmark = (function () {
      canvas.width = 20 * pixelRatio;
      canvas.height = 20 * pixelRatio;
      context.fillStyle = 'rgb(0, 0, 0)';
      context.beginPath();
      context.moveTo(0, 4 * pixelRatio);
      context.lineTo(8 * pixelRatio, 4 * pixelRatio);
      context.moveTo(4 * pixelRatio, 0);
      context.lineTo(4 * pixelRatio, 8 * pixelRatio);
      context.stroke();
      return context.createPattern(canvas, 'repeat');
    }());

    var regexPrick = new RegExp(/Prickmark/);
    var regexPlus = new RegExp(/Korsmark/);

    if (regexPrick.test(feature.get('code'))) {
      fill = new ol.style.Fill({
        color: prickmark
      });
      style = new ol.style.Style({
        fill: fill
      });
      return style;
    } else if (regexPlus.test(feature.get('code'))) {
      fill = new ol.style.Fill({
        color: korsmark
      });
      style = new ol.style.Style({
        fill: fill
      });
      return style;
    }
    style = new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(0,0,0,0)'
      })
    });
    return style;
  };
};
