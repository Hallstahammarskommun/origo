import defaultStyle from './stylefunctions/default';
import detaljplanStyle from './stylefunctions/detaljplan';
import markdetaljlinjeStyle from './stylefunctions/markdetaljlinje';

const customStyles = {
  default: defaultStyle,
  detaljplan: detaljplanStyle,
  markdetaljlinje: markdetaljlinjeStyle
};

export default function styleFunctions(customStyle, params) {
  if (customStyle in customStyles) {
    return customStyles[customStyle](params);
  }
  return customStyles.default(params);
}
