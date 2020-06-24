const uuidv1 = require('uuid/v1')

module.exports = {
  method: 'POST',
  url : '/coz/sanitary-cleaning',
  handler: function(req, res) {
    console.log(req) 

    if (!req.headers.authorization) {
      res.status(500)
      res.send("error")
      return
    }

    var r = req.body;
    console.log(r)
    var uuid = `{${uuidv1()}}`

    if (!r.pipe_id || !r.pipe_uuid || !r.pipe_fieldid) {
      res.status(500)
      res.send("error");
      return
    }

    this.pg.transact(client => {
      return client.query(`INSERT INTO utl_sanitary_lines_cleaning (date, pipe_id, pipe_uuid, pipe_fieldid, uuid) VALUES($1, $2, $3, $4, $5) RETURNING id`, [new Date(), r.pipe_id,  r.pipe_uuid, r.pipe_fieldid, uuid])
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