const env = require("dotenv").config().parsed
const proj4 = require('proj4');
const fs = require("fs");

module.exports = {

  method: 'POST',
  url: '/site-plans',
  handler: function (req, res) {

    if (env.ENVIRONMENT === "PRODUCTION") {
      if (!req.headers.authorization) {
        res.status(500)
        res.send("error")
        return
      }
    }

    let filename = (!req.body.filename) ? null : req.body.filename;

    if (req.body.file) {
      const file = req.body.file;
      filename = (!filename) ? req.body.file.name : filename;
      try {
        fs.writeFileSync('/inetpub/wwwroot/data/site-plans/' + file.name, file.data)
      }catch(err) {
        throw new Error(err)
      }
    }

    this.pg.transact(client => {
      var r = req.body;

      console.log(r)

      if (Number(r.id) > 0) {
        return client.query(`
          UPDATE eng_site_plans
          SET title = $2, address = $3, year = $4, date_approved = $5, filename = $6
          WHERE id = $1
          RETURNING id
        `,[r.id, r.title, r.address, r.year, r.date_approved, filename]
        )

      }

      if (r.id === "-1") {
        throw new Error("error 2")

      }

      if (r.id === "0") {
      
        /*MOVE ALL VERIFICATION TO CLIENT SIDE BUT KEEP THIS HERE FOR SQL INJECTION*/
        var x = Number(r.x);
        var y = Number(r.y);

        if (typeof(x) != "number" || typeof(y) != "number" || Number.isNaN(x) || Number.isNaN(y)) {
          throw new Error("error no coordinates")
        }

        var transformation = '+proj=lcc +lat_1=40.03333333333333 +lat_2=38.73333333333333 +lat_0=38 +lon_0=-82.5 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=-0.9956,1.9013,0.5215,0.025915,0.009246,0.011599,-0.00062 +units=us-ft +no_defs'

        console.log("adding site plan")

        var coords = proj4(transformation, [x,y]);

        console.log(coords)

        return client.query(`INSERT INTO eng_site_plans (title, parcelnum, address, year, date_approved, filename, geom) VALUES ($1, $2, $3, $4, $5, ST_GeomFromText('Point(${coords[0]} ${coords[1]})', 3735) ) RETURNING id`, [r.title, r.parcelnum, r.address,  r.year, r.date_approved, filename])

      }

    },
    function onResult (err, result) {
      if (err) {
        console.log(err)
        res.send(err)
      }
      console.log(result)
      res.send(result)
    })
  }
}
