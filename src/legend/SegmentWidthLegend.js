//@ts-check
'use strict'

import { Legend } from '../core/Legend.js'

/**
 * A legend element for segment width.
 *
 * @author Joseph Davies, Julien Gaffuri
 */
export class SegmentWidthLegend extends Legend {
    /** @param {Object} opts */
    constructor(opts) {
        super(opts)
        opts = opts || {}

        //title
        this.title = opts.title
        this.titleFontSize = opts.titleFontSize || '0.8em'
        this.titleFontWeight = opts.titleFontWeight || 'bold'

        //exageration
        //if set to 1, the segment width in the legend will be the one of the maximum width on the map
        this.exaggerationFactor = opts.exaggerationFactor || 0.5

        //color of the segment in the legend
        this.color = opts.color || 'gray'
        //orientation of the segment in the legend
        this.orientation = opts.orientation || 0

        //label
        this.labelFontSize = opts.labelFontSize || '0.8em'
        this.labelUnitText = opts.labelUnitText || ''
        this.labelFormat = opts.labelFormat

        //segment length in geo unit - a function of the resolution r and zoom level z
        this.lengthFun = opts.lengthExaggerationFactor || ((r, z) => r)
    }

    /**
     * @param {{ style: import("../style/SegmentStyle").SegmentStyle, r: number, z: number, sColor: import("../Style").Stat, sLength: import("../Style").Stat, sWidth: import("../Style").Stat }} opts
     */
    update(opts) {
        //could happen when data is still loading
        if (!opts.sWidth) return

        //clear
        this.div.selectAll('*').remove()

        const d = this.div.append('div')

        //title
        if (this.title) {
            d.append('div')
                .attr('class', 'title')
                .style('font-size', this.titleFontSize)
                .style('font-weight', this.titleFontWeight)
                .text(this.title)
        }

        //get segment max value
        const value_ = opts.sWidth.max * this.exaggerationFactor
        //TODO use gridviz.nice function
        //make 'nice' value (power of ten, or multiple)
        let pow10 = Math.log10(value_)
        pow10 = Math.floor(pow10)
        let value = Math.pow(10, pow10)
        if (value * 8 <= value_) value *= 8
        else if (value * 6 <= value_) value *= 6
        else if (value * 5 <= value_) value *= 5
        else if (value * 4 <= value_) value *= 4
        else if (value * 2.5 <= value_) value *= 2.5
        else if (value * 2 <= value_) value *= 2
        else if (value * 1.5 <= value_) value *= 1.5

        //compute segment width and length, in pix
        const sWidth = opts.widthFun(value, opts.r, opts.sWidth, opts.z) / opts.z
        const sLength = this.lengthFun(opts.r, opts.z) / opts.z

        //TODO use orientation

        const svg = d.append('svg').attr('width', sLength).attr('height', sWidth).style('', 'inline-block')

        //<line x1="0" y1="0" x2="200" y2="200" style="stroke:rgb(255,0,0);stroke-width:2" />
        svg.append('line')
            .attr('x1', 0)
            .attr('y1', sWidth / 2)
            .attr('x2', sLength)
            .attr('y2', sWidth / 2)
            .style('stroke', this.color)
            .style('stroke-width', sWidth)

        const valueT = this.labelFormat? this.labelFormat(value) : value
        d.append('div')
            //show on right of graphic
            .style('display', 'inline')
            .style('padding-left', '5px')
            .style('font-size', this.labelFontSize)
            //.style("font-weight", "bold")
            .text(valueT + (this.labelUnitText ? ' ' : '') + this.labelUnitText)
    }
}
