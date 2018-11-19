export default function createForm(object) {
  const id = object.elId.slice(1);
  const obj = object || {};
  const cls = obj.cls || '';
  const label = obj.title || '';
  const val = obj.isVisible ? obj.val : '';
  const type = obj.type || '';
  const maxLength = obj.maxLength ? ` maxlength="${obj.maxLength} "` : '';
  const dropdownOptions = obj.options || [];
  let el;
  let checked;
  let firstOption;
  let i;
  switch (type) {
    case 'text':
      el = `<div><label>${label}</label><br><input type="text" id="${id}" value="${val}${maxLength}></div>`;
      break;
    case 'textarea':
      el = `<div><label>${label}</label><br><textarea id="${id}"${maxLength}rows="3">${val}</textarea></div>`;
      break;
    case 'checkbox':
      checked = val ? ' checked' : '';
      el = `<div class="o-form-checkbox"><label>${label}</label><input type="checkbox" id="${id}" value="${val}"${checked}></div>`;
      break;
    case 'dropdown':
      if (val) {
        firstOption = `<option value="${val}" selected>${val}</option>'`;
      } else {
        firstOption = '<option value="" selected>Välj</option>';
      }
      el = `<div class="${cls}"><label>${label}</label><br><select id=${id}>${firstOption}`;
      for (i = 0; i < dropdownOptions.length; i += 1) {
        el += `<option value="${dropdownOptions[i]}">${dropdownOptions[i]}</option>`;
      }
      el += '</select></div>';
      break;
    default:
      console.log('Formcreator default case');
      break;
  }
  return el;
}
