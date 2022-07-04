//@ts-check

//the application
export { App } from "./App"

//export color (the entire d3 scale chromatic)
export * from "d3-scale-chromatic"

//export dataset types
export { CSVGrid } from "./dataset/CSVGrid"
export { TiledGrid } from "./dataset/TiledGrid"

//export styles
export { ShapeColorSizeStyle } from "./style/ShapeColorSizeStyle"
export { JoyPlotStyle } from "./style/JoyPlotStyle"
export { CompositionStyle } from "./style/CompositionStyle"
export { SegmentStyle } from "./style/SegmentStyle"
export { TextStyle, getCharLegendFun, charLegendFun } from "./style/TextStyle"
export { KernelSmoothingStyle } from "./style/KernelSmoothingStyle"
export { PillarStyle } from "./style/PillarStyle"
export { SideStyle } from "./style/SideStyle"


//export additional layers
export { LabelLayer } from "./LabelLayer"
export { LineLayer as BoundaryLayer } from "./LineLayer"





import { geoAzimuthalEqualArea } from 'd3-geo'
import { LabelLayer } from "./LabelLayer"
import { LineLayer } from "./LineLayer"


/**
 * Function [0,1]->[0,1] to stretch range of values.
 * @param {number} t The value to stretch, within [0,1]
 * @param {number} alpha The stretching factor: 1=no stretching. >1 stretch to show high values. <1 stretch to show low values.
 * @param {boolean} type Test true or false...
 * @returns The stretched value, within [0,1]
 */
export const s = function (t, alpha, type = false) {
    if (!type) return Math.pow(t, alpha)
    return 1 - Math.pow(1 - t, 1 / alpha)
}


/**
 * Returns label layer from Eurostat, for ETRS89-LAEA grids.
 * From dataset: https://raw.githubusercontent.com/eurostat/gridviz/master/assets/csv/euronymes.csv
 * 
 * @returns {LabelLayer}
 */
export const getEuronymeLabelLayer = function (cc = "EUR", res = 50, opts) {
    opts = opts || {}
    opts.style = opts.style || ((lb, zf) => { if (lb.rs < zf) return; if (lb.r1 < zf) return "12px Arial"; return "18px Arial"; })
    //ETRS89-LAEA projection
    opts.proj = opts.proj || geoAzimuthalEqualArea().rotate([-10, -52]).reflectX(false).reflectY(true).scale(6378137).translate([4321000, 3210000]);
    opts.preprocess = lb => {
        //project from geo coordinates to ETRS89-LAEA
        const p = opts.proj([lb.lon, lb.lat])
        lb.x = p[0]; lb.y = p[1];
        delete lb.lon; delete lb.lat;
    }

    return new LabelLayer("https://raw.githubusercontent.com/eurostat/euronym/main/pub/v1/" + res + "/" + cc + ".csv", opts)
}

/**
 * @returns {LineLayer}
 */
export const getEurostatBoundariesLayer = function (opts) {
    opts = opts || {}
    const nutsYear = opts.nutsYear || "2021"
    const crs = opts.crs || "3035"
    const scale = opts.scale || "03M"
    const nutsLevel = opts.nutsLevel || "3"

    opts.color = opts.color || ((f, zf) => {
        const p = f.properties
        const col = "#999"
        if (p.co === "T") return col //"#007577"
        if (zf < 400) return col
        else if (zf < 1000) return p.lvl >= 3 ? "" : col
        else if (zf < 2000) return p.lvl >= 2 ? "" : col
        else return p.lvl >= 1 ? "" : col
    })

    opts.width = opts.width || ((f, zf) => {
        const p = f.properties
        if (p.co === "T") return 0.5
        if (zf < 400) return p.lvl == 3 ? 2.2 : p.lvl == 2 ? 2.2 : p.lvl == 1 ? 2.2 : 4
        else if (zf < 1000) return p.lvl == 2 ? 1.2 : p.lvl == 1 ? 1.2 : 2.5
        else if (zf < 2000) return p.lvl == 1 ? 1 : 2
        else return 1.2
    })

    opts.lineDash = opts.lineDash || ((f, zf) => {
        const p = f.properties
        if (p.co === "T") return []
        if (zf < 400) return p.lvl == 3 ? [2 * zf, 2 * zf] : p.lvl == 2 ? [5 * zf, 2 * zf] : p.lvl == 1 ? [5 * zf, 2 * zf] : [10 * zf, 3 * zf]
        else if (zf < 1000) return p.lvl == 2 ? [5 * zf, 2 * zf] : p.lvl == 1 ? [5 * zf, 2 * zf] : [10 * zf, 3 * zf]
        else if (zf < 2000) return p.lvl == 1 ? [5 * zf, 2 * zf] : [10 * zf, 3 * zf]
        else return [10 * zf, 3 * zf]
    })

    const url = "https://raw.githubusercontent.com/eurostat/Nuts2json/master/pub/v2/" + nutsYear + "/" + crs + "/" + scale + "/nutsbn_" + nutsLevel + ".json"
    return new LineLayer(url, opts)
}
