const fs = require('fs');
let code = fs.readFileSync('src/components/MapContainer.tsx', 'utf8');
code = code.replace(/maxZoom: 19,\s*zIndex: 10/g, "maxZoom: 19,\n          pane: 'weatherPane'");
code = code.replace(/opacity: 0.6,/g, 'opacity: 1.0,'); // Make rain more visible
code = code.replace(/opacity: 0.5,/g, 'opacity: 0.8,'); // Make wind more visible
fs.writeFileSync('src/components/MapContainer.tsx', code);
