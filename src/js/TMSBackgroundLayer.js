//@ts-check

import { GeoCanvas } from "./GeoCanvas";

/**
 * 
 * @author Julien Gaffuri
 */
export class TMSBackgroundLayer {

    /**
     * @param {object} opts 
     */
    constructor(opts) {
        opts = opts || {};

        /** 
         * @private
         * @type {string} */
        this.url = opts.url

        /** An attribute to specify if a layer should be drawn or not
         * @type {boolean} */
        this.visible = opts.visible == false ? false : true;

        /** The minimum zoom factor: Below this level, the layer is not shown.
         * @type {number} */
        this.minZoom = opts.minZoom || 0;

        /** The maximum zoom factor: Above this level, the layer is not shown.
         * @type {number} */
        this.maxZoom = opts.maxZoom || Infinity;

        //ensure acceptable values for the zoom limits.
        if (this.minZoom >= this.maxZoom)
            throw new Error("Unexpected zoom limits for layer. Zoom min should be smaller than zoom max.")

        /** The data cache, indexed by z/y/x */
        this.cache = {}
    }

    /**
     * Get z/x/y cache data.
     * @param {number} z 
     * @param {number} x 
     * @param {number} y 
     * @returns {HTMLImageElement|undefined}
     * @private
     */
    get(z, x, y) {
        let d = this.cache[z];
        if (!d) return;
        d = d[x];
        if (!d) return;
        return d[y];
    }

    /**
     * Get z/x/y cache data.
     * @param {HTMLImageElement} img
     * @param {number} z 
     * @param {number} x 
     * @param {number} y 
     * @returns
     * @private
     */
    put(img, z, x, y) {
        if (!this.cache[z]) this.cache[z] = {}
        if (!this.cache[z][x]) this.cache[z][x] = {}
        this.cache[z][x][y] = img
    }

    /**
     * @param {GeoCanvas} cg The canvas where to draw the layer.
     * @returns {void}
     */
    draw(cg) {

        const zf = cg.getZf()


        const filterColor = "#fffd"

        const x0 = -8426600.0, y0 = 1.59685E7
        const nbPix = 256

        const zMax = 5, zMin = 0;

        const xyzToURL = (x,y,z) => this.url + z + "/" + y + "/" + x
        //const xyzToURL = (x,y,z) => this.url + z + "/" + x + "/" + y + ".png"

        const zToRes = (z) => {
            if (z == 0) return 66145.9656252646
            if (z == 1) return 26458.386250105836
            if (z == 2) return 13229.193125052918
            if (z == 3) return 6614.596562526459
            if (z == 4) return 2645.8386250105837
            if (z == 5) return 1322.9193125052918
            return -1
        }

        const zfToZ = (zf) => {
            let z = 20000 / zf;
            z = Math.floor(z)
            z = Math.max(zMin, z)
            z = Math.min(zMax, z)
            return z
        }

        const xGeoToTMS = (x) => Math.ceil((x - x0) / sizeG)
        const yGeoToTMS = (y) => Math.ceil(-(y - y0) / sizeG)



        const z = zfToZ(zf)
        const res = zToRes(z)
        const sizeG = nbPix * res
        const size = sizeG / zf

        const xMin = xGeoToTMS(cg.extGeo.xMin) - 1
        const xMax = xGeoToTMS(cg.extGeo.xMax)
        const yMax = yGeoToTMS(cg.extGeo.yMin)
        const yMin = yGeoToTMS(cg.extGeo.yMax) - 1

        //TODO
        //cg.setCanvasTransform()

        //handle images
        for (let x = xMin; x < xMax; x++) {
            for (let y = yMin; y < yMax; y++) {

                //get image
                let img = this.get(z, x, y)

                //load image
                if (!img) {
                    const img = new Image()
                    this.put(img, z, x, y)
                    img.onload = () => cg.redraw
                    img.onerror = () => {
                        //case when no image
                        this.put("failed", z, x, y)
                    }
                    img.src = xyzToURL(x,y,z)
                    continue;
                }

                //case when no image
                if (img === "failed")
                    continue;

                //draw image
                const xGeo = x0 + x * sizeG
                const yGeo = y0 - y * sizeG
                cg.ctx.drawImage(img, cg.geoToPixX(xGeo), cg.geoToPixY(yGeo), size, size)
                //cg.ctx.drawImage(img, xGeo, yGeo, sizeG, -sizeG)
            }
        }

        //draw filter
        if (filterColor) {
            cg.ctx.fillStyle = filterColor
            cg.ctx.fillRect(0, 0, cg.w, cg.h)
        }

    }

}
