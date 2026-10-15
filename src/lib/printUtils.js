/**
 * Print utility for the PPA XI Certificate of Appearance Generator.
 *
 * Two-phase approach to avoid popup blocking and React re-render interference:
 *
 *   1. openPrintWindowSync() — called synchronously from the user's click
 *      so the browser permits the popup.
 *
 *   2. populatePrintWindow(printWindow, sourceNode) — called from a useEffect
 *      after React has committed the print content to the DOM. Inlines all
 *      CSS rules synchronously, copies content, waits for images, then print().
 */

const PRINT_CSS = `
  @page { size: 8.5in 13in portrait; margin: 0; }
  @page summary-page { size: letter portrait; margin: 0; }
  html, body {
    background: #fff !important;
    margin: 0 !important;
    padding: 0 !important;
    display: block !important;
  }
  .no-print { display: none !important; }
  .print-sheet {
    position: static !important;
    left: 0 !important;
    top: 0 !important;
    width: 8.5in !important;
    margin: 0 !important;
    padding: 0 !important;
    z-index: auto !important;
  }
  .print-page {
    display: block !important;
    box-shadow: none !important;
    margin: 0 !important;
    padding: 0 !important;
    page-break-inside: auto !important;
    break-inside: auto !important;
    overflow: hidden !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .print-page + .print-page {
    page-break-before: always !important;
    break-before: page !important;
  }
  .cert-sheet {
    display: flex !important;
    flex-direction: column !important;
    box-shadow: none !important;
    overflow: hidden !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .cert-sheet * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .summary-print-sheet {
    page: summary-page;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
`;

/**
 * Inline all CSS rules from the parent document's stylesheets into <style>
 * tags. This is synchronous — unlike cloning <link> tags, which load
 * asynchronously and may not be ready when print() is called.
 *
 * Cross-origin stylesheets (where cssRules throws a SecurityError) fall
 * back to cloning the <link> node with an absolute href.
 */
function inlineStyles(targetDoc) {
  const frag = targetDoc.createDocumentFragment();

  for (const sheet of document.styleSheets) {
    try {
      const css = Array.from(sheet.cssRules).map(r => r.cssText).join('\n');
      if (css) {
        const style = targetDoc.createElement('style');
        style.textContent = css;
        frag.appendChild(style);
      }
    } catch {
      const node = sheet.ownerNode;
      if (node) {
        const clone = node.cloneNode(true);
        if (clone.tagName === 'LINK' && clone.getAttribute('href')) {
          clone.setAttribute('href', new URL(clone.getAttribute('href'), window.location.href).href);
        }
        frag.appendChild(clone);
      }
    }
  }

  const printStyle = targetDoc.createElement('style');
  printStyle.textContent = PRINT_CSS;
  frag.appendChild(printStyle);

  return frag;
}

function waitForImages(doc) {
  return new Promise((resolve) => {
    const images = Array.from(doc.images || []);
    const total = images.length;
    if (total === 0) return resolve();

    let loaded = 0;
    const check = () => {
      loaded++;
      if (loaded >= total) resolve();
    };

    images.forEach((img) => {
      if (img.complete && img.naturalWidth > 0) {
        check();
      } else {
        img.addEventListener('load', check, { once: true });
        img.addEventListener('error', check, { once: true });
      }
    });

    setTimeout(() => resolve(), 8000);
  });
}

export function openPrintWindowSync() {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return null;

  const doc = printWindow.document;
  doc.open();
  doc.write(
    '<!DOCTYPE html><html><head><meta charset="utf-8"></head>' +
    '<body style="display:flex;align-items:center;justify-content:center;' +
    'height:100vh;margin:0;font-family:system-ui,sans-serif;color:#64748b;">' +
    '<p>Preparing print document…</p></body></html>'
  );
  doc.close();

  return printWindow;
}

export function populatePrintWindow(printWindow, sourceNode) {
  if (!printWindow || printWindow.closed) {
    console.error('populatePrintWindow: print window is closed or missing');
    return;
  }
  if (!sourceNode) {
    console.error('populatePrintWindow: no source node provided');
    return;
  }

  const printPages = sourceNode.querySelectorAll('.print-page');
  const hasContent = printPages.length > 0 || sourceNode.textContent.trim().length > 0;
  if (!hasContent) {
    console.error('populatePrintWindow: source node has no print-page content');
    const doc = printWindow.document;
    doc.body.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100vh;' +
      'margin:0;font-family:system-ui,sans-serif;color:#dc2626;">' +
      '<p>Failed to load certificate content for printing. Please close this window and try again.</p></div>';
    return;
  }

  console.info('populatePrintWindow: found ' + printPages.length + ' print page(s)');

  const doc = printWindow.document;

  // Clear the head and body completely — including the body's inline style
  // attribute left over from the loading message. The loading message sets
  // body { display: flex; align-items: center; justify-content: center; }
  // which would lay out .print-page divs horizontally (side by side) and
  // clip them. Removing the style attribute restores default display: block.
  doc.head.innerHTML = '';
  doc.body.innerHTML = '';
  doc.body.removeAttribute('style');

  // Inline all CSS synchronously — no async <link> loading to wait for
  doc.head.appendChild(inlineStyles(doc));

  // Copy only the inner HTML (the .print-page divs) directly into <body>,
  // bypassing the .print-sheet wrapper whose cloned @media print CSS sets
  // position: fixed and pins content to the first page.
  doc.body.innerHTML = sourceNode.innerHTML;

  printWindow.focus();
  waitForImages(doc).then(() => {
    if (printWindow.closed) return;
    setTimeout(() => {
      if (!printWindow.closed) {
        printWindow.print();
      }
    }, 100);
  });
}
