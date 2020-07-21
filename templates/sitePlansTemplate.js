// TODO add map of points
// TODO add edit for single point

function siteplans(data, v, error) {
  console.log(data)
  return `<!doctype html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Site Plan List</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/wingcss/0.1.9/wing.css" />
    <style>
    html, body {
      margin: 0;
    }
    * {
      font-family: -apple-system, BlinkMacSystemFont, Avenir, "Avenir Next",
    "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans",
    "Droid Sans", "Helvetica Neue", sans-serif;
    }
    .container {
      max-width: 95%;
    }
    .col, .col-3, .col-8, .col-9 {
      border: solid 2px #121212;
    }
    .col {
      overflow: auto;
    }
    </style>
  </head>
  <body>
  <div class="row">
  <div class="col-3">
  <form method="post" action="/site-plans">
    ${data.map((d,i) => {
      var keys = Object.keys(d);
      var values = Object.values(d)
      if (i === 0) {
        return `
            ${keys.map(k => `
              <label>${k}</label>
              <input id="${k}" type="text" name="${k}" value=${(!values) ? "" : `${values[k]}`}></input>
            `).join('')}
          <tr>`
      }
    }).join('')}
    <label for="x">X</label>
    <input id="x" name="x" type="text"></input>
    <label for="y">Y</label>
    <input id="y" name="y" type="text"></input>
    <button type="submit">Submit</button>
  </form>
  </div>
  <div class="col">
  MAP
  </div>
  </div>
  <div class="row">
  <div class="col">
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
    </div>

    </div>
  </body>
  </html>
  `
}

module.exports = siteplans