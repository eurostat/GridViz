
//@ts-check

import { Style } from "../Style"
import { Cell } from "../Dataset"
import { CanvasGeo } from "../CanvasGeo";

/**
 * 
 * @author Julien Gaffuri
 */
export class KernelSmoothingStyle extends Style {

    /**
     * @param {function(Cell):number} value 
     * @param {function} color 
     * @param {number} sigmaGeo 
     */
    constructor(value, color, sigmaGeo) {
        super()

        /** @private @type {function(Cell):number} */
        this.value = value;

        /** @type {function} */
        this.color = color;

        /** @type {number} */
        this.sigmaGeo = sigmaGeo

        /** 
         * The kernel window
         * @private
         * @type {Array.<Array<number>>} */
        this.kw = undefined
    }


    /**
    * compute window matrix, that is the matrix of the weights.
    * one quadrant is necessary only, since it is symetrical (along both x and y axes).
    * @param {number} sigma 
    * @returns 
    */
    getKernelWindow(sigma) {
        if (!this.kw) {
            //the size of the window: lets limit that to ~4 times the standard deviation, as an approximation.
            const windowSize = Math.floor(3 * sigma) + 1;

            //prepare coefficients for gaussian computation, to avoid computing them every time.
            const c2 = 2 * sigma * sigma;

            /**
             * The gaussian function.
             * @param {number} x 
             * @param {number} y 
             * @returns {number}
             */
            const gaussian = (x, y) => Math.exp(-(x * x + y * y) / c2)

            this.kw = []
            for (let wi = 0; wi <= windowSize; wi++) {
                const col = []
                for (let wj = 0; wj <= windowSize; wj++) {
                    //compute weight at wi,wj
                    const val = gaussian(wi, wj)
                    col.push(val)
                }
                this.kw.push(col)
            }
        }
        return this.kw
    }


    /**
    * Compute kernel smoothing.
    * 
    * @private
    * @param {Array.<Array.<number>>} m The input matrix to be smoothed
    * @param {number} nbX Size of the input matrix - X
    * @param {number} nbY Size of the input matrix - Y
    * @param {number} sigma 
    * @returns {Array.<Array.<number>>}
    */
    kernelSmoothing(m, nbX, nbY, sigma) {

        //create output matrix
        const out = getEmptyMatrix(nbX, nbY);

        //compute window matrix, that is the matrix of the weights
        //one quadrant is necessary only, since it is symetrical (along both x and y axes)
        const window = this.getKernelWindow(sigma)
        const windowSize = window.length - 1

        //make smoothing, cell by cell
        for (let i = 0; i < nbX; i++) {
            for (let j = 0; j < nbY; j++) {

                //compute smoothed value, at i,j
                /** @type {number} */
                let sval = 0;
                /** @type {number} */
                let sumWeights = 0;

                //moving window (wi,wj)
                for (let wi = -windowSize; wi <= windowSize; wi++)
                    for (let wj = -windowSize; wj <= windowSize; wj++) {

                        //TODO use symetric
                        if (i + wi < 0 || i + wi >= nbX || j + wj < 0 || j + wj >= nbY)
                            continue;

                        //get weight of pixel (i+wi,j+wj)
                        const weight = window[Math.abs(wi)][Math.abs(wj)]

                        //add contribution of pixel (i+wi,j+wj): its weight times its value
                        sval += weight * m[i + wi][j + wj]

                        //keep sum of weights
                        sumWeights += weight;
                    }
                //smoothed value
                out[i][j] = sval / sumWeights
            }
        }
        return out;
    }


    /**
     * Draw cells as squares depending on their value.
     * 
     * @param {Array.<Cell>} cells 
     * @param {number} r 
     * @param {CanvasGeo} cg 
     */
    draw(cells, r, cg) {

        if (!cells || cells.length == 0)
            return;

        //compute extent
        const e = cg.updateExtentGeo();
        const xMin = Math.floor(e.xMin / r) * r;
        const xMax = Math.floor(e.xMax / r) * r;
        const yMin = Math.floor(e.yMin / r) * r;
        const yMax = Math.floor(e.yMax / r) * r;

        //compute matrix dimensions
        const nbX = (xMax - xMin) / r + 1
        const nbY = (yMax - yMin) / r + 1

        //create and fill input matrix with input figures, not smoothed
        let matrix = getEmptyMatrix(nbX, nbY);
        for (const c of cells) {
            if (c.x < xMin || c.x > xMax || c.y < yMin || c.y >= yMax)
                continue;
            const i = (c.x - xMin) / r
            const j = (c.y - yMin) / r
            matrix[i][j] = +this.value(c);
        }

        //compute smoothed matrix
        matrix = this.kernelSmoothing(matrix, nbX, nbY, this.sigmaGeo / r)
        //console.log(matrix)

        //get max value
        let maxValue = -Infinity
        for (let i = 0; i < nbX; i++)
            for (let j = 0; j < nbY; j++)
                if (matrix[i][j] > maxValue) maxValue = matrix[i][j];

        //draw smoothed matrix
        for (let i = 0; i < nbX; i++) {
            for (let j = 0; j < nbY; j++) {
                //get value
                const val = +matrix[i][j]

                //set color
                cg.ctx.fillStyle = this.color( Math.sqrt(val / maxValue) );

                //cell geo position
                const xG = xMin + i * r;
                const yG = yMin + j * r;

                //fill rectangle
                cg.ctx.fillRect(cg.geoToPixX(xG), cg.geoToPixY(yG), r / cg.zf, r / cg.zf);
            }
        }

    }


    //getters and setters
    //TODO

}


/**
 * Create a matrix full of zeros.
 * 
 * @param {number} nbX 
 * @param {number} nbY 
 * @returns 
 */
function getEmptyMatrix(nbX, nbY) {
    const matrix = []
    for (let i = 0; i < nbX; i++) {
        const col = [];
        for (let j = 0; j < nbY; j++) {
            col.push(0);
        }
        matrix.push(col);
    }
    return matrix;
}



        //See:
        //NO https://github.com/Planeshifter/kernel-smooth/blob/master/examples/index.js
        //NO https://github.com/jasondavies/science.js/tree/master/examples/kde
        //NO https://gist.github.com/curran/b595fde4d771c5784421

        //NO https://bl.ocks.org/rpgove/210f679b1087b517ce654b717e8247ac
        //NO http://bl.ocks.org/rpgove/51621b3d35705b1a942a
        //https://observablehq.com/@d3/kernel-density-estimation
