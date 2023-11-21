//@ts-check
'use strict'

import { Dataset } from '../Dataset.js'

/**
 * @todo
 * A dataset composed of a COGeo file.
 * @see https://www.cogeo.org/
 *
 * @author Joseph Davies, Julien Gaffuri
 */
export class COGeo extends Dataset {
    /**
     *
     * @param {String} url
     * @param {{preprocess?:(function(import("../Dataset").Cell):boolean)}} opts
     */
    constructor(map, url, opts = {}) {
        super(map, url, 0, opts)
    }

    //TODO Use https://geotiffjs.github.io/
}
