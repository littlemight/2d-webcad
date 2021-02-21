let _id = 1;

export function createId() {
  return _id++;
}

export function idToRGBA(id: number) {
  return [
    ((id >> 0) & 0xff) / 0xff,
    ((id >> 8) & 0xff) / 0xff,
    ((id >> 16) & 0xff) / 0xff,
    ((id >> 24) & 0xff) / 0xff,
  ];
}

export function rgbaToId(rgba: [number, number, number, number]) {
  return rgba[0] + (rgba[1] << 8) + (rgba[2] << 16) + (rgba[3] << 24);
}

export function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  shaderCode: string
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Error on creating shader!");
  }
  gl.shaderSource(shader, shaderCode);
  gl.compileShader(shader);
  return shader;
}
