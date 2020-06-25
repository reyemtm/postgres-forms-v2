const uuidv1 = require('uuid/v1')
const env = require("dotenv").config().parsed

module.exports = {
  method: 'POST',
  url : '/sanitary-cleaning',
  handler: function(req, res) {
    // console.log(req) 

    if (env.ENVIRONMENT === "PRODUCTION") {
      if (!req.headers.authorization) {
        res.status(500)
        res.send("error")
        return
      }
    }

    var r = req.body;
    var uuid = `{${uuidv1()}}`

    if (!r.pipe_id || !r.pipe_uuid || !r.pipe_fieldid) {
      res.status(500)
      res.send("error");
      return
    }

    var date = new Date(r.date2)

    this.pg.transact(client => {
      return client.query(`INSERT INTO utl_sanitary_lines_cleaning (date, pipe_id, pipe_uuid, pipe_fieldid, uuid) VALUES($1, $2, $3, $4, $5) RETURNING id`, [date, r.pipe_id,  r.pipe_uuid, r.pipe_fieldid, uuid])
    },

    function onResult (err, result) {
      if (err) {
        console.log(err)
        res.send(err)
      }
      res.send(result)
    })
  }
}