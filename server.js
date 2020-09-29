const env = require("dotenv").config().parsed
const fs = require("fs");

if (env.ENVIRONMENT === "DEVELOPMENT") {
  console.log("Starting app using the following env varibales \n", env)
}

if (!env.DB || !env.ENVIRONMENT) throw new Error("missing database connection string or other environment variable")

const PORT = (!env.PORT) ? 8080 : env.PORT;
const DB = env.DB;
const path = require('path');

const fastify = require("fastify")({
  logger: (env.ENVIRONMENT === "DEVELOPMENT") ? {
    prettyPrint: true,
    level: "info"
  } : {
    prettyPrint: true,
    level: "error"
  },
  ignoreTrailingSlash: false
})
.register(require('fastify-file-upload'))
.register(require('fastify-formbody'))
.register(require('fastify-postgres'), {
  connectionString: DB
})

.register(require('fastify-knex'), {
  client: 'pg',
  debug: true,
  connection: DB
})

//COMPRESS NEEDS LOADED BEFORE AUTOLOAD TO ENABLE FOR THE ROUTES
.register(require('fastify-compress'), 
  { 
    threshold: 256,
    encodings: ['deflate', 'gzip']
  }
)

.register(require("fastify-autoload"), {
  dir: path.join(__dirname, 'routes')
  // options: {
  //   prefix: "/apps/"
  // }
})
.register(require('fastify-static'), {
  root: path.join(__dirname, 'static'),
  // prefix: "/apps/",
  redirect: false
});

fastify.setNotFoundHandler(function(request, reply) {
  reply.type("text/html")
  reply.send(fs.readFileSync('static/404.html'))
});

fastify.listen(PORT, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1)
  }
  console.log(`server listening on ${address}`) 
})