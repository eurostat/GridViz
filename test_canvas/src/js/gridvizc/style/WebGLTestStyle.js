//@ts-check

import { Style } from "../Style"
import { Cell } from "../Dataset"
import { GeoCanvas } from "../GeoCanvas";

export class WebGLTestStyle extends Style {

    /** @param {object} opts */
    constructor(opts) {
        super(opts)
    }



    draw(cells, r, cg) {
        //zoom factor
        const zf = cg.getZf()

        //console.log("webgl test ", cells.length, r)

        //https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html
        //2D section

        //https://medium.com/trabe/a-brief-introduction-to-webgl-5b584db3d6d6
        //https://observablehq.com/d/dfb2674035a1f388
        //https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
        //https://webglfundamentals.org/webgl/lessons/webgl-drawing-multiple-things.html


        cg.initCanvasTransform()
        cg.ctx.fillStyle = "red";
        cg.ctx.fillRect(200, 200, 100, 200);
        cg.ctx.fillStyle = "green";
        cg.ctx.fillRect(300, 10, 60, 100);


        /*
                const cv = document.createElement("canvas");
                cv.setAttribute("width", cg.w);
                cv.setAttribute("height", cg.h);
                const ctx = cv.getContext("2d");
                ctx.fillStyle = "blue";
                ctx.fillRect(400, 60, 160, 150);
                cg.ctx.drawImage(cv, 0, 0);
        */





        //2
        //same but draw with webGL



        const cv2 = document.createElement("canvas");
        cv2.setAttribute("width", cg.w);
        cv2.setAttribute("height", cg.h);
        //document.body.appendChild(cv2);
        //document.body.append(cv2);

        const gl = cv2.getContext("webgl");
        if (!gl) {
            console.error(gl, "Unable to initialize WebGL. Your browser or machine may not support it.");
        }
        console.log(gl)







        // Initialize a shader program, so WebGL knows how to draw our data
        function initShaderProgram(gl, ...shaders) {
            const program = gl.createProgram();
            for (const shader of shaders) gl.attachShader(program, shader);
            gl.linkProgram(program);
            if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
            throw new Error(gl.getProgramInfoLog(program));
        }


        // creates a shader of the given type, uploads the source and compiles it.
        function createShader(gl, type, ...sources) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, sources.join("\n"));
            gl.compileShader(shader);
            if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
            throw new Error(gl.getShaderInfoLog(shader));
        }


        // Vertex shader program
        // the vertex shader runs for each input vertex and generates a new one as output.
        // We use the pos attribute as input. the output is placed in the gl_Position variable - no transformation here.
        const vertexShaderSource = `
    attribute vec4 pos;
    //uniform mat4 uModelViewMatrix;
    //uniform mat4 uProjectionMatrix;
    void main() {
      gl_Position = /*uProjectionMatrix **/ /**uModelViewMatrix **/ pos;
    }
  `;

        // Fragment shader program
        // gl_FragColor is the output color of the shader - no color transformation here.
        /*const fragmentShaderSource = `
    void main() {
      gl_FragColor = vec4(1, 0.8, 0.6, 1);
    }
  `;*/

        // Fragment shader
        const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 color;
    void main() {
        gl_FragColor = color;
    }`;


        //make program
        const program = initShaderProgram(
            gl,
            createShader(gl, gl.VERTEX_SHADER, vertexShaderSource),
            createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
        );
        gl.useProgram(program);




        {
            //define input vertices
            const vertices = new Float32Array([
                0.5, 0.5,
                -0.5, 0.5,
                0.5, -0.5,
                -0.5, -0.5
            ]);

            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            const position = gl.getAttribLocation(program, "pos");
            gl.vertexAttribPointer(
                position,
                2, //numComponents
                gl.FLOAT, //type
                false, //normalise
                0, //stride
                0 //offset
            );
            gl.enableVertexAttribArray(position);
        }


        {
            // Shader uniform variable for color (read-only)
            const color = gl.getUniformLocation(program, "color");

            // Set color        R  G  B  A
            gl.uniform4f(color, 0, 1, 0, 1);
        }

        // Set the shader uniforms
        /*
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix);
      */

        // Draw the scene
        //gl.clearColor(0.3, 0.3, 0.0, 1.0);
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things
        // Clear the canvas before we start drawing on it.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(
            gl.TRIANGLE_STRIP, // mode,see https://miro.medium.com/max/700/0*HQHB5lCGqlOUiysy.jpg
            0, // vertex list start
            4 // vertex count
        );




        cg.ctx.drawImage(cv2, 0, 0);



        //...
        //draw several objects
        //draw in correct position
        //compute as much as possible in GPU:
        //compute geoToScreen in vector shader
        //compute value to color in fragment shader

        //generic functions to draw rectangles + lines with width
        //use webGL mode in relevant styles
    }

}
