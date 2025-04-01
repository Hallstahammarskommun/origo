import { Style, Stroke } from 'ol/style';

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

  return function styles() {
    if (!layers) return null;
    // Hitta rätt lager
    const lineLayer = layers.find(l => l.id === 'Höjdkurvor');

    if (lineLayer) {
      return new Style({
        stroke: new Stroke({
          color: lineLayer.paint?.['line-color'] || '#000000',
          width: lineLayer.paint?.['line-width']?.stops?.[0]?.[1] || 1
        })
      });
    }
    return null;
  };
}
