import { classNames, select, settings, templates } from '../settings.js';
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
    thisBooking.chosedTable = null; //info o wybranym stoliku
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
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
    ]).then(function(allResponses) {
      const bookingsResponse = allResponses[0];
      const eventsCurrentResponse = allResponses[1];
      const eventsRepeatResponse = allResponses[2];
      return Promise.all([
        bookingsResponse.json(),
        eventsCurrentResponse.json(),
        eventsRepeatResponse.json(),
      ]);
    }).then(function([bookings, eventsCurrent, eventsRepeat]) {
      thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
    });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) { //obiekt zawierający inforamcje o zajętych stolikach
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate; // dane poza pętlą są stałe
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if( typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) { //pętla for z ITERATOREM
      if( typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  clearAllActiveTables() {
    const thisBooking = this;

    for (let table of thisBooking.dom.tables) {
      if (table.classList.contains(classNames.booking.tableSelected))
        table.classList.remove(classNames.booking.tableSelected);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value; //bieżąca data z datePickera
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    console.log(thisBooking.chosedTable);
    thisBooking.chosedTable = null;
    thisBooking.clearAllActiveTables();
    console.log(thisBooking.chosedTable);

    let allAvailable = false; // wszystkie stoliki są dostępne = fałsz
    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  initTables(clickedElement) {
    const thisBooking = this;
    const dataTable = clickedElement.getAttribute('data-table');
    if (dataTable !== null) {
      if(clickedElement.classList.contains(classNames.booking.tableBooked)) {
        alert('Wybrany stolik jest już zajęty, proszę, wybierz inny :)');
      } else {
        thisBooking.chosedTable = dataTable;
        thisBooking.clearAllActiveTables();
        // for (let table of thisBooking.dom.tables) {
        //   if (table.classList.contains(classNames.booking.tableSelected))
        //     table.classList.remove(classNames.booking.tableSelected);
        // }
        clickedElement.classList.add(classNames.booking.tableSelected);
        console.log(clickedElement);
      }
    }
  }

  render() {
    const thisBooking = this;
    const generatedHtml = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = thisBooking.element; // czy poprostu element?
    thisBooking.dom.wrapper.innerHTML = generatedHtml;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.floorPlan = thisBooking.dom.wrapper.querySelector(select.booking.floorPlan);
    thisBooking.dom.starters = document.querySelectorAll(select.booking.starters);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
  }

  sendBooking() {
    const thisBooking = this;

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: parseInt(thisBooking.chosedTable),
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };
    for (let starter of thisBooking.dom.starters) {
      if (starter.checked) {
        payload.starters.push(starter.value);
      }
    }
    const url = settings.db.url + '/' + settings.db.booking;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);
  }

  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

    thisBooking.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });

    thisBooking.dom.floorPlan.addEventListener('click', function(evt){
      evt.preventDefault();
      const clickedElement = evt.target;
      thisBooking.initTables(clickedElement);
    });

    thisBooking.dom.wrapper.addEventListener('submit', function(evt) {
      evt.preventDefault();
      thisBooking.sendBooking();
    });
  }
}

export default Booking;