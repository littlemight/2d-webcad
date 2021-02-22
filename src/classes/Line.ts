import { idToRGBA } from "../utils/utils";
import Shape from "./Shape";

class Line extends Shape {

    // kalo null --> ngerender shape
    // kalo ga null --> hitbox
    renderPointSelected(program: WebGLProgram | null) {
        const isSelectMode = program !== null;
        if (!program) {
            program = this.program;
        }

        const nodesArr = this.points
            .map((v) => v.pos)
            .map((v) => {
                return [
                    v[0] + 0.015,
                    v[1] + 0.015,
                    v[0] - 0.015,
                    v[1] + 0.015,
                    v[0] - 0.015,
                    v[1] - 0.015,
                    v[0] + 0.015,
                    v[1] - 0.015,
                ]
            })
            .flat();

        this.gl.useProgram(program);
        const buf = this.gl.createBuffer();
        const a_pos = this.gl.getAttribLocation(program, "a_pos");
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(nodesArr),
            this.gl.STATIC_DRAW
        );
        this.gl.enableVertexAttribArray(a_pos);
        this.gl.vertexAttribPointer(a_pos,2,this.gl.FLOAT,false,0,0)

        const blockingColor = this.gl.getUniformLocation(program, "u_color");
        for (let i = 0; i < this.points.length; i++) {
            if (isSelectMode) {
                this.gl.uniform4fv(
                    blockingColor,
                    new Float32Array(idToRGBA(this.points[i].id))
                );
            }
            else {
                this.gl.uniform3fv(blockingColor, new Float32Array(this.selectedColor));
            }
            this.gl.drawArrays(this.gl.TRIANGLE_FAN,i*4 ,4)
        }

    }
    
    render(selected: boolean, program: WebGLProgram | null) : void {
        const isSelectMode = program !== null;
        if (!program) {
            // create shader program
            program = this.program;
        }
        if (selected) {
            this.renderPointSelected(isSelectMode ? program : null);
        }
    }
}

export default Line;