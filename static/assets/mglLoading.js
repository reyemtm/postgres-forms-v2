var loaded = (typeof (Event) === 'function') ? new Event('mgl-loaded') : new CustomEvent('mgl-loaded')
var loading = (typeof (Event) === 'function') ? new Event('mgl-loading') : new CustomEvent('mgl-loading')

function addLoading(el, classname) {
  // console.log("adding")
  if (el) el.classList.add(classname)
}

function removeLoading(el, classname) {
  // console.log("removing")
  if (el) el.classList.remove(classname)
}

function checkLoading() {
  if (!this.loaded() || !this.areTilesLoaded()) {
    document.dispatchEvent(loading);
    return
  }
  document.dispatchEvent(loaded);
  // console.log('mgl-loaded');
}

function mglLoading (map, id, classname) {
  var el = (!document.getElementById(id)) ? 0 : document.getElementById(id);
  map.on('render', checkLoading);

  document.addEventListener("mgl-loading", function() {
    addLoading(el, classname)
  })
  
  document.addEventListener("mgl-loaded", function() {
    removeLoading(el, classname)
  })
}

export {
  mglLoading
}