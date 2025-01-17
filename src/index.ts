import Application from "./classes/Application";
import Polygon from "./classes/Polygon";
import {elementChooser} from "./utils/utils"

const canvas = document.getElementById("gl-display") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2") as WebGL2RenderingContext;

if (!gl) {
  alert("Your browser does not support WebGL");
}

const app = new Application(canvas, gl);

const getCanvasPos = (e: MouseEvent): Point => {
  const canvasBound = canvas.getBoundingClientRect();
  // enforce -1 to 1 axis
  return [
    ((e.x - canvasBound.left) / canvas.width) * 2 - 1,
    -(((e.y - canvasBound.top) / canvas.height) * 2 - 1),
  ];
};

canvas.onmousedown = (e) => {
  app.onMouseDown(getCanvasPos(e));
};

canvas.onmousemove = (e) => {
  app.onMouseMove(getCanvasPos(e), [e.x, e.y]);
};

canvas.onmouseup = (e) => {
  app.onMouseUp(getCanvasPos(e));
};

const selectBtn = document.getElementById("selectBtn") as HTMLButtonElement;
const lineBtn = document.getElementById("lineBtn") as HTMLButtonElement;
const squareBtn = document.getElementById("squareBtn") as HTMLButtonElement;
const polygonBtn = document.getElementById("polygonBtn") as HTMLButtonElement;
const saveBtn = document.getElementById("saveBtn") as HTMLButtonElement;
const colorBtn = document.getElementById("colorBtn") as HTMLButtonElement;
const loadBtn = document.getElementById("loadBtn") as HTMLButtonElement;
const fileSelector = document.getElementById("fileSelect") as HTMLInputElement;
const manualSelector = document.getElementById("select-manual") as HTMLInputElement;
const manualArea = document.getElementById("text-manual") as HTMLElement; 

const btns = [selectBtn, lineBtn, squareBtn, polygonBtn, colorBtn];
// const btns = [selectBtn, lineBtn, squareBtn, polygonBtn, saveBtn];
selectBtn.disabled = true;
selectBtn.onclick = () => {
  app.setMode("selecting");
  for (const btn of btns) {
    btn.disabled = false;
  }
  selectBtn.disabled = true;
};

lineBtn.onclick = () => {
  app.setMode("line");
  for (const btn of btns) {
    btn.disabled = false;
  }
  lineBtn.disabled = true;
};

squareBtn.onclick = () => {
  app.setMode("square");
  for (const btn of btns) {
    btn.disabled = false;
  }
  squareBtn.disabled = true;
};

polygonBtn.onclick = () => {
  app.setMode("polygon");
  for (const btn of btns) {
    btn.disabled = false;
  }
  polygonBtn.disabled = true;
};

saveBtn.onclick = () => {
  app.save(saveBtn);
}

loadBtn.onclick = () => {
  var files = fileSelector.files as FileList;
  var fr = new FileReader();
  fr.readAsText(files.item(0));
  fr.onload = (e) => {
      var res = JSON.parse(e.target.result);
      app.load(res);
  }
}


colorBtn.onclick = () => {
  // tambah ubah warna logic di Application.ts
  app.applyingColor = !app.applyingColor;
  if (app.applyingColor) {
    colorBtn.innerText = "Color (applying)";
  } else {
    colorBtn.innerText = "Color";
  }
};

manualSelector.onchange = () => {
  console.log(manualSelector.value);
  manualArea.innerHTML = "";
  manualArea.innerHTML = elementChooser(parseInt(manualSelector.value));
}

document.onkeyup = (e) => {
  switch (e.key) {
    case "Escape":
      app.onEscKey();
      break;
    case "Delete":
    case "Backspace":
      app.onDelKey();
      break;
    case "1":
    case "2":
    case "3":
    case "4":
      const idx = parseInt(e.key) - 1;
      if (btns[idx]) btns[idx].onclick?.(new MouseEvent("")); // lolololol
      break;
    case "c":
      colorBtn.onclick?.(new MouseEvent(""));
      break;
  }
};

const render = () => {
  app.render();
  window.requestAnimationFrame(render);
};
window.requestAnimationFrame(render);
