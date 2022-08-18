import { templates, classNames, select } from '../settings.js';

class Home {
  constructor(element) {
    const thisHome = this;
    thisHome.render(element);
    thisHome.initLink();
  }

  render(element) {
    const thisHome = this;

    const generatedHtml = templates.homePage();

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHtml;
  }

  initLink() {
    const thisHome = this;

    thisHome.pages = document.querySelector(select.containerOf.pages).children;
    thisHome.navLinks = document.querySelectorAll(select.nav.links); // to samo co w app
    thisHome.homeLinks = document.querySelectorAll(select.nav.homeLinks);

    for (let link of thisHome.homeLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();
        const id = clickedElement.getAttribute('href');

        thisHome.activatePage(id);

        window.location.hash = '#/' + id;
      });
    }
  }

  activatePage(pageId) {
    const thisHome = this;

    for (let page of thisHome.pages) {
      page.classList.toggle(classNames.pages.active, page.id === pageId);
    }

    for (let link of thisHome.navLinks) {
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') === `#${pageId}`);
    }
  }
}

export default Home;