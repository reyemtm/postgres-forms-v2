/*IMPORT SCRIPTS FROM PUBLIC FACING STATIC FOLDER*/
// import { layerControlGrouped } from "../../mapbox-layer-control-master/layerControlGrouped.js"
// import InspectControl from '../../mapbox-gl-controls/lib/inspect.js';
/**/

/*ON FIRST RUN SHOW THE WELCOME MODAL HARD CODED ON THE INDEX PAGE*/
if (!localStorage.getItem("sanitary-cleaning")) {
  window.location.hash = "#welcome";
  localStorage.setItem("sanitary-cleaning", true)
}

/*RESET MODAL*/
if (window.location.hash === "#modal") window.location.hash = "#"

/*MODAL WINDOW HTML FOR ADDING LINE TO CLEANED TABLE, TRYING TO KEEP AS MUCH OUT OF THE INDEX.HTML FILE AS POSSIBLE*/
function modal() {
  if (!document.getElementById("modal")) {
    var modal = document.createElement("div");
    modal.innerHTML = '<div class="modal" id="modal"> \
      <a href="#close" class="modal-overlay" aria-label="Close"></a> \
      <div class="modal-container"> \
        <div class="modal-header"> \
          <a href="#close" class="btn btn-clear float-right" aria-label="Close"></a> \
        </div> \
        <div class="modal-body"> \
          <div class="content"> \
            <form action="#" method="post"> \
              <div class="form-group"> \
                <input class="form-input" id="date" type="text" name="date"  readonly="true"> \
              </div> \
              <div class="form-group"> \
                <input  class="form-input" type="number" id="pipe_id" name="pipe_id"  readonly="true"></input> \
              </div> \
              <div class="form-group"> \
                <input  class="form-input" type="text" id="pipe_fieldid" name="pipe_fieldid"  readonly="true"></input> \
              </div> \
              <div class="form-group"> \
                <input  class="form-input" type="text" id="pipe_uuid" name="pipe_uuid"  readonly="true"></input> \
              </div> \
              <div class="form-group"> \
                <br> \
                <button class="btn btn-primary float-left" type="submit">Mark as Cleaned</button> \
                <button class="btn btn-outline float-right" type="button" onclick="window.location.hash=' + "'#;return false;'" + '">Cancel</button> \
              </div> \
            </form> \
          </div> \
        </div> \
        <div class="modal-footer"> \
        </div> \
      </div> \
    </div>'

    document.body.appendChild(modal);
  } else {
    if (!document.querySelector(".-active")) window.location.hash = "modal"
  }
}

modal()

fetch("../../get-table?table=utl_sanitary_lines&format=geojson")
  .then(res => {
    return res.json()
  })
  .then(geojson => {
    initMap(geojson)
  })
  .catch(err => {
    alert("An error has occurred receiving the map data. Please refersh your browser. If the error persists contact the Engineering Division.", err);
    console.log(err)
  })

function initMap(geojson) {

  //
  // var colors = {
  //   "North": "#3d72c8",
  //   "Central": "#3d72c8",
  //   "East": "#80cc50",
  //   "South": "#cd678e",
  //   "West": "#23e99d"
  // }

  var layers = [{
      "id": "utl_sanitary_lines_case",
      "name": "Sanitary Lines",
      "directory": "Map Layers",
      "group": "Sanitary Sewer Layers",
      "parent": "utl_sanitary_lines",
      "hidden": true,
      "type": "line",
      "source": "utl_sanitary_lines",
      "sourceType": {
        "type": "geojson",
        "data": geojson,
        "maxzoom": 17
      },
      "paint": {
        "line-width": [
          "case",
          [">", ["get", "diameter"], 24], 13,
          [">", ["get", "diameter"], 11], 10,
          9
        ],
        "line-color": "white"
      },
      "layout": {
        "visibility": "visible"
      }
    },
    {
      "id": "utl_sanitary_lines",
      "name": "Sanitary Lines",
      "directory": "Map Layers",
      "group": "Sanitary Sewer Layers",
      "hidden": false,
      "type": "line",
      "source": "utl_sanitary_lines",
      "children": true,
      "legend": "<span style='color:green'>&#9644</span> Sanitary Main<br/><span style='color:deeppink'>&#9644</span> Cleaned Lines",
      "sourceType": {
        "type": "geojson",
        "data": geojson,
        "maxzoom": 17
      },
      "paint": {
        "line-width": [
          "case",
          [">", ["get", "diameter"], 24], 10,
          [">", ["get", "diameter"], 11], 7,
          6
        ],
        "line-color": ["case", ["==", ["feature-state", "cleaned"], true], "#c51b7d", "green"],
        "line-opacity": ["case", ["==", ["get", "activeSection"], true], 1, 0.2]
      },
      "layout": {
        "visibility": "visible"
      }
    },
    {
      "id": "utl_sanitary_lines_highlight",
      "name": "Sanitary Lines",
      "directory": "Map Layers",
      "group": "Sanitary Sewer Layers",
      "hidden": true,
      "type": "line",
      "source": "utl_sanitary_lines",
      "parent": "utl_sanitary_lines",
      "sourceType": {
        "type": "geojson",
        "data": geojson,
        "maxzoom": 17
      },
      "paint": {
        "line-width": [
          "case",
          [">", ["get", "diameter"], 24], 10,
          [">", ["get", "diameter"], 11], 7,
          6
        ],
        "line-color": ["case", ["==", ["feature-state", "highlight"], true], "yellow", "transparent"],
      },
      "layout": {
        "visibility": "visible"
      }
    },
    {
      "id": "utl_sanitary_points",
      "type": "circle",
      "name": "Sanitary Structures",
      "directory": "Map Layers",
      "group": "Sanitary Sewer Layers",
      "source": "utl_sanitary_points",
      "sourceType": {
        "type": "geojson",
        "data": "https://311.coz.org/data/geojson/utl_sanitary_points.geojson"
      },
      "paint": {
        "circle-radius": {
          "stops": [
            [0, 0],
            [12, 2],
            [16, 6]
          ]
        },
        "circle-color": "limegreen",
        "circle-stroke-color": "white",
        "circle-stroke-width": {
          "stops": [
            [0, 0],
            [12, 1],
            [16, 2]
          ]
        },
        "circle-pitch-scale": "map",
        "circle-pitch-alignment": "map"
      },
      "layout": {
        "visibility": "visible"
      }
    },
    {
      "id": "utl_sanitary_points_labels",
      "type": "symbol",
      "directory": "Map Layers",
      "group": "Sanitary Sewer Layers",
      "name": "Sanitary Structure Labels",
      "source": "utl_sanitary_points",
      "paint": {
        "text-color": "black",
        "text-halo-color": "white",
        "text-halo-width": 2,
        "text-halo-blur": 0
      },
      "layout": {
        "visibility": "none",
        "text-font": [
          "DIN Offc Pro Bold"
        ],
        "text-field": "{fieldid}",
        "text-anchor": "bottom-left",
        "text-size": 14,
        "text-offset": [0.5, -0.2]
      }
    },
    {
      "id": "sanLinesArrow",
      "type": "symbol",
      "directory": "Map Layers",
      "group": "Sanitary Sewer Layers",
      "name": "Sanitary Flow Direction",
      "hidden": false,
      "source": "utl_sanitary_lines",
      "sourceType": {
        "type": "geojson",
        "data": geojson,
        "maxzoom": 17
      },
      "minzoom": 16,
      "layout": {
        "symbol-placement": "line-center",
        "symbol-spacing": 1,
        "symbol-z-order": "source",
        "icon-anchor": "center",
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
        "icon-padding": 0,
        "icon-image": "arrow",
        "icon-size": 0.06,
        "visibility": "visible"
      }
    }
  ]

  mapboxgl.accessToken = 'pk.eyJ1IjoiY296Z2lzIiwiYSI6ImNqZ21lN2R5ZDFlYm8ycXQ0a3R2cmI2NWgifQ.z4GxUZe5JXAdoRR4E3mvpg'

  var map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/cozgis/cjvpkkmf211dt1dplro55m535', // stylesheet location
      center: [-82.014, 39.942], // starting position [lng, lat]
      zoom: 15, // starting zoom
      hash: true
    })
    .on('load', function() {

      var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        placeholder: "Address Search"
      });

      map.addControl(geocoder, 'top-left')

      /*ADD IMAGE FOR ARROW*/
      this.loadImage('https://gis.coz.org/assets/symbols/arrow-1.png', function(err, img) {
        map.addImage('arrow', img);
      });
      /**/

      /* ADD SOURCES, LAYERS AND LAYER CONTROL*/
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
      // map.addControl(new layerControlGrouped(config), "top-left");
      /**/

      /*GEOLOCATE CONTROL*/
      var gps = new mapboxgl.GeolocateControl({
        trackUserLocation: true,
        positionOptions: {
          enableHighAccuracy: true
        },
        fitBoundsOptions: {
          maxZoom: 17
        }
      })

      map.addControl(gps)

      map.addControl(new showWelcomeMessage(), 'top-right')


      // document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
      // document.getElementById('geocoder').appendChild(gps.onAdd(map));

      /**/

      /* INSPECT CONTROL FOR QUERYING FEATURES*/
      // map.addControl(new InspectControl(), 'top-right');
      /**/

      filterMapByActiveSection(map, geojson, "North");

      /*SYMBOLIZED LINES ALREADY CLEANED*/
      checkCleaned(map, geojson)
      /**/

      /*ADD SOURCE THAT WILL HOLD THE HIGHLIGHT ID ASSUMING THERE IS NO FEATURE WITH THE ID OF 0*/
      highlightSetId(map, 0)
      /**/

      /* ADD CLICK LISTENER*/
      map.on("click", function(e) {
        clickListener(map, e, highlightGetId(map))
      })
      /**/

      /*ADD SUBMIT LISTENER TO FORM, PASSING IN THE map OBJECT*/
      formSubmit(map)
      /**/

      /*FINALLY REMOVE THE LOADER*/
      document.querySelector(".loading").classList.remove("loading")
      /**/

    });
  /*END MAP ON LOAD EVENT*/
}
/*END INIT FN*/

function filterMapByActiveSection(map, geojson, activeSection) {
  geojson.features.map(f => {
    if (f.properties.section === activeSection) {
      f.properties.activeSection = true;
    }else{
      f.properties.activeSection = false;
    }
  });
  map.getSource("utl_sanitary_lines").setData(geojson)
}

function checkCleaned(map, geojson, data) {
  if (data) {
    markCleaned(map, geojson, data)
  } else {
    fetch("../../get-table?table=utl_sanitary_lines_cleaning", {
      cache: "reload"
    })
      .then(res => {
        return res.json()
      })
      .then(cleaned => {
        markCleaned(map, geojson, cleaned)
      })
      .catch(error => {
        console.log(error)
        alert("An error has occurred receiving the cleaning data. Please refersh your browser. If the error persists contact the Engineering Division.", error)
      })
  }
}

function markCleaned(map, geojson, data) {
  geojson.features.map(f => {
    data.map(d => {
      if (d.pipe_uuid === f.properties.uuid) {
        var state = map.getFeatureState({source: "utl_sanitary_lines", id: f.id})
        if (!state.cleaned) {
          map.setFeatureState({
            source: "utl_sanitary_lines",
            id: f.id
          }, {
            "cleaned": true
          });
          f.properties.cleaned = true;
          f.properties.last_cleaned = d.date;
        }
      }
    })
  });
  map.getSource("utl_sanitary_lines").setData(geojson)
}

function clickListener(map, e, highlightId) {
  highlightClear(map);

  var bbox = [
    [e.point.x - 10, e.point.y - 10],
    [e.point.x + 10, e.point.y + 10]
    ];

  var features = map.queryRenderedFeatures(bbox, {
    layers: ["utl_sanitary_lines"]
  });

  if (features && features.length) {
    if (!features[0].properties.cleaned && features[0].properties.subclass != "Lateral" && features[0].properties.subclass != "Abandoned") {
      console.log(features[0])
      highlightSetId(map, features[0].id)
      setTimeout(function() {
        modal()
        modalSetValues(features[0].properties);
      }, 50)
      highlight(map, features[0].id)
    } else {
      /*TODO ADD SOMETHING TO KEEP TRACK OF THE LINES THAT WERE CLEANED AND THE DATA ASSOCIATED*/

      for (var p in features[0].properties) {
        if (features[0].properties[p] === null || !features[0].properties[p] || features[0].properties[p] === "null" || features[0].properties[p] === " ") delete features[0].properties[p]
      };

      var data = features[0].properties


      var popup = new mapboxgl.Popup({
          closeOnClick: true
        })
        .setLngLat(e.lngLat)
        .setHTML('<strong>Pipe Segment</strong><br>' + data.pipeid + '<br><strong>Date Last Cleaned</strong><br>' + (new Date(data.last_cleaned)).toLocaleDateString())
        .addTo(map);
    }
  }
}

function modalSetValues(props) {
  document.querySelector("#date").value = new Date();
  document.querySelector("#pipe_id").value = props.id;
  document.querySelector("#pipe_uuid").value = props.uuid;
  document.querySelector("#pipe_fieldid").value = props.pipeid;
}

function highlightSetId(map, id) {
  var highlightSource = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [0, 0]
    },
    properties: {
      highlightId: id
    }
  }

  if (!map.getSource("highlightSource")) {
    map.addSource("highlightSource", {
      type: "geojson",
      data: highlightSource
    })
  } else {
    map.getSource("highlightSource").setData(highlightSource)
  }
}

function highlight(map, id) {
  map.setFeatureState({source: "utl_sanitary_lines",id: id}, {"highlight": true});
}

function highlightGetId(map) {
  return map.getSource("highlightSource")._data.properties.highlightId
}

function highlightClear(map) {
  map.setFeatureState({source: "utl_sanitary_lines",id: highlightGetId(map)}, {"highlight": false});
}

function formSubmit(map) {
  var form = document.querySelector("form");
  if (!form) {
    console.error("no form found!")
  }else{
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      var data = new URLSearchParams(new FormData(form));
      fetch('/sanitary-cleaning', {
          method: 'post',
          body: data,
        })
        .then(res => {
          if (res.status === 200) {
            window.location.hash = "#";
            formReset(form);
            checkCleaned(map, map.getSource("utl_sanitary_lines")._data);
            highlightClear(map)
          } else {
            console.log(res)
            alert("The value did not submit properly. Close the modal window and try to select another line. If the error persists contact the site administrator.")
          }
        });
    })
  }
}

function formReset(form) {
  var inputs = form.querySelectorAll("input");
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].value = "";
  }
}


















class showWelcomeMessage {
  constructor() {
    this.onAdd = function (map) {
      this._map = map;
      this._btn = document.createElement('button');
      this._btn.id = "showWelcomeMessage";
      this._btn.type = 'button';
      this._btn.innerHTML = '&#x3f;';
      this._btn.style.fontWeight = 'bold';
      this._btn.style.fontSize = '1.2rem';
      this._btn['aria-label'] = 'Show Welcome Message';
      this._btn.onclick = function () {
        window.location.hash = "#welcome";
      };
      this._container = document.createElement('div');
      this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
      this._container.appendChild(this._btn);
      return this._container;
    };
    this.onRemove = function () {
      this._container.parentNode.removeChild(this._container);
      this._map = undefined;
    };
  }
}
