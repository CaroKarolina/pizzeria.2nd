/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

// const { active } = require("browser-sync");

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;      
      thisProduct.renderInMenu();
      thisProduct.getElement();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.processOrder();
    }
    renderInMenu() {
      const generatedHtml = templates.menuProduct(this.data);
      this.element = utils.createDOMFromHTML(generatedHtml);
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(this.element);
    }
    getElement() {
      const thisProduct = this;
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    }
    initAccordion() {
      const thisProduct = this;
      this.accordionTrigger.addEventListener('click', function(event) {
        event.preventDefault();
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        if (activeProduct !== null && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }
    initOrderForm() {
      const thisProduct = this;
      this.form.addEventListener('submit', function(event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function() {
          thisProduct.processOrder();
        });
      }
      this.cartButton.addEventListener('click', function(event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
    }
    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log(formData);
      let price = thisProduct.data.price;
      console.log(price);
      for (let paramId in thisProduct.data.params) {
        const param = this.data.params[paramId];
        console.log(param);
        for (let optionId in param.options) {
          const option = param.options[optionId];
          // const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          // console.log(optionSelected);
          if (!option.default && formData[paramId] && formData[paramId].includes(optionId)) {
            price += option.price;
            console.log(price);
          }
          if (option.default && formData[paramId] && !formData[paramId].includes(optionId)) {
            price -= option.price;
            console.log(price);
          }
        }
      }
      thisProduct.priceElem.innerHTML = price;
    }
  }

  const app = {
    initData: function() {
      const thisApp = this;
      thisApp.data = dataSource;
    },
    initMenu: function() {
      const thisApp = this;
      for (const productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    init: function(){
      console.log('*** App starting ***');
      console.log('thisApp:', this);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      this.initData();
      this.initMenu();
    },
  };

  app.init();
} 

