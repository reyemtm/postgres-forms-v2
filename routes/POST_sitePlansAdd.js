module.exports = function (fastify, opts, next) {

  fastify.post('/site-plans', function(req, res) {

    return this.pg.transact(async client => {
      var r = req.body;

      /*
      MOVE ALL VERIFICATION TO CLIENT SIDE BUT KEEP THIS HERE FOR SQL INJECTION*/
      var x = Number(r.x);
      var y = 0 + Number(r.y);

      if (typeof(x) != "number" || typeof(y) != "number" || Number.isNaN(x) || Number.isNaN(y)) {
        res.send(`error ${x} ${y}`)
        return
      }

      await client.query(`INSERT INTO eng_site_plans (title, description, geom) VALUES($1,$2, ST_GeomFromText('Point(${x} ${y})', 4326) ) RETURNING id`, [r.title, r.description])

      res.redirect('/site-plans?table=eng_site_plans')

    })
  })
  next()
}
