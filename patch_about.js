const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const modalStart = content.indexOf('<!-- ==================== ABOUT MODAL ==================== -->');
const modalEnd = content.indexOf('</body>');

let newContent = content.substring(0, modalStart) + content.substring(modalEnd);

const footerStart = newContent.indexOf('<!-- ==================== FOOTER ==================== -->');

const sectionAbout = `
    <!-- ==================== ABOUT & LEGAL ==================== -->
    <section id="sectionAbout" class="content-section" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 40px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent); margin-bottom: 16px;"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M2 15h10"/><path d="M6 12v6"/></svg>
        <h2 style="font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--text); margin: 0;">Factorial Academy</h2>
        <div style="font-size: 1rem; color: var(--muted); margin-top: 8px;">Connect &amp; Legal Portal</div>
      </div>

      <div style="background: var(--panel); border: 1px solid var(--border); border-radius: 24px; padding: 24px; margin-bottom: 24px;">
        <div style="font-family: var(--font-display); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; letter-spacing: 0.05em;">Lead Architect &amp; Developer</div>
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, var(--pyq), var(--accent)); color: #000; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.5rem; font-family: var(--font-display);">S</div>
          <div>
            <div style="font-weight: 700; color: var(--text); font-size: 1.2rem;">Shree</div>
            <div style="font-size: 0.9rem; color: var(--muted); margin-top: 4px;">Platform Architecture, Database, &amp; Creator of the Interface</div>
          </div>
        </div>
      </div>

      <div style="background: var(--panel); border: 1px solid var(--border); border-radius: 24px; padding: 24px; margin-bottom: 24px;">
        <div style="font-family: var(--font-display); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; letter-spacing: 0.05em;">Terms &amp; Disclosures</div>
        <p style="margin: 0; font-size: 0.9rem; color: var(--muted); line-height: 1.6;">
          Independent tracker — not affiliated with Google or any exam body.<br>
          Video data provided via YouTube API integrations.<br>
          Typefaces: Sora, Inter, JetBrains Mono (SIL Open Font Licence 1.1).
        </p>
      </div>
      
      <div style="text-align: center; font-size: 0.85rem; color: var(--muted); padding-top: 24px; border-top: 1px solid var(--border); margin-bottom: 40px;">
        With acknowledgment to <strong>suryansh1807</strong> strictly for early UI inspiration features.
      </div>
    </section>

`;

newContent = newContent.substring(0, footerStart) + sectionAbout + newContent.substring(footerStart);

fs.writeFileSync('index.html', newContent);
