const fs = require("fs");
const svgexport = require("svgexport");

const directory = "C:/Users/malcolm.meyer/Documents/GitHub/postgres-forms-v2/static/vendor/mapillary_sprite_source-master/package_objects/"
const icons = fs.readdirSync(directory);

const iconsObject = []
const svgObject = [];

icons.forEach(icon => {
  const png = icon.replace("svg", "png")
  iconsObject.push({
    name: icon.replace(".svg", ""),
    url: "../assets/mapillary-icons/" + png
  });

  svgObject.push({
    input: directory + icon,
    output: "static/assets/mapillary-icons/" + png
  })
})

svgexport.render(svgObject, function(e) {
  console.log(e);
  fs.writeFileSync("static/assets/mapillary-icons/mapillary-icons.json", JSON.stringify(iconsObject,0,2))
})