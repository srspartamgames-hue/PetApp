export function celebrate() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cores = ['#19B888', '#FFC34D', '#FF7A59', '#5DD6AE', '#378ADD'];
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:60;overflow:hidden';
  for (let i = 0; i < 80; i++) {
    const p = document.createElement('div');
    const s = 6 + Math.random() * 6;
    p.style.cssText = `position:absolute;top:-12px;left:${Math.random() * 100}%;width:${s}px;height:${s}px;`
      + `background:${cores[i % cores.length]};border-radius:2px;opacity:.9;`
      + `transform:rotate(${Math.random() * 360}deg);`
      + `animation:confetti-fall ${1.2 + Math.random() * 1.2}s ${Math.random() * 0.3}s ease-in forwards`;
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2800);
}
