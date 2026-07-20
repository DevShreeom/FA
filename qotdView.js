// qotdView.js - Renders the dedicated QOTD library page with search and categories.

import { QOTD } from './qotd.js';

// We map raw youtube tags to clean sections
const CATEGORY_MAP = {
  "Calculus": ["calculus", "integration", "derivative", "limit", "area", "differential", "function", "continuity", "maxima", "minima", "aod"],
  "Algebra": ["algebra", "quadratic", "sequence", "series", "complex", "binomial", "matrix", "matrices", "determinant", "polynomial"],
  "Geometry & Conics": ["geometry", "circle", "parabola", "ellipse", "hyperbola", "straight line", "locus", "coordinate"],
  "Trigonometry": ["trigonometry", "inverse", "trig", "itf"],
  "Probability & PnC": ["probability", "permutation", "combination", "pnc"],
  "Vectors & 3D": ["vector", "3d"]
};

function categorize(tags) {
  const tagStr = tags.join(' ').toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(kw => tagStr.includes(kw))) return cat;
  }
  return "Mixed / Advanced Concepts"; 
}

export function loadQotdView() {
  const container = document.getElementById('qotdContainer');
  const searchInput = document.getElementById('qotdSearch');

  // 1. Group videos into categories
  const grouped = {};
  QOTD.forEach(vid => {
    const cat = categorize(vid.tags);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(vid);
  });

  // 2. Render function (supports filtering)
  function render(query = '') {
    container.innerHTML = '';
    const q = query.toLowerCase();
    let totalFound = 0;

    Object.keys(grouped).sort().forEach(cat => {
      // Filter videos in this category by title or their original tags
      const filteredVids = grouped[cat].filter(v => 
        v.title.toLowerCase().includes(q) || 
        v.tags.some(t => t.toLowerCase().includes(q))
      );

      if (filteredVids.length === 0) return;
      totalFound += filteredVids.length;

      // Build the UI for this category
      const catCard = document.createElement('div');
      catCard.className = 'chapter-card open'; // using your existing CSS classes
      catCard.innerHTML = `<h3 class="ch-title">${cat} <span class="ch-meta">${filteredVids.length} videos</span></h3>`;
      
      const vidList = document.createElement('div');
      vidList.className = 'vid-list';
      
      filteredVids.forEach(v => {
        vidList.innerHTML += `
          <a href="${v.url}" target="_blank" class="vid-row" style="text-decoration:none; color:inherit; display:flex; align-items:center;">
            <div class="vid-status" style="margin-right:10px;">🎯</div>
            <div class="vid-title">${v.title}</div>
            <div class="vid-meta">${v.duration}</div>
          </a>
        `;
      });

      catCard.appendChild(vidList);
      container.appendChild(catCard);
    });

    if (totalFound === 0) {
      container.innerHTML = '<div class="empty-note">No questions found matching your search. Try different keywords.</div>';
    }
  }

  // 3. Initial render and wire up search
  render();
  searchInput.addEventListener('input', (e) => render(e.target.value));
}