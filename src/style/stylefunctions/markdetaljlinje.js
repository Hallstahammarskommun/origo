import { Style, Stroke } from 'ol/style';

export default function markdetaljlinjeStyle() {
  let layers;
  let lineColor;
  let lineWidth;
  let lineDasharray;
  fetch('https://vectortileservices3.arcgis.com/5WHoNp62stHFcGAU/arcgis/rest/services/Prim%C3%A4rkarta_Markdetalj_linje_3010/VectorTileServer/resources/styles/root.json')
    .then(response => response.json())
    .then(styleJson => { layers = styleJson.layers; });
  return function styles(feature) {
    const featureSymbol = feature.get('_symbol');
    const layer = layers.find(l => l.filter[2] === featureSymbol);

    if (layer) {
      lineColor = layer.paint['line-color'];
      lineWidth = layer.paint['line-width'].default;
      lineDasharray = layer.paint['line-dasharray'];

      return new Style({
        stroke: new Stroke({
          color: lineColor,
          width: lineWidth,
          lineDash: lineDasharray
        })
      });
    }
    return null; // Return null if the condition is not met
  };
}
