//@ts-check

import { CanvasGeo } from './CanvasGeo';
import { Layer } from './Layer';
import { Style } from './Style';
import { Dataset } from './Dataset';

import { CSVGrid } from '../dataset/CSVGrid';
import { TiledGrid } from '../dataset/TiledGrid';
import { ShapeColorSizeStyle } from '../style/ShapeColorSizeStyle';
import { FlagStyle } from '../style/FlagStyle';
import { LineStyle } from '../style/LineStyle';

/**
 * 
 * @author Julien Gaffuri
 */
export class GridVizCanvas {

    //TODO remove unnecessary redraw calls
    //TODO zoom/pan smartphone - use d3 events
    //TODO make size style - with circle
    //TODO size flags
    //TODO make pie chart / sector / multi
    //TODO implement mouse over
    //TODO empty tile cache

    constructor(opts) {
        opts = opts || {};

        opts.canvasId = opts.canvasId || "vacanvas";
        const canvas = document.getElementById(opts.canvasId);

        /** @type {number} */
        this.w = opts.w || canvas.offsetWidth;
        /** @type {number} */
        this.h = opts.h || canvas.offsetHeight;

        /** @type {string} */
        this.backgroundColor = opts.backgroundColor || "white"



        /** @type {CanvasGeo} */
        this.cg = new CanvasGeo();
        const th = this;
        this.cg.redraw = function () {

            //go through the list of layers and find the one(s) to draw
            for (const layer of th.layers) {

                //skip layer not within the zoom range
                if (layer.minZoom >= this.ps) continue;
                if (layer.maxZoom < this.ps) continue;

                //get data to show
                layer.dataset.getData(this.updateExtentGeo(), () => { th.draw(layer); });

                //draw cells
                th.draw(layer);
            }
            return this
        };




        /** @type {Array.<Layer>} */
        this.layers = [];
        //note: the layers are not supposed to overlap


        /**
         * Styles library.
         * This object exposes style constructors.
         */
        this.styling = {
            getShapeColorSizeStyle: function (color = () => "#EA6BAC", size = null, shape = () => "square") {
                return new ShapeColorSizeStyle(color, size, shape);
            },
            getFlagStyle: function (dict, size = null) {
                return new FlagStyle(dict, size);
            },
            getLineStyle: function (heightGeo) {
                return new LineStyle(heightGeo);
            }
        }

    }

    /** */
    redrawWhenNecessary() {

        //TODO do not redraw it if it is no longer necessary
        //that is if another redraw with another zoom level has been triggered (?)
        //hasZoomedSinceLastCall()
        //if(XXX) return;

        this.cg.redraw();
    }


    /**
     * @param {Dataset} dataset 
     * @param {Style} style 
     * @param {number} minZoom 
     * @param {number} maxZoom 
     */
    add(dataset, style, minZoom, maxZoom) {
        this.layers.push(new Layer(dataset, style, minZoom, maxZoom));
    }

    /**
     * @param {string} url 
     * @param {Style} style 
     * @param {number} minZoom 
     * @param {number} maxZoom 
     */
    addTiledGrid(url, style, minZoom, maxZoom) {
        this.add(
            new TiledGrid(url).loadInfo(() => { this.redrawWhenNecessary(); }),
            style, minZoom, maxZoom
        )
    }


    /**
     * @param {string} url 
     * @param {number} resolutionGeo 
     * @param {Style} style 
     * @param {number} minZoom 
     * @param {number} maxZoom 
     */
    addCSVGrid(url, resolutionGeo, style, minZoom, maxZoom) {
        this.add(
            new CSVGrid(url, resolutionGeo).getData(null, () => { this.redrawWhenNecessary(); }),
            style, minZoom, maxZoom
        )
    }


    /**
     * Draw a layer.
     * 
     * @param {Layer} layer 
     */
    draw(layer) {

        //get cells to draw
        const cells = layer.dataset.getCells(this.cg.extGeo)

        //clear
        this.cg.clear(this.backgroundColor);

        //draw cells
        layer.style.draw(cells, layer.dataset.resolution, this.cg)
    }


    /**
     * Set viewer position.
     * 
     * @param {{x:number,y:number}} pos 
     */
    geoCenter(pos) {
        if (pos) {
            this.cg.center = pos;
            return this;
        }
        return pos;
    }

    /**
     * Set viewer zoom level (ground pixel size).
     * 
     * @param {number} ps 
     */
    pixSize(ps) {
        if (ps) {
            this.cg.ps = ps;
            return this;
        }
        return ps;
    }

}
