const sitePlansTemplate = require('../templates/sitePlansTemplate');

module.exports = function getTableRoute(req, res) {
  var query = req.query;
  var tables = [
    "eng_site_plans",
    "utl_sanitary_lines_cleaning"
  ]
  if (!query.table || tables.indexOf(query.table) < 0) {
    res.status(404)
    .send('error');
    return
  }
  var now = Date.now();

  this.pg.query(`SELECT * FROM ${query.table} ORDER BY id ASC`, (err, data) => {
    if (err) {
      this.log.error(err);
    }
    var plans = data.rows.map(r => {
      delete r.geom
      return r
    })
    var then = Date.now() - now;
    res.status(200)
    .type("contentType:html")
    .send(sitePlansTemplate(data.rows, then))
  })
}
