/* ---------- AquaSense dashboard logic ---------- */

// Exact fish silhouette from uploaded Icon_ikan_suhu.svg (viewBox 1413 x 880).
var FISH_PATH =
  "M 766.0,8.7 C 757.4,9.0 740.3,9.9 698.0,12.6 C 685.1,13.4 651.1,14.5 622.5,15.0 C 562.8,16.1 544.5,17.2 510.5,22.1 C 424.6,34.4 364.1,64.8 324.6,115.4 C 317.1,125.0 302.9,146.5 301.0,151.0 C 299.9,153.6 297.6,155.2 287.1,160.5 C 261.5,173.3 238.2,190.8 214.5,215.1 C 197.9,232.1 190.2,241.5 177.5,260.5 C 161.0,285.2 147.9,309.1 130.0,346.9 C 116.6,375.4 107.9,392.6 101.5,403.5 C 89.3,424.3 71.6,443.0 48.8,459.3 C 20.3,479.7 14.0,487.3 14.0,501.5 C 14.1,507.1 14.7,509.8 17.0,515.0 C 18.5,518.5 19.6,521.9 19.2,522.5 C 18.9,523.0 16.9,526.1 14.9,529.2 C 10.3,536.5 7.5,546.2 8.4,552.3 C 9.3,558.4 14.0,565.3 19.3,568.4 C 25.7,572.2 33.6,573.7 61.5,576.5 C 89.9,579.3 104.9,582.1 123.2,588.0 C 152.1,597.2 181.5,612.1 217.0,635.4 C 241.1,651.3 261.3,666.6 316.5,711.0 C 367.2,751.8 400.1,770.6 442.0,783.1 C 470.1,791.4 509.1,796.7 556.0,798.5 C 580.5,799.4 597.4,800.9 608.4,803.0 C 616.4,804.6 662.3,816.7 704.6,828.5 C 721.7,833.3 730.0,835.6 757.5,843.4 C 838.3,866.3 858.0,870.5 889.5,871.7 C 924.2,872.9 948.0,867.9 978.5,853.0 C 1020.3,832.5 1058.1,796.7 1078.8,758.0 C 1101.8,714.9 1107.3,671.3 1096.5,617.5 C 1094.6,608.1 1091.4,594.8 1089.4,587.7 C 1087.4,580.7 1086.0,574.7 1086.3,574.4 C 1087.2,573.5 1098.6,579.8 1110.3,587.6 C 1132.6,602.7 1142.8,611.7 1186.5,654.4 C 1241.3,707.9 1259.3,723.1 1281.5,734.3 C 1299.7,743.4 1310.4,743.1 1324.6,733.1 C 1343.9,719.6 1360.5,691.5 1366.6,662.0 C 1368.9,651.2 1369.1,624.6 1367.1,596.5 C 1365.4,572.2 1366.1,549.3 1368.9,536.5 C 1371.3,525.0 1376.9,509.0 1385.8,487.5 C 1400.3,452.4 1404.4,436.6 1404.4,415.0 C 1404.5,372.2 1384.8,339.6 1356.0,334.9 C 1343.0,332.8 1327.2,336.5 1287.0,351.2 C 1218.6,376.1 1185.0,386.0 1139.0,394.4 C 1124.2,397.1 1110.4,399.0 1105.3,399.0 C 1102.3,399.0 1101.8,398.5 1099.2,393.2 C 1094.3,383.6 1086.4,363.2 1082.7,350.9 C 1078.3,336.7 1075.2,320.6 1066.0,266.5 C 1053.1,190.4 1045.2,160.5 1028.6,125.7 C 1016.8,100.9 1005.4,84.2 989.1,68.0 C 953.3,32.3 896.7,13.8 809.5,9.0 C 791.5,8.1 786.5,8.0 766.0,8.7";

/* ---------- Simulated sensor data ---------- */
var temp = 28;
var ph = 7.0;
var volume = 90;

/* ---------- Helpers ---------- */
function hexToRgb(hex) {
  var h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function mix(a, b, f) {
  var pa = hexToRgb(a);
  var pb = hexToRgb(b);
  var r = Math.round(pa[0] + (pb[0] - pa[0]) * f);
  var g = Math.round(pa[1] + (pb[1] - pa[1]) * f);
  var bl = Math.round(pa[2] + (pb[2] - pa[2]) * f);
  return "rgb(" + r + ", " + g + ", " + bl + ")";
}

// Temperature -> color across stops 28,30,32,35,40
function tempColor(t) {
  var stops = [
    [28, "#0b3d91"],
    [30, "#18c6e6"],
    [32, "#22b573"],
    [35, "#f59e0b"],
    [40, "#ef4444"],
  ];
  if (t <= stops[0][0]) return stops[0][1];
  if (t >= stops[stops.length - 1][0]) return stops[stops.length - 1][1];
  for (var i = 0; i < stops.length - 1; i++) {
    var t1 = stops[i][0], c1 = stops[i][1];
    var t2 = stops[i + 1][0], c2 = stops[i + 1][1];
    if (t >= t1 && t <= t2) {
      return mix(c1, c2, (t - t1) / (t2 - t1));
    }
  }
  return stops[0][1];
}

// pH category
function phInfo(p) {
  if (p < 4) return { color: "#ef4444", label: "ASAM KUAT" };
  if (p < 6) return { color: "#f59e0b", label: "ASAM" };
  if (p < 6.8) return { color: "#facc15", label: "MENDEKATI NETRAL" };
  if (p <= 7.4) return { color: "#22b573", label: "NETRAL" };
  if (p <= 9) return { color: "#3aa0ff", label: "BASA" };
  return { color: "#8b5cf6", label: "BASA KUAT" };
}

/* ---------- Fish gauge (SVG) ---------- */
function buildFish(fill, color) {
  var top = 8;
  var bottom = 872;
  var waterY = bottom - fill * (bottom - top);
  return (
    '<svg class="aq-fish" viewBox="0 0 1413 880" role="img" aria-label="Indikator suhu berbentuk ikan">' +
    "<defs>" +
    '<clipPath id="fishBody"><path d="' + FISH_PATH + '" /></clipPath>' +
    '<linearGradient id="fishWater" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="' + color + '" stop-opacity="0.82" />' +
    '<stop offset="100%" stop-color="' + color + '" stop-opacity="1" />' +
    "</linearGradient>" +
    "</defs>" +
    '<path d="' + FISH_PATH + '" fill="#f0f6fd" />' +
    '<g clip-path="url(#fishBody)">' +
    '<rect class="aq-fish-fill" x="0" y="' + waterY + '" width="1413" height="880" fill="url(#fishWater)" />' +
    '<path class="aq-fish-wave" d="M-200 ' + waterY +
    " q 120 -34 240 0 t 240 0 t 240 0 t 240 0 t 240 0 t 240 0 V880 H-200 Z\" fill=\"" + color + '" opacity="0.35" />' +
    '<path class="aq-fish-wave aq-fish-wave-2" d="M-200 ' + waterY +
    " q 150 28 300 0 t 300 0 t 300 0 t 300 0 t 300 0 V880 H-200 Z\" fill=\"" + color + '" opacity="0.22" />' +
    "</g>" +
    '<path d="' + FISH_PATH + '" fill="none" stroke="#062b66" stroke-width="5" stroke-linejoin="round" />' +
    "</svg>"
  );
}

/* ---------- Render ---------- */
function render() {
  var tColor = tempColor(temp);
  var fishFill = Math.min(1, Math.max(0, (temp - 28) / (40 - 28)));
  var p = phInfo(ph);
  var phPos = Math.min(100, Math.max(0, (ph / 14) * 100));

  // Temperature
  document.getElementById("fishWrap").innerHTML = buildFish(fishFill, tColor);
  var tv = document.getElementById("tempValue");
  tv.innerHTML = temp + '<span class="aq-temp-unit">\u00b0C</span>';
  tv.style.color = tColor;

  // pH
  var phValue = document.getElementById("phValue");
  phValue.textContent = ph.toFixed(1);
  phValue.style.color = p.color;
  var chip = document.getElementById("phChip");
  chip.textContent = p.label === "NETRAL" ? "NORMAL" : p.label;
  chip.style.color = p.color;
  chip.style.background = p.color + "1a";
  document.getElementById("phMarker").style.left = phPos + "%";

  // Volume
  document.getElementById("volWater").style.height = volume + "%";
  document.getElementById("volValue").textContent = volume + "%";
}

document.addEventListener("DOMContentLoaded", render);
