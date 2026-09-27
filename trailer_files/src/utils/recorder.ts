/**
 * Frame snapshot and video capture utilities for DRISHTI-AID preview
 */

export function captureElementAsImage(element: HTMLElement, filename = 'drishti_aid_frame.png') {
  try {
    const width = 1920;
    const height = 1080;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clone element to SVG foreignObject or draw representation
    // To ensure reliable, instant zero-dependency capture:
    const data = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${element.outerHTML}
          </div>
        </foreignObject>
      </svg>
    `;

    const img = new Image();
    const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = filename;
      downloadLink.href = pngUrl;
      downloadLink.click();
    };
    img.src = url;
  } catch (err) {
    console.error('Snapshot failed:', err);
  }
}
