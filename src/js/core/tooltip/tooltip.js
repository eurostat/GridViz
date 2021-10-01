//this file contains all the logic for creating and updating the tooltip

import { Object3D } from "three";
import * as Utils from "../utils/utils";
import * as CONSTANTS from "../constants.js";
import { json } from "d3-fetch";

let tooltipContainer,
    tooltipTemplate,
    tooltipTableBody,
    tooltipRows,
    pointTip,
    crsTip,
    xTip,
    yTip,
    LAUNameTip,
    LAUCodeTip,
    NUTSCodeTip,
    tooltip

let tooltip_state = {
    display: "none"
};

// example tooltip config
// viewer.tooltip_ = {
//     eventType: "click", // click vs mouseover
//     showLAU: true,
//     showEPSG: false,
//     showNUTS: true,
//     showCoordinates: true,
//     xOffset: 15,
//     yOffset: 15,
//   };

/**
* @description Appends tooltip container to the scene
* @function createTooltipContainer
* @param {Object} viewer viewer object
*/
export function createTooltipContainer(viewer) {
    // Initial tooltip state
    tooltip_state = {
        display: "none"
    };

    //inject tooltip HTML to DOM
    tooltipTemplate = document.createRange()
        .createContextualFragment(`<div id="gridviz-tooltip">
    <div id="gridviz-labeltip">

    <table>
     <thead></thead>
     <tbody id="tooltipBody">

     </tbody>
    </table>
   
    </div>
<div id="gridviz-pointtip"></div>
</div>`);
    viewer.container_.append(tooltipTemplate);
    
    //append row for each field
    tooltipTableBody = document.querySelector("#tooltipBody");
    tooltipRows = {}; // store row nodes for efficient updating
    viewer._cellFields.forEach((field) => {
        appendRowToTooltip(field);
    });

    // optional tooltip rows
    appendRowToTooltip('x');
    appendRowToTooltip('y');
    appendRowToTooltip('launame');
    appendRowToTooltip('laucode');
    appendRowToTooltip('nutscode');
    appendRowToTooltip('crs');

    tooltip = document.querySelector("#gridviz-tooltip");
    pointTip = document.querySelector("#gridviz-pointtip");

    tooltipContainer = new Object3D();
    viewer.scene.add(tooltipContainer);
}

function appendRowToTooltip(field) {
    let row = document.createElement('tr');
    row.id = field+'tip';
    tooltipTableBody.appendChild(row)
    tooltipRows[field] = row;
}


/**
* @description Updates the innerHTML of the tooltip container
* @function updateTooltip
* @param {Object} viewer
*/
export function updateTooltip(viewer) {
    let x, y;
    if (viewer._mobile) {
        //mobile coords are scaled to [-1,1], so we "unscale" them
        x = Math.round(viewer.mobileCoordScaleX.invert(tooltip_state.x))
        y = Math.round(viewer.mobileCoordScaleY.invert(tooltip_state.y))
    } else {
        x = tooltip_state.x;
        y = tooltip_state.y;
    }
    if (viewer.zerosRemoved_) {
        //add the zeros removed back on
        let f = Number('1E' + viewer.zerosRemoved_);
        x = Math.round(x * f);
        y = Math.round(y * f);
    }

    // set tooltip position and display
    tooltip.style.display = tooltip_state.display;
    tooltip.style.left = tooltip_state.left + "px";
    tooltip.style.top = tooltip_state.top + "px";
    pointTip.style.background = tooltip_state.color;

    // set tooltip attributes HTML
    viewer._cellFields.forEach((field)=>{
        tooltipRows[field].innerHTML = `<th><strong>${field}:</strong> </th>
        <th>${tooltip_state[field]}</th>`
    })


    if (viewer.tooltip_.showCoordinates) {
        tooltipRows.x.innerHTML = `<th><strong>x:</strong></th>
        <th>${x}</th>`

        tooltipRows.y.innerHTML = `<th><strong>y:</strong></th>
        <th>${y}</th>`
    }

    if (viewer.tooltip_.showEPSG) {
        tooltipRows.crstip.innerHTML = `<th><strong>CRS:</strong></th>
        <th>EPSG:${viewer.EPSG_}</th>`
    }

    //fetch NUTS info using GISCO id REST API
    if ([4326, 4258, 3035].includes(viewer.EPSG_)) {

        let nutsRequest = `${CONSTANTS.nutsAPIBaseURL}nuts?x=${x}&y=${y}&proj=${viewer.EPSG_}&year=2021&level=3`;
        let lauRequest = `${CONSTANTS.nutsAPIBaseURL}lau?x=${x}&y=${y}&proj=${viewer.EPSG_}&year=2019&level=3`;

        //get both (promise.all required to ensure tooltip on screen after both requests have resolved)
        if (viewer.tooltip_.showLAU && viewer.tooltip_.showNUTS) {
            let promises = [json(nutsRequest), json(lauRequest)];
            Promise.all(promises).then((res) => {

                if (res[0]) {
                    if (res[0].features.length > 0) {
                        //add NUTS id to tooltip table
                        let f = res[0].features[0];

                        NUTSCodeTip.innerHTML = `
<th><strong>NUTS3 code:</strong></th>
<th>${f.properties.nuts_id}</th>
`;
                    }
                }

                if (res[1]) {
                    if (res[1].features.length > 0) {
                        //add lau id and name to tooltip table
                        let f = res[1].features[0];
                        LAUCodeTip.innerHTML = `
          <th><strong>LAU code:</strong></th>
          <th>${f.properties.lau_id}</th>
          `;
                        LAUNameTip.innerHTML = `
          <th><strong>LAU:</strong></th>
          <th>${f.properties.lau_name}</th>
          `;
                    }
                }
                ensureTooltipOnScreen(viewer);
            })

        } else {
            //get NUTS
            if (viewer.tooltip_.showLAU) {

                json(nutsRequest).then(
                    json => {
                        if (json.features.length > 0) {
                            //add NUTS id to tooltip table
                            let f = json.features[0];

                            NUTSCodeTip.innerHTML = `
            <th><strong>NUTS3 code:</strong></th>
            <th>${f.properties.nuts_id}</th>
            `;
                        }
                        ensureTooltipOnScreen(viewer);
                    },
                    err => {
                        console.log("no LAU found");
                        ensureTooltipOnScreen(viewer);
                        //console.error(err);
                    })
            } else if (viewer.tooltip_.showNUTS) {

                json(lauRequest).then(
                    json => {

                        if (json.features.length > 0) {
                            //add lau id and name to tooltip table
                            let f = json.features[0];
                            LAUCodeTip.innerHTML = `
              <th><strong>LAU code:</strong></th>
              <th>${f.properties.lau_id}</th>
              `;
                            LAUNameTip.innerHTML = `
              <th><strong>LAU:</strong></th>
              <th>${f.properties.lau_name}</th>
              `;
                        }
                        ensureTooltipOnScreen(viewer);
                    },
                    err => {
                        console.log("no NUTS found");
                        ensureTooltipOnScreen(viewer);
                        //console.error(err);
                    })
            } else {
                //dont need to wait for fetch
                ensureTooltipOnScreen(viewer);
            }
        }
    }
}

/**
* @function ensureTooltipOnScreen
* @description Prevents the tooltip from appearing off screen
* @param {Object} viewer
*/
function ensureTooltipOnScreen(viewer) {
    //too far right
    if (tooltip.offsetLeft > viewer.width_ - tooltip.clientWidth) {
        tooltip.style.left = tooltip.offsetLeft - (tooltip.clientWidth + viewer.tooltip_.xOffset * 2) + "px";

    }
    //too far down
    if (tooltip.offsetTop + tooltip.clientHeight > viewer.height_) {
        tooltip.style.top = tooltip.offsetTop - (tooltip.clientHeight + viewer.tooltip_.yOffset * 2) + "px";
    }

}


/**
* @function showTooltip
* @description Shows the tooltip where the cell was clicked
* @param {Object} viewer
* @param {*} mouse_position // {x,y}
* @param {*} cell // cell object intersected from the grid cache
*/
export function showTooltip(viewer, mouse_position, cell) {
    let left = mouse_position[0] + viewer.tooltip_.xOffset;
    let top = mouse_position[1] + viewer.tooltip_.yOffset;

    // prepare tooltip settings from cell attributes
    for (const key in cell) {
        tooltip_state[key] = cell[key]
    }
    // show and position tooltip
     tooltip_state.display = "block";
     tooltip_state.left = left
     tooltip_state.top = top;

    // tooltip_state.colorValue = Utils.formatNumber(parseFloat(cell[viewer.colorField_]));
    // tooltip_state.coords = [cell.x, cell.y];
    // tooltip_state.color = cell.color;
    updateTooltip(viewer);
}

/**
* @function hideTooltip
* @description sets tooltip display to none
*/
export function hideTooltip() {
    if (tooltip && tooltip_state) {
        tooltip.style.display = "none";
        //updateTooltip();
    }
}