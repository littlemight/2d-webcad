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

    renderBorderSelected(program : WebGLProgram | null) : void {
        const isSelected = program !== null;
        if (!program) {
            program = this.program;
        }
        
        const arr = this.points
            .map((v) => v.pos).flat();

        this.gl.useProgram(program);
        const buf = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(arr),
            this.gl.STATIC_DRAW
        );

        const a_pos = this.gl.getAttribLocation(program, "a_pos");
        this.gl.enableVertexAttribArray(a_pos);
        this.gl.vertexAttribPointer(a_pos,2,this.gl.FLOAT,false,0,0);

        this.gl.lineWidth(3);

        const blockingColor = this.gl.getUniformLocation(program, "u_color");

        if (isSelected) {
            this.gl.uniform4fv(
                blockingColor,
                new Float32Array(idToRGBA(this.id))
            )
        }
        else {
            this.gl.uniform3fv(
                blockingColor,
                new Float32Array([0, 0, 0])
            )
        }
        this.gl.drawArrays(this.gl.LINE_LOOP, 0, arr.length/2);

    }
    
    render(selected: boolean, program: WebGLProgram | null) : void {
        const isSelectMode = program !== null;
        if (!program) {
            // create shader program
            program = this.program;
        }
        if (selected) {
            this.renderPointSelected(isSelectMode ? program : null);
            this.renderBorderSelected(isSelectMode ? program : null);
        }

        const arr = this.points
            .map((v) => v.pos)
            .flat();


        this.gl.useProgram(program);

        const buf = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(arr),
            this.gl.STATIC_DRAW
        );

        const a_pos = this.gl.getAttribLocation(program, "a_pos");
        this.gl.enableVertexAttribArray(a_pos);
        // this.gl.bindBuffer(this.gl.)
        this.gl.vertexAttribPointer(a_pos, 2, this.gl.FLOAT, false, 0, 0);

        const blockingColor = this.gl.getUniformLocation(program, "u_color");

        if (isSelectMode) {
            this.gl.uniform4fv(blockingColor, new Float32Array(idToRGBA(this.id)));
        }
        else {
            this.gl.uniform3fv(
                blockingColor,
                new Float32Array(this.color)
            )
        }
        this.gl.lineWidth(6);
        this.gl.drawArrays(this.gl.LINES, 0, arr.length/2);
    }
    toSaveData() {
        const {id, color, selectedColor, points} = this;
        return {
            type: "line" as ShapeType,
            id,
            color,
            selectedColor,
            points,
        };

    };
}

export default Line;