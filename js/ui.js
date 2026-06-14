import { icon } from './icons.js';

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
export function toast(msg) {
  const t = el(`<div class="toast">${msg}</div>`);
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 250); }, 1800);
}
export function confirmDialog(msg, { ok='Excluir', danger=true } = {}) {
  return new Promise(resolve => {
    const scrim = el(`<div class="scrim"><div class="sheet">
      <p style="margin-top:0">${msg}</p>
      <div class="form-actions">
        <button class="btn block" data-no>Cancelar</button>
        <button class="btn block ${danger?'':'primary'}" data-yes
          ${danger?'style="background:var(--late);border-color:var(--late);color:#fff"':''}>${ok}</button>
      </div></div></div>`);
    scrim.querySelector('[data-no]').onclick = () => { scrim.remove(); resolve(false); };
    scrim.querySelector('[data-yes]').onclick = () => { scrim.remove(); resolve(true); };
    scrim.onclick = e => { if (e.target === scrim) { scrim.remove(); resolve(false); } };
    document.body.appendChild(scrim);
  });
}

/* fieldForm: monta um <form> a partir de uma spec de campos.
   spec: [{ name, label, type, options?, required?, placeholder? }]
   type ∈ text|textarea|date|number|select|tel|email|photo
   Retorna { form, getValues() }  */
export function fieldForm(spec, values = {}) {
  const form = el('<form></form>');
  for (const f of spec) {
    const v = values[f.name] ?? '';
    const field = el(`<div class="field"><label>${f.label}${f.required?' *':''}</label></div>`);
    let input;
    if (f.type === 'textarea') input = el(`<textarea name="${f.name}" placeholder="${f.placeholder||''}">${v}</textarea>`);
    else if (f.type === 'select') input = el(`<select name="${f.name}">${
        ['<option value="">—</option>', ...f.options.map(o =>
          `<option value="${o}" ${o===v?'selected':''}>${o}</option>`)].join('')}</select>`);
    else if (f.type === 'photo') {
      input = el(`<div></div>`);
      const img = el(`<img alt="" style="${v?'':'display:none'};max-width:96px;border-radius:var(--r-md);margin-bottom:8px" src="${v||''}">`);
      const file = el(`<input type="file" accept="image/*" name="${f.name}">`);
      const hidden = el(`<input type="hidden" name="${f.name}" value="${v||''}">`);
      file.onchange = async () => {
        const file0 = file.files[0]; if (!file0) return;
        const data = await readImageResized(file0);
        hidden.value = data; img.src = data; img.style.display = '';
      };
      input.append(img, file, hidden);
    }
    else input = el(`<input type="${f.type||'text'}" name="${f.name}" value="${v}" placeholder="${f.placeholder||''}" ${f.required?'required':''}>`);
    field.appendChild(input);
    form.appendChild(field);
  }
  return {
    form,
    getValues() {
      const out = {};
      for (const f of spec) {
        const node = form.querySelector(`[name="${f.name}"]${f.type==='photo'?'[type=hidden]':''}`);
        out[f.name] = node ? node.value : '';
      }
      return out;
    }
  };
}

/* Redimensiona imagem para no máx 800px e devolve dataURL JPEG (economia de espaço) */
export function readImageResized(file, max = 800) {
  return new Promise(resolve => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = img.width * scale; c.height = img.height * scale;
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}
export { icon };
