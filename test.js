const fs = require('fs');
// stub document and localStorage
global.document = {
  getElementById: (id) => {
    if (id === 'sectionAllVideos') return { insertBefore: () => {} };
    if (id === 'allVideosGrid') return { appendChild: () => {}, prepend: () => {}, innerHTML: '', removeChild: () => {} };
    return null;
  },
  createElement: () => ({ style: {}, classList: { toggle: () => {} }, appendChild: () => {}, addEventListener: () => {}, querySelector: () => null, querySelectorAll: () => [] }),
  createDocumentFragment: () => ({ appendChild: () => {}, children: [] }),
};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.window = {};
global.IntersectionObserver = class { observe() {} disconnect() {} };

let code = fs.readFileSync('allVideos.js', 'utf8');
code = code.replace(/export /g, '');
eval(code);
console.log('parsed ok');
initAllVideosGrid().then(() => console.log('ran init ok')).catch(e => console.error('Error:', e));
