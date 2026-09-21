const fs = require('fs');

global.document = {
  getElementById: (id) => {
    if (id === 'sectionAllVideos') return { insertBefore: () => {} };
    if (id === 'allVideosGrid') {
      const container = { 
        children: [], 
        appendChild: (el) => container.children.push(el),
        prepend: (el) => container.children.unshift(el),
        removeChild: (el) => {
           const i = container.children.indexOf(el);
           if (i > -1) container.children.splice(i, 1);
        },
        querySelectorAll: () => [],
        innerHTML: '' 
      };
      return container;
    }
    return null;
  },
  createElement: (tag) => ({ 
    tag, 
    style: {}, 
    children: [], 
    dataset: {}, 
    classList: { toggle: () => {} }, 
    appendChild: function(c) { this.children.push(c); },
    addEventListener: () => {}, 
    querySelector: () => ({ addEventListener: () => {}, style: {} }), 
    querySelectorAll: () => [] 
  }),
  createDocumentFragment: () => ({ children: [], appendChild: function(c) { this.children.push(c); } }),
};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.window = {};
global.IntersectionObserver = class { observe() {} disconnect() {} };

let code = fs.readFileSync('allVideos.js', 'utf8');
code = code.replace(/export /g, '');
try {
  eval(code);
  initAllVideosGrid().then(() => {
    console.log("SUCCESS");
  }).catch(e => console.error(e));
} catch(e) {
  console.error("SYNTAX ERROR:", e);
}
