const env = require("dotenv").config().parsed

module.exports = {
  method: 'POST',
  url : '/zoning-updates',
  handler: function(req, res) {
    if (env.ENVIRONMENT === "PRODUCTION") {
      if (!req.headers.authorization) {
        res.status(500)
        res.send("error")
        return
      }
    }

    var r = req.body;
    console.log(r)
    
    this.pg.transact(client => {
      if (Number(r.id) > 0) {
        r.id = Number(r.id);
        console.log("updating via id")
        return client.query(`
        UPDATE dev_zoning_table SET edit_date = $2, zoning_code = $3, zoning_ord = $4, zoning_ord_date = $5, zoning_ord_text = $6, zoning_notes = $7
        WHERE id = $1
        RETURNING id`,
        [r.id, new Date(), r.zoning_code, r.zoning_ord, r.zoning_ord_date, r.zoning_ord_text, r.zoning_notes])
        return
      }
      
      if (r.id === "-1") {
        console.log("updating via parcelnum")
        return client.query(`
        UPDATE dev_zoning_table SET edit_date = $2, zoning_code = $3, zoning_ord = $4, zoning_ord_date = $5, zoning_ord_text = $6, zoning_notes = $7
        WHERE parcelnum = $1
        RETURNING id`,
        [r.parcelnum, new Date(), r.zoning_code, r.zoning_ord, r.zoning_ord_date, r.zoning_ord_text, r.zoning_notes])
        return
      }

      if (r.id === "0") {
        console.log("adding new")
        return client.query(`
        INSERT INTO dev_zoning_table (parcelnum, parcel_address, edit_date, zoning_code, zoning_ord, zoning_ord_date, zoning_ord_text, zoning_notes)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`, 
        [r.parcelnum, r.parcel_address, new Date(), r.zoning_code, r.zoning_ord, r.zoning_ord_date, r.zoning_ord_text, r.zoning_notes])
      }

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