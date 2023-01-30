//@ts-check

import { Legend } from "../Legend";
import { SegmentStyle } from "../style/SegmentStyle"

/**
 * A legend element for segment orientation.
 * 
 * @author Joseph Davies, Julien Gaffuri
 */
export class SegmentOrientationLegend extends Legend {

    /** @param {Object} opts */
    constructor(opts) {
        super(opts)
        opts = opts || {};

        //title
        this.title = opts.title;
        this.titleFontSize = opts.titleFontSize || "0.8em"
        this.titleFontWeight = opts.titleFontWeight || "bold"

        //exageration
        this.exaggerationFactor = opts.exaggerationFactor || 0.5

        //color
        this.color = opts.color || "gray"
        //orientation
        this.orientation = opts.orientation || 0
        //width
        this.widthPix = opts.widthPix || 3

        //label
        this.labelFontSize = opts.labelFontSize || "0.8em"
        this.labelUnitText = opts.labelUnitText || ""
    }


    /**
     * @param {{ style: SegmentStyle, r: number, zf: number, sColor: import("../Style").Stat, sLength: import("../Style").Stat, sWidth: import("../Style").Stat }} opts 
     */
    update(opts) {

        //could happen when data is still loading
        if (!opts.sWidth) return

        //clear
        this.div.selectAll("*").remove();

        const d = this.div.append("div")

        //title
        if (this.title) {
            d.append("div")
                .attr("class", "title")
                .style("font-size", this.titleFontSize)
                .style("font-weight", this.titleFontWeight)
                .text(this.title)
        }


        //compute segment width and length, in pix
        const sWidth = this.widthPix
        const sLength = 1 * opts.r / opts.zf

        //TODO use orientation

        const svg = d.append("svg").attr("width", sLength).attr("height", sWidth)
            .style("", "inline-block")

        //<line x1="0" y1="0" x2="200" y2="200" style="stroke:rgb(255,0,0);stroke-width:2" />
        svg.append("line")
            .attr("x1", 0).attr("y1", sWidth / 2)
            .attr("x2", sLength).attr("y2", sWidth / 2)
            .style("stroke", this.color)
            .style("stroke-width", sWidth)

        d.append("div")
            //show on right of graphic
            .style("display", "inline")
            .style("padding-left", "5px")
            .style("font-size", this.labelFontSize)
            //.style("font-weight", "bold")
            .text(this.labelUnitText)
    }
}
