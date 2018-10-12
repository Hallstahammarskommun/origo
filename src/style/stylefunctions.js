import defaultStyle from './stylefunctions/default';
import detaljplanStyle from './stylefunctions/detaljplan';
import detaljplanFocusStyle from './stylefunctions/detaljplanfocus';

const customStyles = {
  default: defaultStyle,
  detaljplan: detaljplanStyle,
  detaljplanFocus: detaljplanFocusStyle
};

export default function styleFunctions(customStyle, params) {
  if (customStyle in customStyles) {
    return customStyles[customStyle](params);
  }
  return customStyles.default(params);
}
