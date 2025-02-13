//   let i = 1;
let deg = 0;
let goingUp = true;

const svgCanvas = document.querySelector("#svg-canvas") as HTMLElement;
//   const poly = document.querySelector("#tube-poli") as HTMLElement;
//   poly.style.transformOrigin = "center center";

const btn = document.querySelector("#btn01") as HTMLElement;
btn.onclick = onBtnClick;

function degToRad(deg: number) {
  return deg * (Math.PI / 180);
}

console.log(degToRad(58));
console.log(degToRad(115));
console.log(degToRad(172));
console.log(degToRad(180));
console.log(degToRad(360));

let x = 40,
  y = 40,
  width = 50,
  height = 200,
  margin = 100;
function onBtnClick(e: MouseEvent) {
  // deg += 1;
  // poly.style.transform = `rotate(${deg}deg)`;

  const tube = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  tube.classList.add("tube");

  tube.style.transformOrigin = `center center`;
  tube.style.transformBox = `fill-box`;

  tube.setAttribute("x", String(x));
  tube.setAttribute("y", String(y));
  tube.setAttribute("width", String(width));
  tube.setAttribute("height", String(height));
  tube.setAttribute("fill", "green");

  tube.dataset["angle"] = "0";
  // tube.onclick = rotateTube;

  svgCanvas.append(tube);
  x += width + margin;
}
