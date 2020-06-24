// TODO add map
// TODO add requires for all
// TODO add parcel list
// TODO add file upload for form

function form(data, values, error) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Site Plan List</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/wingcss/0.1.9/wing.css" />
  </head>
  <body>
  <section class="container">
    <form method="post" action="/add-site-plan">
      ${data.map((d,i) => {
        var keys = Object.keys(d);
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
    </section>
    <script>
    </script>
  </body>
  </html>
  `
}

module.exports = form