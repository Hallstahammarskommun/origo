import Fill from 'ol/style/Fill';
import Style from 'ol/style/Style';

export default function detaljplanStyle() {
  return function styles(feature) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;
    let fill;
    let style;

    // Generate a canvasPattern with two circles on white background
    const prickmark = (function pm() {
      canvas.width = 8 * pixelRatio;
      canvas.height = 8 * pixelRatio;
      context.fillStyle = 'rgb(0, 0, 0)';
      context.beginPath();
      context.arc(4 * pixelRatio, 4 * pixelRatio, 1 * pixelRatio, 0, 2 * Math.PI);
      context.fill();
      return context.createPattern(canvas, 'repeat');
    }());

    const korsmark = (function km() {
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

    const regexPrick = new RegExp(/Prickmark/);
    const regexPlus = new RegExp(/Korsmark/);

    if (regexPrick.test(feature.get('egenkapsbestammelsetyper'))) {
      fill = new Fill({
        color: prickmark
      });
      style = new Style({
        fill
      });
      return style;
    } else if (regexPlus.test(feature.get('egenkapsbestammelsetyper'))) {
      fill = new Fill({
        color: korsmark
      });
      style = new Style({
        fill
      });
      return style;
    }
    style = new Style({
      fill: new Fill({
        color: 'rgba(0,0,0,0)'
      })
    });
    return style;
  };
}
