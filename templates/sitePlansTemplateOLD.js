// TODO add map of points
// TODO add edit for single point

function homepage(data, time) {
  return `<!doctype html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Site Plan List</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/wingcss/0.1.9/wing.css" />
    <style>
    * {
      font-family: -apple-system, BlinkMacSystemFont, Avenir, "Avenir Next",
    "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans",
    "Droid Sans", "Helvetica Neue", sans-serif;
    }
    </style>
  </head>
  <body>
  <section class="container">
    <table>${data.map((d,i) => {
      var keys = Object.keys(d);
      var values = Object.values(d);
      if (i === 0) {
        return `
          <tr>
            ${keys.map(k => `<th>${k}</th>`).join('')}
          </tr>
          <tr>
            ${values.map(v => `<td>${v}</td>`).join('')}
          </tr>`
      }else{
        return `
        <tr>
          ${values.map(v => `<td>${v}</td>`).join('')}
        </tr>`
      }
    }).join('')}</table>
    </section>
    <script>
    console.log(${time})
    </script>
  </body>
  </html>
  `
}

module.exports = homepage
