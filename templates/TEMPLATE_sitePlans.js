const sitePlans = require('../templates/sitePlansTemplate.js');

module.exports = {
  method: 'GET',
  url : '/site-plans/',
  handler: function(req, res) {
    console.log(req.params)

    let title = (req.params.params === "sanitary-cleaning") ? "Sanitary Cleaning Map" : "Zoning Update Map";
    let app = (req.params.params === "sanitary-cleaning") ? "sanitary-cleaning-app.js" : "zoning-update-app.js"

    let html = mapTemplate(title, app)
    res.type("text/html")
    res.send(html)

  }
}