import { select, templates } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.element = element; // czy to zapisywać czy nie ? 
    thisBooking.render(element);
    thisBooking.initWidgets();
    console.log('instace of Class Booking', thisBooking);
  }

  render() {
    const thisBooking = this;
    const generatedHtml = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = thisBooking.element;
    thisBooking.dom.wrapper.innerHTML = generatedHtml;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
  }

  initWidgets() {
    const thisBooking = this;
    thisBooking.amountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}

export default Booking;