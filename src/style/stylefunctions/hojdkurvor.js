import { Style, Stroke, Text, Fill } from 'ol/style';

export default function hojdkurvorStyle() {
  let layers = null;
  
  async function loadStyle() {
    try {
      const response = await fetch('https://vectortileservices3.arcgis.com/5WHoNp62stHFcGAU/arcgis/rest/services/H%C3%B6jdkurvor/VectorTileServer/resources/styles/root.json');
      const styleJson = await response.json();
      layers = styleJson.layers;
    } catch (error) {
      console.error('Error fetching ArcGIS style:', error);
    }
  }

  loadStyle();

  return function styles(feature) {
    if (!layers) return null;
    
    const heightValue = feature.get('_name'); // attributnamn för etikett
    
    // Hitta rätt lager
    const lineLayer = layers.find(l => l.id === 'Höjdkurvor');
    const textLayer = layers.find(l => l.id === 'Höjdkurvor/label/Klass 1');

    if (lineLayer) {
      return new Style({
        stroke: new Stroke({
          color: lineLayer.paint?.['line-color'] || '#000000',
          width: lineLayer.paint?.['line-width']?.stops?.[0]?.[1] || 1,
        }),
        text: heightValue ? new Text({
          font: `${textLayer?.layout?.['text-size'] || 12}px ${textLayer?.layout?.['text-font']?.[0] || 'Arial'}`,
          fill: new Fill({ color: textLayer?.paint?.['text-color'] || '#000000' }),
          stroke: new Stroke({ color: '#ffffff', width: 2 }),
          text: heightValue.toString(),
          placement: 'line',
          maxAngle: Math.PI / 40,
          overflow: true,
          repeat: 1000 // För att repetera text längs linjen
        }) : null
      });
    }
    
    return null;
  };
}
