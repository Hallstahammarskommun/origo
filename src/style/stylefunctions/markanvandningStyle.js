import Fill from 'ol/style/Fill';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';

export default function markandvandningStyle() {
  return function styles(feature) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;
    const maxSize = 20;
    let canvasWidth = maxSize;
    let canvasHeight = maxSize;
    let fillColor;
    let strokeColor = 'rgba(0, 0, 0, 0)';
    let dotColor;
    let lineDashValue = 0;

    //  fillCreator
    const fillCreator = function fc() {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      context.fillStyle = fillColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
    };
    // dotCreator
    const dotCreator = function dc() {
      context.fillStyle = dotColor;
      context.beginPath();
      context.arc(4 * pixelRatio, 4 * pixelRatio, 1 * pixelRatio, 0, 2 * Math.PI);
      context.fill();
    };
    //  stripedLineCreator
    const stipedLineCreator = function slc() {
      context.strokeStyle = strokeColor;
      const strypePositions = [maxSize * -1, 0, maxSize];
      for (let i = 0; i < strypePositions.length; i += 1) {
        const startPos = strypePositions[i];
        context.beginPath();
        context.moveTo(startPos, 0);
        context.lineWidth = 3;
        context.lineCap = 'square';
        context.lineTo(maxSize + startPos, maxSize);
        context.stroke();
      }
    };
    // Markanvändning
    const markanvandning = (function ma() {
      if (feature.get('layer') === 'verksamheterIndustri' && feature.get('markanvandning') === 'Utvecklingsområden') {
        fillColor = 'rgba(199, 199, 199, 0.5)';
        strokeColor = 'rgba(0, 0, 0, 0.3)';
        lineDashValue = [10, 10];
        fillCreator();
        stipedLineCreator();
      } else if (feature.get('layer') === 'verksamheterIndustri' && feature.get('markanvandning') === 'Befintliga verksamhetsområden') {
        fillColor = 'rgba(162, 162, 162, 0.5)';
        fillCreator();
      } else if (feature.get('layer') === 'verksamheterIndustri' && feature.get('markanvandning') === null) {
        fillColor = 'rgba(237, 76, 132, 0.5)';
        fillCreator();
      } else if (feature.get('layer') === 'gronomradePark') {
        fillColor = 'rgba(177, 210, 146, 0.85)';
        dotColor = 'rgb(56, 140, 73)';
        canvasWidth = 8 * pixelRatio;
        canvasHeight = 8 * pixelRatio;
        fillCreator();
        dotCreator();
      }
      return context.createPattern(canvas, 'repeat');
    }());

    // Generate style
    const style = new Style({
      fill: new Fill({
        color: markanvandning
      }),
      stroke: new Stroke({
        color: strokeColor,
        lineDash: lineDashValue,
        width: 3
      })
    });
    return style;
  };
}
