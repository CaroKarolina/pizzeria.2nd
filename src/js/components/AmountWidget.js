import { select } from '../settings.js';
import { settings } from '../settings.js';

class AmountWidget {
  constructor(element, value) {
    const thisWidget = this;
    thisWidget.getElement(element);
    thisWidget.setValue(value || thisWidget.input.value);
    thisWidget.initActions();
  }
    
  getElement(element) {
    const thisWidget = this;
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }
    
  setValue(value) {
    const thisWidget = this;
    const newValue = parseInt(value);
    if (thisWidget.value !== newValue
            && !isNaN(newValue)
            && newValue >= parseInt(settings.amountWidget.defaultMin)
            && newValue <= parseInt(settings.amountWidget.defaultMax)) {
      thisWidget.value = newValue;
    }
    thisWidget.announce();
    thisWidget.input.value = thisWidget.value;
  }
    
  initActions() {
    const thisWidget = this;
    thisWidget.input.addEventListener('change', function() {
      thisWidget.setValue(thisWidget.value);
    });
    thisWidget.linkDecrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.linkIncrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
    
  announce() {
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles: true,
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;