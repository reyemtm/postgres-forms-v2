var zoningTable, zoningFeatureStateId, zoningPaintTable, zoningSchema;

//////////////////////////////////
//IMPORTS ARE RELATIVE TO WHERE THE PAGE ON WHICH THE APP IS LOADED WHICH IS WHY THESE ARE ALL RELATIVE LINKS
//////////////////////////////////

import {
  layerControlGrouped
} from "../vendor/mapbox-layer-control-master/layerControlGrouped.js"

import {
  mglMessageButton
} from '../assets/mglMessageButton.js'

import {
  inputFormModal,
  inputFormModalReset,
  inputFormModalShow
} from '../assets/inputFormModal.js'

import {
   mglHighlightFeatureState
} from '../assets/mglHighlightFeatureState.js'

import {
  mglLoading
} from '../assets/mglLoading.js'

//////////////////////////////////
//MASTER COLORS FOR ZONING LAYER
//////////////////////////////////
zoningPaintTable = {
  "RS-1": "YELLOW",
  "RS-2": "GOLD",
  "RS-3": "ORANGE",
  "RS-4": "DARKORANGE",
  "RS-5": "rgb(179,78,11)",
  "RA-1": "LIGHTBLUE",
  "RM-1": "DEEPSKYBLUE",
  "RM-2": "ROYALBLUE",
  "C-1":  "PINK",
  "C-2": "INDIANRED",
  "C-3": "CRIMSON",
  "C-4": "MAROON",
  "I-1": "GRAY",
  "O-1": "VIOLET",
  "O-2": "MAGENTA",
  "AE":  "YELLOWGREEN",
  "PUD": "PURPLE",
  "9999": "lightgray"
}

//////////////////////////////////
//SETUP MODAL FORM FOR EDITING DATA USING A VERY SIMPLE JSON SCHEMA
//////////////////////////////////
zoningSchema = {
  "id": {
    type: "integer",
    name: "Database ID",
    readonly: true
  },
  "edit_date": {
    type: "text",
    name: "Last Edited",
    readonly: true
  },
  "parcelnum": {
    type: "text",
    name: "Parcel Number",
    readonly: true
  },
  "parcel_address": {
    type: "text",
    name: "Parcel Address",
    readonly: true
  },
  "zoning_code": {
    type: "select",
    options:  (Object.keys(zoningPaintTable)).sort(),
    name: "Zoning Code",
    required: true
  },
  "zoning_ord": {
    type: "text",
    name: "Ordinance"
  },
  "zoning_ord_date": {
    type: "date",
    name: "Ordinance Date",
    required: true
  },
  "zoning_ord_text": {
    type: "text",
    name: "Ordinance Summary"
  },
  "zoning_notes": {
    type: "text",
    name: "Comments"
  }
}

inputFormModal(zoningSchema);


//////////////////////////////////
//CLEAR inputFormModal ON LOAD
//////////////////////////////////
if (window.location.hash === "#inputFormModal") {
  console.log(window.location.hash)
  window.location.hash = "#close"
}

//////////////////////////////////
//ON FIRST RUN SHOW THE WELCOME MODAL
//////////////////////////////////
if (!localStorage.getItem("coz--zoning-updates")) {
  window.location.hash = "#welcome";
  localStorage.setItem("coz--zoning-updates", true)
}

//////////////////////////////////
//PROMISE ALL TO GET ALL THE DATA THAT WE NEED, VECTOR TILES ARE ALREADY BEING SERVED ELSEWHERE
//APPS IS PUBLIC, ANYTHING UNDER APPS/COZ IS SECURED BY WINDOWS READ/WRITE SECTURIY ON THE SERVER FOR THE FOLDER COZ
//////////////////////////////////
Promise.all([
  fetch("../get-table?table=dev_zoning_table", {
    cache: "reload"
  }),
  // fetch("/apps/get-table?table=adm_mus_parcels&fields=id,parcelnum"),
  // fetch("https://311.coz.org/data/geocoders/parcelsGeocoder.json"),
  fetch("https://gis.coz.org/map-layers-config.json")
])
.then(res => {
  Promise.all(res.map(r => r.json()))
    .then(data => {
      initMap(data)
    })
})
.catch(err => {
  alert("An error has occurred receiving the map data. Please refersh your browser. If the error persists contact GIS.\n", err);
  console.log(err)
})

//////////////////////////////////
//FN TO Calculate color for each parcel based on zoning code
// THIS MAKES THE MAP A BIT SLOW AS MAPBOX HAS TO PARSE A LARGE ARRAY, BUT IT IS THE ONLY WAY TO DO THIS DYNAMICALLY WITHOUT CALLING THE DATABASE
//////////////////////////////////
function zoningPaintExpression(table) {
  var parcels = [];
  var expression = ['match', ['get', 'parcelnum']];
  table.forEach(function (row) {
    if (parcels.indexOf(row.parcelnum) < 0) {
      expression.push(row.parcelnum, zoningPaintTable[row.zoning_code])
      parcels.push(row.parcelnum);
    }
  });
  expression.push('COMMON AREA', "lightgray")
  expression.push('black');
  return expression
}

function initMap(data) {

  var now = Date.now()
  console.log("mapping parcel id to zoning table")
  zoningTable = data[0].slice();

  // var zoningParcelColors = zoningParcelCodeMap(zoningTable);

  // console.log(zoningParcelColors)

  // zoningTable = parcelIdMapToZoningTable(data[1], data[0])
  console.log(Date.now() - now)

  var mask = {
    "id": "admin-mask",
    "type": "fill",
    "children": true,
    "directory": "Administrative Layers",
    "group": "Administrative Boundaries",
    "name": "City Mask",
    "children": true,
    "source": "adminSource",
    "sourceType": {
      "type": "vector",
      "tiles": ["https://311.coz.org/api/v1/vector=tiles/public.adm_admin_boundaries/{z}/{x}/{y}.pbf"],
      "maxzoom": 20
    },
    "source-layer": "public.adm_admin_boundaries",
    "paint": {
      "fill-color": "whitesmoke",
      "fill-opacity": 0.99
    },
    "layout": {
      "visibility": "none"
    },
    "filter": ["!=", ["get", "name"], "ZANESVILLE"]
  }

  var maskOutline = {
    "id": "admin-mask-outline",
    "type": "line",
    "parent": "admin-mask",
    "hidden": true,
    "directory": "Administrative Layers",
    "group": "Administrative Boundaries",
    "name": "City Mask 2",
    "children": true,
    "source": "adminSource",
    "sourceType": {
      "type": "vector",
      "tiles": ["https://311.coz.org/api/v1/vector=tiles/public.adm_admin_boundaries/{z}/{x}/{y}.pbf"],
      "maxzoom": 20
    },
    "source-layer": "public.adm_admin_boundaries",
    "paint": {
      "line-color": "black",
      "line-width": 4
    },
    "layout": {
      "visibility": "none"
    },
    "filter": ["==", ["get", "name"], "ZANESVILLE"]
  }

  data[1].push(mask)
  data[1].push(maskOutline)

  var layers = data[1].filter(d => {
    return d["directory"] === "Administrative Layers"
  })

  //////////////////////////////////
  // USE THE EXPRESSION FUNCTION TO PAINT THE PARCELS THAT HAVE A MATCH IN THE ZONING TABLE THE APPRORIATE COLOR ON THE FIRST PAINT
  //////////////////////////////////
  layers.map(l => {
    if (l.id === "adm_mus_parcels") {
      // l.paint["fill-color"] = [
      //   "let",
      //   "p",
      //   ["get", "parcelnum"],
      //   table
      // ]

      l.paint["fill-color"] = zoningPaintExpression(zoningTable)
      // l.paint["fill-color"] = ['feature-state', 'color']
      // l.paint["fill-color"] = "BLACK"
      l.paint["fill-opacity"] = 0.8
      l.name = "Parcels (Zoning Code)"
    }
    if (l.id ==="ParcelsOutline") {
      l.paint["line-width"] = 1
    }
  });

  mapboxgl.accessToken = 'pk.eyJ1IjoiY296Z2lzIiwiYSI6ImNqZ21lN2R5ZDFlYm8ycXQ0a3R2cmI2NWgifQ.z4GxUZe5JXAdoRR4E3mvpg' //TODO turn this whole thing into a route and move this to the env file

  var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/cozgis/cjvpkkmf211dt1dplro55m535', // stylesheet location
    center: [-82.014, 39.942], // starting position [lng, lat]
    zoom: 15, // starting zoom
    minZoom: 14,
    hash: true
  })

  //////////////////////////////////
  // USE THE LOADING FUNCTION TO ADD A LOADING ICON WHENEVER THERE IS A RENDER EVENT ON THE MAP, AND REMOVE WHEN THE MAP IS LOADED
  //////////////////////////////////
  mglLoading(map, "loading", "loading")
  
  var zoningLegend = document.createElement("div");
  zoningLegend.style.background = "white";
  zoningLegend.style.margin = "10px";
  zoningLegend.style.padding = "5px";
  zoningLegend.borderRadius = "3px";
  zoningLegend.innerHTML = `
    ${Object.keys(zoningPaintTable).map(t => {
      return `<div style='width:18px;height:18px;background:${zoningPaintTable[t]};float:left'>&nbsp;</div>&nbsp;&nbsp;${t}<br>`
    }).join(" ")}
  `
  document.querySelector(".mapboxgl-ctrl-bottom-left").insertBefore(zoningLegend, document.querySelector(".mapboxgl-ctrl-bottom-left").children[0])

  // map.showTileBoundaries = true

  map.on('load', function () {

    //////////////////////////////////
    //ADD SOURCES, LAYERS AND LAYER CONTROL USING CUSTOM GROUPEDLAYERCONTROL
    //////////////////////////////////
    layers.map(layer => {
      if (layer.sourceType && (!map.getSource(layer.source))) map.addSource(layer.source, layer.sourceType)
    })
    layers.map(layer => {
      map.addLayer(layer)
    })
    var config = {
      options: {
        collapsed: true
      },
      layers: layers
    };
    map.addControl(new layerControlGrouped(config), "top-left");
    
    //////////////////////////////////
    // INIT HIGHLIGHT FUNCTION
    //////////////////////////////////
    layers.map(layer => {
      if (layer.id === "adm_mus_parcels") mglHighlightFeatureState(map, layer, layer.sourceType)
    })    

    //////////////////////////////////
    //ADD MAPBOX GEOCODER ADDRESS SEARCH
    //////////////////////////////////
    var geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      placeholder: "Address Search"
    });

    map.addControl(geocoder, 'top-right')
    //////////////////////////////////
    
    //////////////////////////////////
    //ADD HELP WINDOW WELCOME MESSAGE
    //////////////////////////////////
    map.addControl(new mglMessageButton({
      title: 'Zoning Table Updates',
      message: 'This app updates the zoning table stored in the GIS database. Writes to this app will be published the following day on the official zoning web map. If you have any questions please contact GIS.'
    }), 'top-right')

    //////////////////////////////////
    //ADD MAP CLICK LISTENER
    //////////////////////////////////
    map.on("click", function (e) {
      clickListener(map, e, zoningTable)
    })
    //
    
    //////////////////////////////////
    //REMOVE POPUP AND HIGHLIGHT ON RIGHT CLICK - HIGHLIGHT IS CLEARED WHEN MAP CLOSE BUTTON IS CLICKED
    //////////////////////////////////
    map.on("contextmenu", function() {
      if (document.querySelector(".mapboxgl-popup-close-button")) document.querySelector(".mapboxgl-popup-close-button").click()
    })
    //

    //////////////////////////////////
    //ADD SUBMIT LISTENER TO FORM, PASSING IN THE map OBJECT
    //////////////////////////////////
    inputFormModalSubmitListener(map, zoningTable)

  });
}

/**
 * 
 * @param {*} map map instance
 * @param {*} e clicked point
 * @param {*} table zoning table to pull properties from
 */
function clickListener(map, e, table) {

  var popup = new mapboxgl.Popup();

  var parcel = map.queryRenderedFeatures(e.point, {layers: ["adm_mus_parcels"]});
  console.log(parcel)
  if (parcel && parcel.length) {

    var features = map.querySourceFeatures('parcelSource', {
      sourceLayer: "public.adm_mus_parcels",
      filter: ["==", "parcelnum", parcel[0].properties.parcelnum]
    });
  
    if (features && features.length) {

      zoningFeatureStateId = features[0].id;

      console.log(zoningFeatureStateId)

      //GET THE VALUES TO POPULATE THE POPUP MODAL FROM THE ZONING TABLE - THESE VALUES WILL CHANGE, OPTIONALLY THESE VALUES COULD COME FROM THE DATABASE ITSELF
      var props = table.filter(t => { return t.parcelnum === features[0].properties.parcelnum });
      console.log(props)

      //GET PARCEL NUMBER AND PARCEL ADDRESS FROM PARCEL TO FILL IN IF NOTHING IS FOUND IN THE ZONING TABLE

      if (props.length === 0) {
        props[0] = {
          id: 0,
          parcelnum: features[0].properties.parcelnum,
          parcel_address: features[0].properties.location_address,
          edit_date: new Date(),
          zoning_code: "",
          zoning_notes: "",
          zoning_ord: "",
          zoning_ord_date: "",
          zoning_ord_text: "",
          owner: features[0].properties.owner_contact_name,
          split: features[0].properties.split,
        }

        if (props[0].parcelnum === "WW" || props[0].parcelnum === "RR" || !props[0].parcelnum || props[0].parcelnum === undefined || props[0].parcelnum == "9") return

        popup
        .setLngLat(e.lngLat)
        .setHTML(formatProps(props[0]))
        .addTo(map);
      }else{
        
        //LET THE DB KNOW THAT THIS HAS BEEN UPDATED ON THE CLIENTSIDE
        if (props[0].id === "0") props[0].id = -1;

        props[0].owner = features[0].properties.owner_contact_name;
        props[0].split = features[0].properties.split;
        inputFormModalSetValues(props[0]);

        //SHOW POPUP FIRST WITH DATA AND ADD LINK TO SHOW INPUT MODAL FOR DATA
        popup
        .setLngLat(e.lngLat)
        .setHTML(formatProps(props[0]))
        .addTo(map);

        console.log(props)

      }
      //SET VALUES OF MODAL TO POPERTIES OF EITHER NEW ZONING RECORD OR EXISTING
      inputFormModalSetValues(props[0]);

    }
  }

  function formatProps(props) {
    return `
    ${Object.keys(props).map(function(key) {
      // console.log(props[key])
      return `
          <div class="bg-secondary">
            <strong>${key.split("_").join(" ").toUpperCase()}</strong>
          </div>
          <div>
            ${(!props[key]) ? "&nbsp" : (props[key] === "") ? "&nbsp" : (key === "parcelnum") ? `<a href="https://www.muskingumcountyauditor.org/Data.aspx?ParcelID=${props[key]}">${props[key]}</a>` : props[key] }
          </div>`
    }).join(" ")}
    <br><a href="#inputFormModal"><button class="btn btn-sm btn-outline btn-red" style="width:100%" onclick="document.querySelector('.mapboxgl-popup-close-button').click()"><icon class="icon icon-edit"></icon> EDIT/ADD ZONING</button></a>
    `
  }

}



//TODO it would be nice if each time the data is updated a version of the existing data is either moved to an archive or is marked as archived and saved in the same table with a creation and an updated date
//TODO could be moved to the inputFormModal script using the callback, form id and post target as parameters

/**
 * Function for submitting the data to the database via the Node App using URLSearchParams to grab the data fron the form
 * If the ID is greater than 0 then the app will update the data, otherwise the app will insert a new record
 * @param {*} map 
 * @param {*} table 
 */
function inputFormModalSubmitListener(map, table) {
  var form = document.querySelector("form");
  if (!form) {
    console.error("no form found!")
  } else {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      //ADD LOADING ONCE FORM IS OPENED
      document.querySelector("#loading").classList.add("loading")

      var data = new URLSearchParams(new FormData(form));

      fetch('../zoning-updates', {
          method: 'post',
          body: data,
        })
        .then(res => {
          if (res.status === 200) {

            //////////////////////////////////
            //CLEAR THE MODAL FORM
            //////////////////////////////////
            inputFormModalReset(form);

            //////////////////////////////////
            //CLEAR THE HIGHLIGHT ON THE MAP
            //////////////////////////////////
            // highlightClear(map); NOW USING FEATURE STATE IMPORTED FN WITH CLONED LAYER

            //////////////////////////////////
            //UPDATE THE GLOBAL ZONING TABLE
            //////////////////////////////////
            zoningTable = zoningTableUpdate(data, table);

            //////////////////////////////////
            //CHANGE THE MAP TO REFLECT THE ZONING TABLE
            //////////////////////////////////
            console.log(data.get("zoning_code"), zoningFeatureStateId)

            //////////////////////////////////
            //FINALLY CHANGE THE PAINT COLOR OF THE UNDERLYING PARCELS TO THE NEW GLOBALLY STORED ZONING TABLE
            //////////////////////////////////
            map.setPaintProperty("adm_mus_parcels", "fill-color", zoningPaintExpression(zoningTable))

          } else {
            console.log(res)
            alert("The value did not submit properly. Close the modal window and try to select another line. If the error persists contact the site administrator.")
          }
        });
    })
  }
}

//////////////////////////////////
//CANT KEEP THIS IN THE INPUTFORMMODAL JS FILE DUE TO HAVING CUSTOM VALUES FOR DATE FIELD NAMES
//////////////////////////////////
function inputFormModalSetValues(props) {
  // console.log(props);
  for (let p in props) {
    if (document.querySelector("#" + p)) {
      if (!props[p]) {
        document.querySelector("#" + p).value = ""
      }
      if (p === "zoning_ord_date" && props[p] != "" && props[p] != null) {
        // console.log((props[p]).substring(10))
        document.querySelector("#" + p).value = (props[p]).substring(0,10)
      }else{
        document.querySelector("#" + p).value = props[p]
      }
    }
  }
}



//////////////////////////////////
//UPDATE OR ADD TO THE GLOBALLY STORED ZONING TABLE
//
//MOVE THIS TO FETCH TABLE AGAIN AND REBUILD THE ZONING TABLE AND PARCEL PAINT TABLE - MAYBE JUST THIS ONLY FOR THE RECENT PARCEL
//////////////////////////////////
function zoningTableUpdate(data, table) {
  
  var obj = paramsToObject(data)
  
  var match = false;

  table.map((t,i) => {
    if (table[i].parcelnum === obj.parcelnum) {
      table[i] = obj;
      match = true;
    }
  });

  if (!match) table.push(obj)
  
  return table
}

//////////////////////////////////
//CONVERT URLSearchParams to JSON OBJECT
//
//TODO MOVE TO HELPER IMPORT
//////////////////////////////////
function paramsToObject(entries) {
  let result = {}
  for(let entry of entries) {
    const [key, value] = entry;
    result[key] = value;
  }
  return result;
}

//////////////////////////////////
// RECYCLE BIN
//////////////////////////////////


//////////////////////////////////
// MAP PARCEL ID WHICH IS USED AS THE VECTOR TILE ID TO THE PARCEL NUMBER IN THE ZONING TABLE SO WE CAN USE THE MORE PERFORMANT FEATURE STATE
//////////////////////////////////
// function parcelIdMapToZoningTable(p, table) {
//   var z = table.slice();
//   var zIndex = new Array(z.length);
//   for (var i = 0; i < p.length; i++) {
//     var row = p[i];
//     var id = row["i"].toString();
//     var parcelnum = row.p;

//     for (var _i = 0; _i < z.length; _i++) {
//       if (zIndex[_i] === -1) continue
//       var zrow = z[_i];
//       if (zrow.parcelnum === parcelnum) {
//         zrow["parcelid"] = id;
//         zIndex[_i] = -1;
//         break
//       }
//     }
//   }
  // console.log(z)
  
  // p.map(row => {
  //   var id,parcelnum;
  //   id = row.id
  //   parcelnum = row.parcelnum;

  //   z.map(zrow => {
  //     // if (zIndex.indexOf(id) < 0) {
  //       if (zrow.parcelnum === parcelnum) {
  //         zrow["parcelid"] = id;
  //         zIndex.push(id)
  //       }
  //     // }
  //   })
  // })
  // return z

  // }


  //////////////////////////////////
  // AFTER LAYERS ARE ADDED, LOOP THOUGH ZONING TABLE AND SET THE FEATURE STATE BASED ON MAPPED PARCEL ID
  //////////////////////////////////
  // console.log(zoningTable)
  // zoningTable.map(z => {
  //   if (z.parcelid) {
  //     map.setFeatureState({
  //       source: "parcelSource",
  //       sourceLayer: "adm_mus_parcels",
  //       id: z.parcelid
  //     }, 
  //     {
  //       color: zoningPaintTable[z.zoning_code]
  //     } 
  //     )
  //   }
  // })