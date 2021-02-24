let _id = 1

export function setInitId(maxim: number) : void{
  _id = maxim + 1;
}
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
  const color_arr = [
    parseInt(hexadec_r, 16) / 255,
    parseInt(hexadec_g, 16) / 255,
    parseInt(hexadec_b, 16) / 255,
  ] as Color;
  return color_arr;
}

export function bulkProgramSetup(
  program: WebGLProgram,
  gl: WebGL2RenderingContext,
  _frameBuf: WebGLFramebuffer | null
) {
  gl.attachShader(
    program,
    createShader(
      gl,
      gl.VERTEX_SHADER,
      `
        precision mediump float;

        attribute vec2 a_pos;

        void main() {
          gl_Position = vec4(a_pos, 0, 1);
        }
      `
    )
  );

  gl.attachShader(
    program,
    createShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
        precision mediump float;

        uniform vec4 u_color;

        void main() {
          gl_FragColor = u_color;
        }
      `
    )
  );

  gl.linkProgram(program);

  const texBuf = gl.createTexture();
  if (!texBuf) {
    throw new Error("Failed creating texture");
  }
  gl.bindTexture(gl.TEXTURE_2D, texBuf);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const depBuf = gl.createRenderbuffer();
  if (!depBuf) {
    throw new Error("Failed creating render buffer");
  }
  gl.bindRenderbuffer(gl.RENDERBUFFER, depBuf);

  gl.bindTexture(gl.TEXTURE_2D, texBuf);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.canvas.width,
    gl.canvas.height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null
  );
  gl.bindRenderbuffer(gl.RENDERBUFFER, depBuf);
  gl.renderbufferStorage(
    gl.RENDERBUFFER,
    gl.DEPTH_COMPONENT16,
    gl.canvas.width,
    gl.canvas.height
  );

  const frameBuf = gl.createFramebuffer();
  if (!frameBuf) {
    throw new Error("Failed creating frame buffer");
  }
  _frameBuf = frameBuf;

  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuf);

  // using the texture and depth buffer with frame buffer
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texBuf,
    0
  );
  gl.framebufferRenderbuffer(
    gl.FRAMEBUFFER,
    gl.DEPTH_ATTACHMENT,
    gl.RENDERBUFFER,
    depBuf
  );
}

export function elementChooser(index: number) {
  const manual = [
    "<p>Membuat garis:" +
    "<ul class='list-inside list-decimal'>" +
    "<li>Pastikan tombol Line pada header sudah terpilih, bila belum silahkan klik tombol Line</li>" +
    "<li>Arahkan mouse ke titik awal pembuatan garis</li>" +
    "<li>Klik kiri mouse</li>" +
    "<li>Arahkan mouse ke titik akhir garis</li>" +
    "<li>Klik kiri mouse, garis sudah terbentuk</li>" +
    "</ul>" +
    "</p>",
    "<p>Membuat persegi:" +
    "<ul class='list-inside list-decimal'>" +
    "<li>Pastikan tombol Rectangle pada header sudah terpilih, klik tombol Rectangle bila belum</li>" +
    "<li>Arahkan mouse ke titik awal pembuatan persegi</li>" +
    "<li>Klik kiri mouse</li>" +
    "<li>Arahkan mouse ke titik sebrang dari persegi yang akan dibuat</li>" +
    "<li>Klik kiri mouse, persegi sudah terbentuk</li>" +
    "</ul>" +
    "</p>",
    "<p>Membuat poligon:" +
    "<ul class='list-inside list-decimal'>" +
    "<li>Pastikan tombol Polygon pada header sudah terpilih, klik tombol Polygon bila belum</li>" +
    "<li>Arahkan mouse ke titik awal pembuatan poligon</li>" +
    "<li>Klik kiri mouse</li>" +
    "<li>Gerakkan cursor ke lokasi titik berikutnya dari poligon yang ingin dibentuk</li>" +
    "<li>Klik kiri mouse</li>" +
    "<li>Ulangi langkah 4 dan 5 hingga poligon sudah dibuat</li>" +
    "<li>tekan tombol escape pada keyboard untuk mengakhiri pembuatan poligon</li>" +
    "</ul>" +
    "</p>"
  ];
  return manual[index];
}
