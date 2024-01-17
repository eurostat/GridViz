//@ts-check
'use strict'

import { select } from 'd3-selection'
import { Legend } from '../core/Legend.js'

/**
 *
 * @module legend
 * @author Julien Gaffuri
 */
export class TrivariateLegend extends Legend {
    /** @param {Object} opts */
    constructor(opts) {
        super(opts)
        opts = opts || {}

        //classifier
        this.classifier = opts.classifier

        this.width = opts.width || 150
        this.colorOver = opts.colorOver || "red"
        this.selectionStrokeWidth = this.selectionStrokeWidth != undefined ? this.selectionStrokeWidth : 5
        this.tooltip = opts.tooltip
        this.texts = opts.texts

        this.leftText = opts.leftText || "Category 0"
        this.topText = opts.topText || "Category 1"
        this.rightText = opts.rightText || "Category 2"

        this.real = opts.real || true
    }

    /**
     * @param {{} } opts
     */
    update(opts) {

        //clear
        this.div.selectAll('*').remove()

        //title
        this.makeTitle()

        const sqrt2over2 = 0.866025
        const w = this.width, h = w * sqrt2over2
        const classifier = this.classifier
        const colorOver = this.colorOver
        const selectionStrokeWidth = this.selectionStrokeWidth
        const tt = this.tooltip
        const texts = this.texts

        const padding = 2
        const fontSize = 12

        //make svg element
        const svg = this.div
            .append('svg')
            .attr('width', w + selectionStrokeWidth)
            .attr('height', h + 4 * padding + 2 * fontSize)

        //top label
        svg.append("text").attr("x", w / 2).attr("y", padding + fontSize).text(this.topText).attr("font-size", fontSize)
            .attr("text-anchor", "middle")
        //left label
        svg.append("text").attr("x", 0).attr("y", 3 * padding + 2 * fontSize + h).text(this.leftText).attr("font-size", fontSize)
            .attr("text-anchor", "start")
        //right label
        svg.append("text").attr("x", w).attr("y", 3 * padding + 2 * fontSize + h).text(this.rightText).attr("font-size", fontSize)
            .attr("text-anchor", "end")

        const g = svg.append("g").attr("transform", "translate(" + (selectionStrokeWidth / 2) + " " + (selectionStrokeWidth / 2 + (2 * padding + fontSize)) + ")")

        let middle, left, top, right, left_, bottom_, right_
        if (!this.real) {

            //0 left triangle
            left = g.append('polygon')
                .attr('points', "0," + h + " " + (w / 3) + "," + h + " " + (w / 6) + "," + (2 * h / 3))
            //1 top triangle
            top = g.append('polygon')
                .attr('points', (w / 3) + "," + (h / 3) + " " + (w * 2 / 3) + "," + (h / 3) + " " + (w / 2) + ",0")
            //2 right triangle
            right = g.append('polygon')
                .attr('points', (w * 2 / 3) + "," + h + " " + w + "," + h + " " + (w * 5 / 6) + "," + (2 * h / 3))
            //middle triangle
            middle = g.append('polygon')
                .attr('points', (w / 2) + "," + (h / 3) + " " + (w / 4) + "," + (h * 5 / 6) + " " + (3 * w / 4) + "," + (h * 5 / 6))
            //01 left
            left_ = g.append('polygon')
                .attr('points', (w / 6) + "," + (h * 2 / 3) + " " + (w / 4) + "," + (h * 5 / 6) + " " + (w / 2) + "," + (h / 3) + " " + (w / 3) + "," + (h / 3))
            //02 bottom
            bottom_ = g.append('polygon')
                .attr('points', (w / 3) + "," + (h) + " " + (2 * w / 3) + "," + (h) + " " + (w * 3 / 4) + "," + (h * 5 / 6) + " " + (w / 4) + "," + (h * 5 / 6))
            //12 right
            right_ = g.append('polygon')
                .attr('points', (w / 2) + "," + (h / 3) + " " + (w * 3 / 4) + "," + (h * 5 / 6) + " " + (w * 5 / 6) + "," + (h * 2 / 3) + " " + (w * 2 / 3) + "," + (h / 3))

        } else {
            let r

            //middle triangle
            middle = g.append('polygon')
                .attr('points', (w / 2) + ",0 0," + h + " " + w + "," + h)

            //01 left
            r = this.classifier.lowThreshold[2]
            left_ = g.append('polygon')
                .attr('points', w/2+",0 0,"+h+" "+w*r+","+h)

            //02 bottom
            r = this.classifier.lowThreshold[1]
            bottom_ = g.append('polygon')
                .attr('points', "0," + h + " " + w + "," + h + " " + w * (1 - r / 2) + "," + h * (1 - r) + " " + r * w / 2 + "," + h * (1 - r))

            //12 right
            r = this.classifier.lowThreshold[0]
            right_ = g.append('polygon')
                .attr('points', w + "," + h + " " + w / 2 + ",0 " + w * (1 - r) / 2 + "," + h * r + " " + w * (1 - r) + "," + h)

        }

        const setAttributes = (elt, color, text) => {
            //elt.raise();
            elt.attr('fill', color)
                .attr("stroke", colorOver)
                .attr("stroke-width", 0)
                .attr("stroke-linejoin", "round")
                .on("mouseover", function (e) { /*this.parentNode.appendChild(this);*/ select(this).attr("stroke-width", selectionStrokeWidth); if (!tt || !text) return; tt.html(text); tt.setPosition(e); tt.show() })
                .on("mouseout", function () { select(this).attr("stroke-width", 0); if (tt) tt.hide() })
            if (tt && text) elt.on("mousemove", function (e) { tt.setPosition(e) })
        }
        //setAttributes(left, classifier.colors[0], texts["0"])
        //setAttributes(top, classifier.colors[1], texts["1"])
        //setAttributes(right, classifier.colors[2], texts["2"])
        setAttributes(middle, classifier.centralColor, texts["middle"])
        setAttributes(left_, classifier.middleColors[2], texts["01"])
        setAttributes(bottom_, classifier.middleColors[1], texts["02"])
        setAttributes(right_, classifier.middleColors[0], texts["12"])


    }
}
