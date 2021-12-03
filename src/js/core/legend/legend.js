//@ts-check
/** @typedef {{type: String, width: Number, height:Number, orientation: String, title:String, titleWidth: Number, format: String, cells:Number, shapeWidth:Number }} LegendConfig */

import * as LEGEND from "d3-svg-legend";
import { select, create, selectAll } from "d3-selection";
import { ticks } from "d3-array";
import { interpolateRound } from "d3-interpolate";
import { axisBottom } from "d3-axis";
import { format } from "d3-format";
import * as d3scale from "d3-scale";
import { range, quantile } from "d3-array";


export class Legend {

    /**
     * Creates an instance of Legend.
     * @param {LegendConfig} config
     * @memberof Legend
     */
    constructor(config) {
        this.type = config.type || "continuous", //cells vs continuous
            this.width = config.width || 300,
            this.height = config.height || null,
            this.orientation = config.orientation || "horizontal",
            this.title = config.title || null, //if null, will default to the current colorField
            this.titleWidth = config.titleWidth || 50,
            this.format = config.format || ".0s",
            this.cells = config.cells || 5,
            this.shapeWidth = config.shapeWidth || 30;

        this.createLegend();
    }

    /**
     * @description Creates a legend
     * @memberof Legend
     */
    createLegend() {
        if (this.type == "cells") this.createCellsLegend();
        if (this.type == "continuous") this.createContinuousLegend();
    }

    /**
     * @description
     * @param {*} layer
     * @memberof Legend
     */
    createCellsLegend(layer) {
        let legendContainer = select("#gridviz-legend");
        if (layer.legend_.orientation == "horizontal") {
            legendContainer.attr("class", "gridviz-legend-horizontal gridviz-plugin");
        } else {
            legendContainer.attr("class", "gridviz-legend-vertical gridviz-plugin");
        }
        let legendSvg =
            legendContainer.append("g")
                .attr("class", "gridviz-legend-svg")
                .attr("height", layer.legend_.height)
                .attr("width", layer.legend_.width)
                .attr("transform", "translate(10,15)"); //padding


        layer.__Legend = LEGEND.legendColor()
            .shapeWidth(layer.legend_.shapeWidth)
            .cells(layer.legend_.cells)
            .labelFormat(format(layer.legend_.format))
            .orient(layer.legend_.orientation)
            .scale(layer.colorScaleFunction_)
            .title(layer.title)
            .titleWidth(layer.legend_.titleWidth)

        if (layer.thresholds_) {
            layer.__Legend.labels(thresholdLabels)
        }

        legendSvg.call(layer.__Legend);

        //adjust width/height
        if (!layer.legend_.height) {
            layer.legend_.height = 320
        }
        legendContainer.style("height", layer.legend_.height + "px");
        legendContainer.style("width", layer.legend_.width + "px");
        //legend.style("height", app.legend_.height +"px");
    }


    /**
     * @description
     * @param {*} app
     * @memberof Legend
     */
    createContinuousLegend(app) {
        let container;
        if (document.getElementById("gridviz-legend")) {
            container = select("#gridviz-legend");
        } else {
            container = create("div").attr("id", "gridviz-legend");
            container.attr("class", "gridviz-plugin");
            app.container_.appendChild(container.node());
        }

        let tickSize = app.legend_.tickSize || 6;
        let width = app.legend_.width || 500;
        let height = app.legend_.height || 44 + tickSize;
        let marginBottom = app.legend_.marginBottom || 16 + tickSize;
        let ticks = app.legend_.ticks || width / 64;

        app.__Legend = colorLegend({
            color: app.colorScaleFunction_,
            title: title,
            tickSize: tickSize,
            width: width,
            height: height,
            marginBottom: marginBottom,
            ticks: ticks,
            marginTop: app.legend_.marginRight || 18,
            marginRight: app.legend_.marginRight || 0,
            marginLeft: app.legend_.marginLeft || 0,
            tickFormat: app.legend_.tickFormat || ".0f",
            tickValues: app.thresholds_ || undefined
        });

        container.node().appendChild(app.__Legend);
    }

    /**
     * @description remove DOM element and rebuild legend
     * @function updateLegend
     */
    updateLegend() {
        // clear and create new
        var l = selectAll(".gridviz-legend-svg").remove();
        setTimeout(()=> this.createLegend(), 1000);
    }

}

/**
 * @description
 * @param {*} color
 * @param {number} [n=256]
 * @return {HTMLElement} 
 */
function ramp(color, n = 256) {
    const canvas = document.createElement("CANVAS")
    canvas.width = n;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    for (let i = 0; i < n; ++i) {
        context.fillStyle = color(i / (n - 1));
        context.fillRect(i, 0, 1, 1);
    }
    return canvas;
}


/**
   * 
   * @function colorLegend
   * @description see https://observablehq.com/@gabgrz/color-legend
   */
function colorLegend({
    color,
    title,
    tickSize,
    width,
    height,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    ticks,
    tickFormat,
    tickValues
} = {}) {

    const svg = create("svg")
        .attr("class", "gridviz-legend-svg")
        // .attr("class", "gridviz-continuous-legend")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .style("overflow", "visible")
        .style("display", "block");

    let x;

    // Continuous
    if (color.interpolator) {
        x = Object.assign(color.copy()
            .interpolator(interpolateRound(marginLeft, width - marginRight)),
            { range() { return [marginLeft, width - marginRight]; } });

        svg.append("image")
            .attr("x", marginLeft)
            .attr("y", marginTop)
            .attr("width", width - marginLeft - marginRight)
            .attr("height", height - marginTop - marginBottom)
            .attr("preserveAspectRatio", "none")
            .attr("xlink:href", ramp(color.interpolator()).toDataURL());

        // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
        if (!x.ticks) {
            if (tickValues === undefined) {
                const n = Math.round(ticks + 1);
                tickValues = range(n).map(i => quantile(color.domain(), i / (n - 1)));
            }
            if (typeof tickFormat !== "function") {
                tickFormat = format(tickFormat === undefined ? ",f" : tickFormat);
            }
        }
    }

    // Discrete
    else if (color.invertExtent) {
        const thresholds
            = color.thresholds ? color.thresholds() // scaleQuantize
                : color.quantiles ? color.quantiles() // scaleQuantile
                    : color.domain(); // scaleThreshold

        const thresholdFormat
            = tickFormat === undefined ? d => d
                : typeof tickFormat === "string" ? format(tickFormat)
                    : tickFormat;

        x = d3scale.scaleLinear()
            .domain([-1, color.range().length - 1])
            .rangeRound([marginLeft, width - marginRight]);

        svg.append("g")
            .selectAll("rect")
            .data(color.range())
            .join("rect")
            .attr("x", (d, i) => x(i - 1))
            .attr("y", marginTop)
            .attr("width", (d, i) => x(i) - x(i - 1))
            .attr("height", height - marginTop - marginBottom)
            .attr("fill", d => d);

        tickValues = range(thresholds.length);
        tickFormat = i => thresholdFormat(thresholds[i], i);
    }

    svg.append("g")
        .attr("transform", `translate(0, ${height - marginBottom})`)
        .call(axisBottom(x)
            .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
            .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
            .tickSize(tickSize)
            .tickValues(tickValues))
        .call(g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("y", marginTop + marginBottom - height - 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("class", "gridviz-continuous-legend-title")
            .text(title));

    return svg.node();
}

/**
   * 
   * @function thresholdLabels
   * @description generates labels for legends that use threshold scales
   */
function thresholdLabels({
    i,
    genLength,
    generatedLabels,
    labelDelimiter
}) {
    if (i === 0) {
        const values = generatedLabels[i].split(` ${labelDelimiter} `)
        return `Less than ${values[1]}`
    } else if (i === genLength - 1) {
        const values = generatedLabels[i].split(` ${labelDelimiter} `)
        return `${values[0]} or more`
    }
    return generatedLabels[i]
}


