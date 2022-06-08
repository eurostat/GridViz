//@ts-check

import { Style, Stat, getStatistics } from "../Style"
import { Legend } from "../Legend";
import { ShapeColorSizeStyle } from "../style/ShapeColorSizeStyle";


/**
 * @author Julien Gaffuri
 */
export class ColorLegend extends Legend {

    /** @param {Object} opts */
    constructor(opts) {
        super(opts)

        this.colorRamp = opts.colorRamp
        this.fun = opts.fun
    }

    /**
     * @param {*} opts 
     */
    update(opts) {
        //needed: function (t) -> value  +  color ramp

        //clear
        this.div.selectAll("*").remove();


        console.log(this.colorRamp)
        console.log(this.fun)

        const svg = this.div.append("svg")//.attr("width",50).attr("height",100)
        svg.append("rect").attr("x", 0).attr("y", 0).attr("width", 10).attr("height", 100).style("fill", "red")
        //  <rect width="300" height="100" style="fill:rgb(0,0,255);stroke-width:3;stroke:rgb(0,0,0)" />

    }

}
