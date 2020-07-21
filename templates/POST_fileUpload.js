module.exports = function (fastify, opts, next) {
  fastify.post('/upload', function (req, reply) {
    // some code to handle file
    const files = req.raw.files[0]
    // console.log(files)
    // let fileArr = []
    // for(let key in files){
    //   fileArr.push({
    //     name: files[key].name,
    //     mimetype: files[key].mimetype
    //   })
    // }
    // reply.send(fileArr)
    files.mv('../../data/site-plans', function(err) {
      if (err)
        return reply.status(500).send(err);

      reply.status(200);
      reply.send();
    });
  })
  next()
}