import { el, icon } from '../ui.js';

export function accordionItem({ title, iconName, body, open=false }) {
  const item = el(`<div class="acc-item ${open?'open':''}">
    <button class="acc-head"><span class="acc-ico">${icon(iconName)}</span>${title}
      <span class="chev">${icon('chevron')}</span></button>
    <div class="acc-body"></div></div>`);
  item.querySelector('.acc-body').append(body);
  item.querySelector('.acc-head').onclick = () => item.classList.toggle('open');
  return item;
}
