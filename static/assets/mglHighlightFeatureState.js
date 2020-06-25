let highlightFeature = {};

function mglHighlightFeatureState(map, layer, source) {
  // console.log(highlightFeature)
  /**
   * ONLY ADD DOCUMENT AND WINDOW EVENT LISTENERS ONCE
   */
  if (highlightFeature.id != 0) {
    document.addEventListener("click", function(e) {
      if (e.target.classList.contains("mapboxgl-popup-close-button")) {
        if (!document.querySelector(".mapboxgl-pop-close-button")) highlightClearFeatureState(map)
      }
    });

    window.addEventListener("hashchange", function() {
      if (window.location.hash === "#close") highlightClearFeatureState(map)
    })
  }

  highlightFeature.id = 0;

  const originId = layer.id + "";

  if (layer.type != "fill") return

  layer.id = "highlight__" + layer.id;
  layer.source = layer.id;
  layer.type = "line";
  layer.paint = {
    "line-color": [
      'case',
      ['boolean', ['feature-state', 'highlight'], false],
      "yellow",
      "transparent"
      ],
     "line-width": [
      'case',
      ['boolean', ['feature-state', 'highlight'], false],
      5,
      0
      ] 
  };
  layer.layout.visibility = "visible"

  map.addSource(layer.id, source)

  map.addLayer(layer);

  initHighlight(map, {layers: [originId]})
}

function highlightSetFeatureState(map, feature) {

  highlightFeature = feature;
  // console.log("setting feature state of ", highlightFeature.id)

  map.setFeatureState(
    {
      source: "highlight__" + feature.layer.id,
      sourceLayer: feature.sourceLayer,
      id: feature.id
    },
    {
      highlight: true
  });

}

function highlightClearFeatureState(map) {
  // console.log("clearing feature state of ", highlightFeature.id)
  if (highlightFeature.id) {
    map.setFeatureState(
      {
        source: "highlight__" + highlightFeature.layer.id,
        sourceLayer: highlightFeature.sourceLayer,
        id: highlightFeature.id
      },
      {
        highlight: false
    })
  }
}

function initHighlight(map, layers) {
  map.on("click", function(e) {
    console.log("click")
    var features = map.queryRenderedFeatures(e.point, layers);

    highlightClearFeatureState(map)

    if (features.length) {
      // console.log(features[0])
      highlightSetFeatureState(map, features[0]);
    }
  })
}

export {
  mglHighlightFeatureState  
}