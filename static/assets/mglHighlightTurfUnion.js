import { union } from "./turf.es.min.js"

function highlight(map, features) {
  
  if (!union(...features)) return
  
  if (!map.getSource("highlightSource")) {
    map.addSource("highlightSource", {
      type: "geojson",
      // data: union(...features)
      data: {
        type: "FeatureCollection",
        features: [...features]
      }
    })

    map.addLayer({
      id: "highlightLayer",
      type: "line",
      source: "highlightSource",
      paint: {
        "line-color": "yellow",
        "line-width": 4
      }
    })

  } else {
    map.getSource("highlightSource").setData(union(...features))
  }
}

function highlightClear(map) {

  if (!map.getSource("highlightSource")) {

  } else {
    map.getSource("highlightSource").setData({
      type: "FeatureCollection",
      features: []
    })
  }
}

export {
  highlight, highlightClear  
}