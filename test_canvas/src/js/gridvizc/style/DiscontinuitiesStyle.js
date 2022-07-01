//@ts-check

import { Style, Stat, getStatistics } from "../Style"
import { Cell } from "../Dataset"
import { GeoCanvas } from "../GeoCanvas";

/** @typedef {{x:number,y:number,or:"v"|"h",diff:number}} Side */


/**
 * 
 * @author Julien Gaffuri
 */
export class DiscontinuitiesStyle extends Style {

    /** @param {object} opts */
    constructor(opts) {
        super(opts)
        opts = opts || {};

        /** @private @type {string} */
        this.colorCol = opts.colorCol;
        /** A function returning the color of a cell side.
        * @private @type {function(number,number,Stat|undefined):string} */
        this.color = opts.color || (() => "#EA6BAC");

        /** @private @type {string} */
        this.widthCol = opts.widthCol;
        /** A function returning the width of a cell side, in geo unit
         * @private @type {function(number,number,Stat|undefined,number):number} */
        this.width = opts.width;
    }


    /**
     * Draw cells as squares depending on their value.
     * 
     * @param {Array.<Cell>} cells 
     * @param {number} r 
     * @param {GeoCanvas} cg 
     */
    draw(cells, r, cg) {

        //zoom factor
        const zf = cg.getZf()


        //build limits
        //{x:,y}




        //
        cg.ctx.lineCap = "butt";


    }


    //getters and setters
    //TODO


}
