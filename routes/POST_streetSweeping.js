const env = require("dotenv").config().parsed
const proj4 = require('proj4');
const fs = require("fs");
const { REFUSED } = require("dns");

module.exports = {

  method: 'POST',
  url: '/street-sweeping',
  handler: function (req, res) {

    if (env.ENVIRONMENT === "PRODUCTION") {
      if (!req.headers.authorization) {
        res.status(500)
        res.send("error")
        return
      }
    }

    if (!req.body.ids || !req.body.date) {
      res.status(500)
      res.send({
        error: "Missing date or selected roads."
      })
      return
    }

    const ids = req.body.ids.split(",")

    const insert = ids.reduce((i, id) => {
      return [...i, {street_id: id, date: req.body.date}]
    }, [])

    this.knex('utl_streets_sweeping_tracker')
      .insert(insert, 'street_id')
      .then(result => {
        //STATUS SUCCESS
        res.status(200)
        .header('Content-Type', 'application/json; charset=utf-8')
        //SEND UPDATED IDS AND DATE SWEPT
        res.send({
          ids: result,
          date: req.body.date
        })
      })
      .catch(err => {
        res.status(400)
        res.send({
          error: err
        })
      })
  }
}
