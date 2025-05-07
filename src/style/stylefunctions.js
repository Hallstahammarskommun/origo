import defaultStyle from './stylefunctions/default';
import detaljplanStyle from './stylefunctions/detaljplan';
import hojdkurvorStyle from './stylefunctions/hojdkurvor';
import primarkartanStyle from './stylefunctions/primarkartan';
import pulseAnimationStyle from './stylefunctions/pulseanimation';

const customStyles = {
  default: defaultStyle,
  detaljplan: detaljplanStyle,
  hojdkurvor: hojdkurvorStyle,
  primarkartan: primarkartanStyle,
  pulseanimation: pulseAnimationStyle
};

export default function styleFunctions(customStyle, params) {
  if (customStyle in customStyles) {
    return customStyles[customStyle](params);
  }
  return customStyles.default(params);
}
