module.exports = {
  method: "GET",
  url: "/site-plans",
  handler: function (req, res) {
    var query = (!req.query.table) ? {table: "eng_site_plans"} : req.query;
    var tables = [
      "eng_site_plans"
    ]
    if (!query.table || tables.indexOf(query.table) < 0) {
      res.type("contentType:html")
      .send(require('../templates/sitePlansTemplate')([], null, {error: "No table defined in query parameters or table does not exist"}));
      return
    }

    console.log(query)

    this.pg.query(`SELECT * FROM ${query.table} ORDER BY id ASC`, (err, data) => {
      if (err) {
        this.log.error(err);
      }

      data.rows.map(r => {
        delete r.geom
        return r
      })

      res.status(200)
      .type("contentType:html")
      .send(require('../templates/sitePlansTemplate')(data.rows))
    })
  }
}