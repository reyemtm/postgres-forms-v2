const dbgeo = require('dbgeo')

//TODO parametize SELECT queries or change pg to viewer and editor

module.exports = function (fastify, opts, next) {

  fastify.get('/get-table', function (req, res) {

    // console.log(req.body)
    // console.log(req.query)
    // console.log(req.params)
    // console.log(req.headers)
    // console.log(req.raw)
    // console.log(req.id)
    // console.log(req.ip)
    // console.log(req.ips)
    // console.log(req.hostname)

    var query = req.query;
    var geojson = (!req.query.format) ? false : (req.query.format === "geojson") ? true : false;
    var tables = [
      "eng_site_plans",
      "utl_sanitary_lines_cleaning",
      "utl_sanitary_lines",
      "dev_zoning_table",
      "adm_mus_parcels",
      "trn_mus_centerlines",
      "utl_streets_sweeping_tracker",
      "adm_mus_parcels",
      "eng_gis_apps_config"
    ]
    if (!query.table || tables.indexOf(query.table) < 0) {
      res.status(404)
      .send('error');
      return
    }

    var transformation = '+proj=lcc +lat_1=40.03333333333333 +lat_2=38.73333333333333 +lat_0=38 +lon_0=-82.5 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=-0.9956,1.9013,0.5215,0.025915,0.009246,0.011599,-0.00062 +units=us-ft +no_defs'

    if (geojson) {
      this.pg.query(`SELECT *, ST_Transform(geom, '${transformation}', 4326) as geometry FROM ${query.table} ${(!query.where) ? "" : `WHERE ${query.where}`} ORDER BY id ASC LIMIT 20000`, (err, data) => {
        if (err) {
          this.log.error(err);
          res.status(404);
          res.send(err);
          return
        }
        dbgeo.parse(data.rows, {
          outputFormat: 'geojson',
          geometryColumn: 'geometry'
        }, (err, result) => {
          if (err) {
            res.status(200)
            .type("contentType:application/json")
            res.send({
              type: "FeatureCollection",
              features: []
            })
          }
          result.features.map((f,i) => {
            f.id = i+1
          })
          res.status(200)
          .type("contentType:application/json")
          .send(result)
        })
      })
    }else{
      if (query.where || query.fields) {
        console.log(query)
        this.pg.query(`SELECT ${(!query.fields) ? "*" : `${query.fields}`} FROM ${query.table} ${(!query.where) ? "" : `WHERE ${query.where}`} ORDER BY id ASC`, (err, data) => {
          if (err) {
            this.log.error(err);
            res.status(404);
            res.send(err);
            return
          }
          res.status(200)
          .type("contentType:application/json")
          .send(data.rows)
        })
      }else{
        this.pg.query(`SELECT * FROM ${query.table} ORDER BY id ASC`, (err, data) => {
          if (err) {
            this.log.error(err);
            res.status(404);
            res.send(err);
            return
          }
          res.status(200)
          .type("contentType:application/json")
          .send(data.rows)
        })
      }
    }
  })
  
  next()

}