const canvas = document.getElementById("gl-display") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - document.getElementsByClassName("header")[0].clientHeight
const gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
if (!gl) {
  alert("Your browser does not support WebGL");
}
gl.clearColor(1, 1, 1, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

const triangleData = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0];

const vert = `attribute vec2 a_pos;

void main() {
  gl_Position = vec4(a_pos, 0, 1);
}`;

const frag = `precision mediump float;

uniform vec4 u_fragColor;
void main() {
  gl_FragColor = u_fragColor;
}`;

const vertShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
gl.shaderSource(vertShader, vert);
gl.compileShader(vertShader);

const fragShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
gl.shaderSource(fragShader, frag);
gl.compileShader(fragShader);

const shaderProgram = gl.createProgram() as WebGLProgram;
gl.attachShader(shaderProgram, vertShader);
gl.attachShader(shaderProgram, fragShader);
gl.linkProgram(shaderProgram);

const vertBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertBuf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleData), gl.STATIC_DRAW);

gl.useProgram(shaderProgram); // always use the program on the beginning
const vertexPos = gl.getAttribLocation(shaderProgram, "a_pos");
const uniformCol = gl.getUniformLocation(shaderProgram, "u_fragColor");
gl.vertexAttribPointer(vertexPos, 2, gl.FLOAT, false, 0, 0);
gl.uniform4fv(uniformCol, [1.0, 0.0, 0.0, 1.0]);
gl.enableVertexAttribArray(vertexPos);
gl.drawArrays(gl.TRIANGLES, 0, triangleData.length / 2);
