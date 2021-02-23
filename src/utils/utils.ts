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

export function hexaToRGBA(hexadec: string) {
  const hexadec_r = hexadec[1] + hexadec[2];
  const hexadec_g = hexadec[3] + hexadec[4];
  const hexadec_b = hexadec[5] + hexadec[6];
  const color_arr = [parseInt(hexadec_r,16)/255,parseInt(hexadec_g,16)/255,parseInt(hexadec_b,16)/255] as Color;
  return color_arr;
}
