//@ts-check

import { Style } from "../viewer/Style"
import { Cell } from "../viewer/Dataset"
import { CanvasGeo } from "../viewer/CanvasGeo";

/**
 * A very generic style that shows grid cells with specific color, size and shape.
 * It can be used to show variables as cell colors, cell size, cell shape, or any combination of the three visual variables.
 * 
 * @author Julien Gaffuri
 */
export class ShapeColorSizeStyle extends Style {

    /**
      * @param {function} color A function returning the color of the cell.
      * @param {function} size A function returning the size of a cell (in geographical unit).
      * @param {function} shape A function returning the shape of a cell.
      */
    constructor(color = () => "#EA6BAC", size = null, shape = () => "square") {
        super()

        /** @type {function} */
        this.color = color;

        /** @type {function} */
        this.size = size;

        /** @type {function} */
        this.shape = shape;
    }


    /**
     * Draw cells as squares, with various colors and size.
     * 
     * @param {Array.<Cell>} cells 
     * @param {number} resolution 
     * @param {CanvasGeo} cg 
     */
    draw(cells, resolution, cg) {

        //TODO if by size, sort them

        for (let cell of cells) {

            //color
            cg.ctx.fillStyle = this.color? this.color(cell) : "#EA6BAC";

            //size - in ground meters
            let sG = this.size? this.size(cell) : resolution;
            //size - in pixel
            const s = sG / cg.zf

            //get shape
            const shape = this.shape? this.shape(cell) : "square";
            if (shape === "square") {
                //draw square
                const d = resolution * (1 - sG / resolution) * 0.5
                cg.ctx.fillRect(cg.geoToPixX(cell.x + d), cg.geoToPixY(cell.y + resolution - d), s, s);
            } else if (shape === "circle") {
                //draw circle
                cg.ctx.beginPath();
                cg.ctx.arc(cg.geoToPixX(cell.x + resolution * 0.5), cg.geoToPixY(cell.y + resolution * 0.5), s * 0.5, 0, 2 * Math.PI, false);
                cg.ctx.fill();
            } else {
                throw new Error('Unexpected shape:' + shape);
            }
        }

        //draw stroke
        //TODO draw that with each symbol
        this.drawStroke(cells, resolution, cg, this.shape, this.size)
    }

}
