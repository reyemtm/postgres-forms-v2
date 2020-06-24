const form = require('../templates/sitePlansFormTemplate');

module.exports = {
  method: "GET",
  url: "/site-plans-form",
  handler: function (req, res) {
    var now = Date.now()
    this.pg.query("SELECT * FROM eng_site_plans ORDER BY id ASC", (err, data) => {
      if (err) {
        console.log(err)
      }
      var plans = data.rows.map(r => {
        delete r.geom
        return r
      })
      var then = Date.now() - now;
      res.status(200)
      .type("contentType:html")
      .send(form(plans, then, plans[0]))
    })
  }
}