import defaultStyle from './stylefunctions/default';
import detaljplanStyle from './stylefunctions/detaljplan';

const customStyles = {
  default: defaultStyle,
  detaljplan: detaljplanStyle
};

export default function styleFunctions(customStyle, params) {
  if (customStyle in customStyles) {
    return customStyles[customStyle](params);
  }
  return customStyles.default(params);
}
