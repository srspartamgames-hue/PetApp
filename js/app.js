import { iconSprite, icon } from './icons.js';
import { renderSwitcher } from './components/petSwitcher.js';
import * as inicio from './views/inicio.js';
import * as saude from './views/saude.js';
import * as rotina from './views/rotina.js';
import * as alertas from './views/alertas.js';
import * as pet from './views/pet.js';
import * as tutor from './views/tutor.js';

const routes = { inicio, saude, rotina, alertas, pet, tutor };
const NAV = {
  inicio:{icon:'home',label:'Início'}, saude:{icon:'health',label:'Saúde'},
  rotina:{icon:'list',label:'Rotina'}, alertas:{icon:'bell',label:'Alertas'}
};
const outlet = document.getElementById('app');

function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const [path, ...params] = h.split('/');
  return { path: path || 'inicio', params };
}
function paintNav() {
  document.querySelectorAll('#nav a').forEach(a => {
    const p = a.dataset.path;
    a.innerHTML = `${icon(NAV[p].icon)}<span>${NAV[p].label}</span>`;
  });
}
function setActive(path) {
  document.querySelectorAll('#nav a').forEach(a =>
    a.classList.toggle('active', a.dataset.path === path));
}
async function render() {
  const { path, params } = parseHash();
  const view = routes[path] || routes.inicio;
  outlet.innerHTML = '';
  await view.render(outlet, params);
  setActive(path);
  await renderSwitcher();
  window.scrollTo(0, 0);
}
function init() {
  document.getElementById('sprite').innerHTML = iconSprite();
  paintNav();
  render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
}
window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', init);
