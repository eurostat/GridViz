//@ts-check

import { Style } from "../viewer/Style"
import { Cell } from "../viewer/Dataset"
import { CanvasZoomPan } from "../viewer/CanvasZoomPan";
import { interpolateReds } from "d3-scale-chromatic"

export class ColorStyle extends Style {

    /**
      * @param {string|function} value 
      */
    constructor(value) {
        super(value)
    }


    /**
     * Draw cells.
     * 
     * @param {Array.<Cell>} cells 
     * @param {number} resolution 
     * @param {CanvasZoomPan} cp 
     */
    draw(cells, resolution, cp) {

        const c2 = cp.c2d
        for (let cell of cells) {
            const value = this.getValue(cell);
            c2.fillStyle = this.getColor(value);
            c2.fillRect(cp.geoToPixX(cell.x), cp.geoToPixY(cell.y), resolution / cp.ps, resolution / cp.ps);
        }
    }

    //TODO better expose that
    getColor(v) {
        return interpolateReds(v / 200)
    }

}
