import { Style, Stroke, Fill, Circle } from 'ol/style';

export default function primarkartanStyle() {
  let layers;
  let fillColor;
  let lineColor;
  let lineWidth;
  let lineDasharray;
  const radius = 4;
  fetch('https://vectortileservices3.arcgis.com/5WHoNp62stHFcGAU/arcgis/rest/services/Primärkarta_3010/VectorTileServer/resources/styles/root.json')
    .then(response => response.json())
    .then(styleJson => { layers = styleJson.layers; });
  return function styles(feature) {
    const featureSymbol = feature.get('_symbol');
    const layerName = feature.get('layer');
    const markdetaljLinjeLayers = layers.filter(layer => layer['source-layer'] === 'Markdetalj_linje');
    const byggnadslinjeLayers = layers.filter(layer => layer['source-layer'] === 'Byggnadslinje');
    const polygonLayers = layers.filter(layer => layer.type === 'line' && (layer['source-layer'] === 'Byggnad' || layer['source-layer'] === 'Markdetalj_yta'));
    const pointLayers = layers.filter(layer => layer.type === 'symbol' && layer['source-layer'] === 'Markdetalj_punkt');
    // Markdetalj_linje
    const markdetaljLinjeLayer = markdetaljLinjeLayers.find(l => l.filter[2] === featureSymbol && l['source-layer'] === layerName);
    if (markdetaljLinjeLayer) {
      lineColor = markdetaljLinjeLayer.paint['line-color'];
      lineWidth = markdetaljLinjeLayer.paint['line-width'].default;
      lineDasharray = markdetaljLinjeLayer.paint['line-dasharray'];

      return new Style({
        stroke: new Stroke({
          color: lineColor,
          width: lineWidth,
          lineDash: lineDasharray
        })
      });
    }
    // Byggnadslinje
    const byggnadslinjeLayer = byggnadslinjeLayers.find(l => l['source-layer'] === layerName);
    if (byggnadslinjeLayer) {
      lineColor = byggnadslinjeLayer.paint['line-color'];
      lineWidth = byggnadslinjeLayer.paint['line-width'].default;
      lineDasharray = byggnadslinjeLayer.paint['line-dasharray'];

      return new Style({
        stroke: new Stroke({
          color: lineColor,
          width: lineWidth,
          lineDash: lineDasharray
        })
      });
    }
    // Byggnad + Markdetalj_yta
    const polygonLayer = polygonLayers.find(l => l.filter[2] === featureSymbol && l['source-layer'] === layerName);
    if (polygonLayer) {
      lineColor = polygonLayer.paint['line-color'];
      lineWidth = polygonLayer.paint['line-width'].default;
      lineDasharray = polygonLayer.paint['line-dasharray'];
      fillColor = 'rgba(239,239,239,0.25)';

      return new Style({
        fill: new Fill({
          color: fillColor
        }),
        stroke: new Stroke({
          color: lineColor,
          width: lineWidth,
          lineDash: lineDasharray
        })
      });
    }
    // Markdetalj_punkt
    const pointLayer = pointLayers.find(l => l.filter[2] === featureSymbol && l['source-layer'] === layerName);
    if (pointLayer) {
      fillColor = pointLayer.paint['icon-color'];
      lineColor = 'rgba(255, 255, 255, 0.8)';
      lineWidth = '1';

      return new Style({
        image: new Circle({
          radius,
          fill: new Fill({
            color: fillColor
          }),
          stroke: new Stroke({
            color: lineColor,
            width: lineWidth
          })
        })
      });
    }
    return null;
  };
}
