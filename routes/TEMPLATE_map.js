function mapTemplate(title, app) {
  //BASIC HTML TEMPLATE WITH MAPBOX, MAPBOX CONTROLS, MAPBOX DRAW, TURF JS, SPECTRE CSS, AND MOMENT
  return `
    <!DOCTYPE html>
    <html lang="en">

    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
      <title>${title}</title>

      <script src="../vendor/mapbox-gl-js/v1.10.1/mapbox-gl.js"></script>
      <link href="../vendor/mapbox-gl-js/v1.10.1/mapbox-gl.css" rel="stylesheet" />
      <script src="../vendor/mapbox-gl-geocoder/v4.4.2/mapbox-gl-geocoder.min.js"></script>
      <link rel="stylesheet" href="../vendor/mapbox-gl-geocoder/v4.4.2/mapbox-gl-geocoder.css" type="text/css" />

      <script src="https://cdn.jsdelivr.net/npm/@turf/turf@5/turf.min.js"></script>
      <script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.2.0/mapbox-gl-draw.js"></script>
      <link
      rel="stylesheet"
      href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.2.0/mapbox-gl-draw.css"
      type="text/css"
      />

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css" />
      <link rel="stylesheet" href="../vendor/mapbox-layer-control-master/layerControl.css">
      
      <link rel="stylesheet" href="../vendor/spectre-master/dist/spectre.min.css">
      <!-- <link rel="stylesheet" href="../vendor/spectre-master/dist/spectre-exp.min.css"> -->
      <link rel="stylesheet" href="../vendor/spectre-master/dist/spectre-icons.min.css">

      <link href="../vendor/mapbox-gl-controls/theme.css" rel="stylesheet">

      <link rel="stylesheet" href="../assets/style.css" />
    </head>

    <body>
      <div id="loading" class="loading"></div>
      <div id="sidebar" style="display:none;"></div>
      <main id="map"></main>
      <!-- <script src="https://unpkg.com/dexie@latest/dist/dexie.js"></script> -->
      <script src="../vendor/moment.min.js"></script>
      <script src="../apps/${app}" type="module"></script>
    </body>

    </html>
  `
}


module.exports = {
  method: 'GET',
  url : '/:params/',
  handler: function(req, res) {
    console.log(req.params)

    const apps = ["sanitary-cleaning", "zoning-updates", "site-plans", "street-sweeping"];
    if (apps.indexOf(req.params.params) > -1) {
      res.type("text/html")
      res.send(mapTemplate(req.params.params.toUpperCase().split("-").join(" "), req.params.params + "-app.js"))
    }else{
      res.code(404)
      res.send()
    }
  }
}