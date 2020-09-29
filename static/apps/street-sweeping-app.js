import {
  DrawRectangle
} from "../assets/mapbox-gl-draw-rectangle-mode.js"

//GET CENTERLINE DATA USING FEATURE COLLECTION GO SERVER
fetch("https://311.coz.org/api/v1/feature-server/collections/public.utl_streets_sweeping_centerlines/items.json")
  .then(res => {
    return res.json()
  })
  .then(geojson => {
    initMap(geojson);
  })
  .catch(err => {
    alert("An error has occurred receiving the map data. Please refersh your browser. If the error persists contact the Engineering Division.", err);
    console.log(err)
  })

function initMap(geojson) {

  mapboxgl.accessToken = 'pk.eyJ1IjoiY296Z2lzIiwiYSI6ImNqZ21lN2R5ZDFlYm8ycXQ0a3R2cmI2NWgifQ.z4GxUZe5JXAdoRR4E3mvpg'

  var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/cozgis/cjvpkkmf211dt1dplro55m535', // stylesheet location
    center: [-82.014, 39.942], // starting position [lng, lat]
    zoom: 15, // starting zoom
    hash: true,
    pitchWithRotate: false,
    dragRotate: false,
    touchPitch: false
  });

  map.on('load', function () {

    addForm("sidebar")
    addLayers(map, geojson);
    addControls(map);
    var draw = addDrawControl(map);

    addStreetButtonEventListeners(map, draw)

    map.on("draw.create", function (e) {
      var ids = addToSelection(map, e.features[0], draw, geojson);
      document.getElementById("ids").value = ids.join(",")
    });

    map.on("contextmenu", function() {
      formReset(document.querySelector("form"));
      map.getSource("selected").setData(turf.featureCollection([]))
    })

    map.on("click", clickListener)
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

function clickListener(e) {
  let map = this;
  highlight(map);

  var bbox = [
    [e.point.x - 10, e.point.y - 10],
    [e.point.x + 10, e.point.y + 10]
  ];

  var features = map.queryRenderedFeatures(bbox, {
    layers: ["lines"]
  });
  
  if (features && features.length) {
    // console.log(features[0])

    highlight(map, features[0])

    var flat = turf.flatten(features[0])
    var center = turf.center(flat);
    var p = features[0].properties;
    var dateFormat = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    var popup = new mapboxgl.Popup()
      .setLngLat(center.geometry.coordinates)
      .setHTML(`<h4>${p.lsn}</h4><p>This section of ${p.lsn} from ${p.int_from} to ${p.int_to} ${(!p.last_swept) ? `has not been swept` : `was last swept on ${new Date(p.last_swept).toLocaleString('en-US', dateFormat)}`}.</p>`)
      .on("close", function() {
        if (!document.querySelector(".mapboxgl-popup")) highlight(map)
      })
      .addTo(map)
  }
}

function highlight(map, data) {
  if (!data) data = turf.featureCollection([])
  if (!map.getSource("highlight")) {
    map.addSource("highlight", {
      type: "geojson",
      data: data
    })
    map.addLayer({
      id: "highlight",
      type: "line",
      source: "highlight",
      paint: {
        "line-color": "rgb(0, 255,255)",
        "line-width": 4
      }
    })
  }else{
    map.getSource("highlight").setData(data)
  }
}


function formSubmit(map) {
  var form = document.querySelector("form");
  if (!form) {
    console.error("no form found!")
  } else {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new URLSearchParams(new FormData(form));
      if (!data.get("ids")) {
        alert("Please add some streets before attempting to save.");
        return
      }
      fetch('../street-sweeping', {
          method: 'post',
          body: data,
        })
        .then(res => {
          if (res.status === 200) {
            return res.json()
          } else {
            console.log(res)
            alert("The value did not submit properly. Close the modal window and try to select another line. If the error persists contact the site administrator.")
          }
        })
        .then(json => {
          console.log(json)
          window.location.hash = "#";
          formReset(form);
          var current = map.getSource("lines")._data;
          current.features.map(f => {
            if (json.ids.indexOf(f.properties.id.toString()) > -1) {
              console.log(json.date, f.properties.last_swept)
              f.properties.last_swept = new Date(json.date).getTime()
            }
          });
          map.getSource("lines").setData(current)
          map.getSource("selected").setData(turf.featureCollection([]))
        })
    })
  }
}

function formReset(form) {
  var inputs = form.querySelectorAll("input");
  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].type === "date") {
      inputs[i].value = new Date().toISOString().slice(0, 10)
    } else {
      inputs[i].value = "";
    }
  }
}

function addForm(el) {
  //SHOW SIDEBAR
  var sidebar = document.getElementById(el);
  sidebar.style.display = "flex";
  document.getElementById("map").style.left = "320px";
  document.getElementById("map").style.right = 0
  document.getElementById("map").style.width = "unset";

  //ADD SIDEBAR FORM
  var sweepingForm = `
  <header>
    <h1>Street Sweeping Tracker</h1>
  </header>
  <section>
  <form class="form" action="/street-sweeping" method="post" style="border: solid thin lightgray; padding: 0.5rem;margin: 1rem 0;">
    <div class="form-group">
      <button id="add-streets" class="js-btn btn" type="button" style="width:100%">Add Streets</button>
    </div>
    <div class="form-group">
      <input class="form-input" id="date" name="date" type="date" value="${new Date().toISOString().slice(0,10)}">
    </div>
    <div class="form-group">
      <input class="form-input" id="ids" name="ids" type="text" style="display:none">
    </div>
    <div class="form-group">
      <button class="btn btn-success input-group-btn btn-lg" type="submit" style="width:100%">Submit</button>
    </div>
  </form>
 
  <details class="accordion" open>
    <summary class="accordion-header">
    <i class="icon icon-arrow-right mr-1"></i>
    Legend
    </summary>
    <div class="accordion-body">
    <p style="margin:0.8rem">
      <i class="fas fa-square" style="color: skyblue"></i> Swept in the past 3 Months<br>
      <i class="fas fa-square" style="color: orange"></i> Swept in the past 6 Months<br>
      <i class="fas fa-square" style="color: red"></i> Swept in the past 12 Months
    </p>
    </div>
  </details>
  

  <details class="accordion">
    <summary class="accordion-header">
      <i class="icon icon-arrow-right mr-1"></i>
      Instructions
    </summary>
    <div class="accordion-body">
      <ol>
        <li>Click Add Streets.</li>
        <li>Draw a box on the map to select the streets.</li>
        <li>Click the map and then drag. Holding down the mouse button will move the map. If you need to add more streets, click Add Streets again. If you need to remove streets, start over using the reset button.</li>
        <li>Set the Date (defaults to today's date).</li>
        <li>Click Submit.</li>
      </ol>
      <em>Right clicking the mouse will also reset the form and map.</em>
    </div>
  </details>

  <details class="accordion">
    <summary class="accordion-header">
      <i class="icon icon-arrow-right mr-1"></i>
      Possible Future Additions 
    </summary>
    <div class="accordion-body">
      <ul>
      <li>Date Picker to Filter Sweeping</li>
      <li>Report Generator?</li>
      </ul>
    </div>
  </details>
</section>

<footer>
<button id="reset-streets" class="btn btn-error" style="width: 100%";>Reset</button>
</footer>

  `

  sidebar.innerHTML += sweepingForm;
}

function addLayers(map, geojson) {

  fetch("../get-table?table=utl_streets_sweeping_tracker")
    .then(res => res.json())
    .then(table => {

      var sweptStreets = {};

      table.map(row => {
        if (!sweptStreets[row.street_id]) {
          sweptStreets[row.street_id] = [row.date]
        }else{
          sweptStreets[row.street_id].push(row.date);
          sweptStreets[row.street_id].sort()
        }
      });
    
      geojson.features.map(f => {
        if (sweptStreets[f.properties.id]) {
          f.properties.last_swept = new Date(sweptStreets[f.properties.id][ [sweptStreets[f.properties.id].length - 1] ]).getTime()
        }else{
          f.properties.last_swept = 0;
        }
      })

      var layers = [{
          "id": "lines",
          "name": "Street Sweeping Roads",
          "directory": "Map Layers",
          "group": "Street Sweeping Roads",
          "hidden": false,
          "type": "line",
          "source": "lines",
          "children": true,
          "legend": "<span style='color:black'>&#9644</span> Roads<br/><span style='color:firebrick'>&#9644</span> Swept Roads",
          "sourceType": {
            "type": "geojson",
            "data": geojson,
            "promoteId": "id"
          },
          "paint": {
            "line-width": 6,
            "line-color": ["case", 
              [">=", ["get", "last_swept"], new Date().setMonth(new Date().getMonth() - 4)], "#2c7bb6",
              [">=", ["get", "last_swept"], new Date().setMonth(new Date().getMonth() - 8)], "#fdae61",
              [">=", ["get", "last_swept"], new Date().setMonth(new Date().getMonth() - 12)], "#d7191c",

              "black"
            ],
            "line-opacity": 0.8
          },
          "layout": {
            "visibility": "visible"
          }
        },
        {
          "id": "selected",
          "name": "Sanitary Lines",
          "directory": "Map Layers",
          "group": "Sanitary Sewer Layers",
          "hidden": false,
          "type": "line",
          "source": "selected",
          "children": true,
          "legend": "<span style='color:green'>&#9644</span> Sanitary Main<br/><span style='color:deeppink'>&#9644</span> Cleaned Lines",
          "sourceType": {
            "type": "geojson",
            "data": turf.featureCollection([]),
            "generateId": true
          },
          "paint": {
            "line-width": 6,
            "line-color": "yellow",
            "line-opacity": 1
          },
          "layout": {
            "visibility": "visible"
          }
        }
      ]

      /* ADD SOURCES AND LAYERS */
      layers.map(layer => {
        if (layer.sourceType && (!map.getSource(layer.source))) map.addSource(layer.source, layer.sourceType)
      })
      layers.map(layer => {
        map.addLayer(layer)
      });

    })
}

function addControls(map) {
  var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    placeholder: "Address Search"
  });
  map.addControl(geocoder, 'top-left');
}

function addDrawControl(map) {

  //ADD MAPBOX DRAW TO ALLOW FOR SELECTING ROADS
  var modes = MapboxDraw.modes;

  modes.draw_rectangle = DrawRectangle;

  var draw = new MapboxDraw({
    displayControlsDefault: false,
    modes: modes,
    uerProperties: true,
    controls: {
      polygon: true
    }
  });

  map.addControl(draw)

  map.on('draw.modechange', function () {
    switch (draw.getMode()) {
      case "draw_polygon":
        draw.changeMode('draw_rectangle');
      default:
        null
    }
  })

  document.querySelector(".mapbox-gl-draw_ctrl-draw-btn").style.display = "none"

  return draw
}

function addToSelection(map, drawnBox, drawControl, data) {

  var bbox = turf.bbox(drawnBox);
  var bbox1 = map.project([bbox[0], bbox[1]]);
  var bbox2 = map.project([bbox[2], bbox[3]]);

  var rawFeatures = map.queryRenderedFeatures([
    [bbox1.x, bbox1.y],
    [bbox2.x, bbox2.y]
  ], {
    layers: ["lines"]
  });
  // console.log(rawFeatures)

  var rawFeaturesIds = rawFeatures.reduce((i, f) => {
    return [...i, f.id]
  }, [])

  // console.log(rawFeaturesIds)

  var selected = data.features.filter(f => {
    return rawFeaturesIds.indexOf(f.properties.id) > -1
  });

  // console.log(selected)

  var withinDrawnBox = selected.filter(f => {
    var envelope = turf.envelope(f)
    return (turf.booleanContains(drawnBox, envelope) || turf.booleanWithin(envelope, drawnBox) || turf.booleanOverlap(envelope, drawnBox))
  })

  let ids = [];

  if (rawFeatures.length > 0) {
    var currentFeatures = map.getSource("selected");
    if (currentFeatures._data.features.length) {
      // console.log(currentFeatures);
      var newFeatures = turf.featureCollection([...withinDrawnBox, ...currentFeatures._data.features]);
      map.getSource("selected").setData(newFeatures);
      ids = newFeatures.features.reduce((i, f) => {
        return [...i, f.properties.id]
      }, []);
      drawControl.deleteAll()
      return ids
    } else {
      map.getSource("selected").setData(turf.featureCollection(withinDrawnBox));
      ids = withinDrawnBox.reduce((i, f) => {
        return [...i, f.properties.id]
      }, []);
      drawControl.deleteAll()
      return ids
    }
  }

}

function addStreetButtonEventListeners(map, drawControl) {
  //ADD EVENT LISTENER FOR ADD STREETS BUTTON TO CHANGE DRAW MODE TO draw_rectable
  document.querySelector("#add-streets").addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-success")) {
      e.target.classList.remove("btn-success")
      drawControl.changeMode("simple_select")
    } else {
      e.target.classList.add("btn-success")
      drawControl.changeMode("draw_rectangle")
      map.off("click", clickListener)
    }
  })

  map.on('draw.modechange', function () {
    if (drawControl.getMode() === "simple_select") {
      document.querySelector("#add-streets").classList.remove("btn-success")
      setTimeout(function() {
        map.on("click", clickListener)
      }, 1000)
    }
  })

  document.querySelector("#reset-streets").addEventListener("click", function () {
    map.getSource("selected").setData(turf.featureCollection([]));
  })
}