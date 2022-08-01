import { select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;
    thisCartProduct.menuProduct = menuProduct;
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = parseInt(menuProduct.amount);
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amountWidget = menuProduct.amountWidget;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.getElement(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
  }
  getElement(element) {
    const thisCartProduct = this;
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
  }
  initAmountWidget() {
    const thisCartProduct = this;
    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget, thisCartProduct.amount);
    thisCartProduct.dom.amountWidget.addEventListener('click', function() {
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }
  remove() {
    const thisCartProduct = this;
    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      }
    });
    console.log('kliknięto guzik usuwania');
    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }
  initActions() {
    const thisCartProduct = this;
    thisCartProduct.dom.edit.addEventListener('click', function(event) {
      event.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', function(event) {
      event.preventDefault();
      thisCartProduct.remove();
    });
  }
  getData () {
    const thisCartProduct = this;
    const productsOrder = {      
      id: (thisCartProduct.id),
      amount: (thisCartProduct.amount),
      price: (thisCartProduct.price),
      priceSingle: (thisCartProduct.priceSingle),
      name: (thisCartProduct.name),
      params: {} // tutaj nie wiem :< 
    };
    return productsOrder;
  }
}

export default CartProduct;