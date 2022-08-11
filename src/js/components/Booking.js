import { select, settings, templates } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.element = element; // czy to zapisywać czy nie ? 
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData() { // pobiera dane z API używając andpointów z parametrami filtrującymi wyniki
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam
      ]
    };

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    }; // obiekt przechowujący endpointy API

    Promise.all ([
      fetch(urls.booking),
      // fetch(urls.eventsCurrent),
      // fetch(urls.eventsRepeat)
    ]).then(function(allResponses) {
      const bookingsResponse = allResponses[0];
      // const eventsCurrentResponse = allResponses[1];
      // const eventsRepeatResponse = allResponses[2];
      return Promise.all([
        bookingsResponse.json(),
        // eventsCurrentResoponse.json(),
        // eventsRepeatResponse.json(),
      ]);
    }).then(function([bookings, eventsCurrent, eventsRepeat]) {
      console.log(bookings);
      console.log(eventsCurrent);
      console.log(eventsRepeat);
    });
  }

  render() {
    const thisBooking = this;
    const generatedHtml = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = thisBooking.element; // czy poprostu element?
    thisBooking.dom.wrapper.innerHTML = generatedHtml;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
  }

  initWidgets() {
    const thisBooking = this;
    thisBooking.amountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new HourPicker(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
  }
}

export default Booking;