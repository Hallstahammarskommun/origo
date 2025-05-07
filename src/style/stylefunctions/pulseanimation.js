import Style from 'ol/style/Style';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

export default function pulseAnimationStyle() {
  const pulseStart = performance.now(); // Start time for animation
  let animationId;

  const getColorForValue = (value) => {
    if (value === 'green') {
      return [31, 196, 45]; // Green
    } else if (value === 'orange') {
      return [247, 145, 2]; // Orange
    } else if (value === 'red') {
      return [255, 0, 0]; // Red
    }
    return [128, 128, 128]; // Default gray for values outside the specified ranges
  };

  const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

  const animatePulse = (feature) => {
    if (feature && typeof feature.changed === 'function') {
      feature.changed(); // Trigger re-rendering of the feature
    }

    animationId = requestAnimationFrame(() => animatePulse(feature));
  };

  return function styles(feature) {
    if (!animationId) {
      animatePulse(feature);
    }

    const value = feature.get('value');
    const [r, g, b] = getColorForValue(value);

    // Create multiple style layers for a staggered, continuous pulse effect
    const style = [];
    const numPulses = 4;

    // Calculate current pulse phase based on time
    const currentTime = performance.now();
    const elapsed = (currentTime - pulseStart) / 1000; // Time elapsed in seconds
    const basePhase = (elapsed / 2) % 1; // Slower pulse cycle (2 seconds)

    for (let i = 0; i < numPulses; i += 1) {
      const phase = (basePhase + i / numPulses) % 1;
      const easePhase = easeInOutQuad(phase);

      const radius = 0 + easePhase * 15; // Base radius of 5 and max expansion of 15
      const opacityStroke = 0.8 - easePhase * 0.8; // Max opacity of 0.8 and gradual fade-out

      style.push(
        new Style({
          image: new Circle({
            radius,
            stroke: new Stroke({
              color: `rgba(${r}, ${g}, ${b}, ${opacityStroke})`,
              width: 3
            })
          })
        })
      );
    }

    // Add a static center point
    style.push(
      new Style({
        image: new Circle({
          radius: 5,
          fill: new Fill({
            color: `rgba(${r}, ${g}, ${b}, 1)` // Adjust opacity for the center fill
          })
        })
      })
    );

    return style;
  };
}
