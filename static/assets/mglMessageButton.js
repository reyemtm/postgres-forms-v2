class mglMessageButton {

  constructor(options) {
    console.log(options)
    options.title = (!options.title) ? "Welcome" : options.title
    options.message = (!options.message) ? "This is a description." : options.message
    this.onAdd = function (map) {
      console.log(this);
      //CREATE WELCOME MESSAGE MODAL

      function mglMessageButtonModal () {
        let modal = document.createElement("div");
        modal.classList = "modal"
        modal.id = "welcome"
        let html = `
          <a href="#close" class="modal-overlay" aria-label="Close"></a>
          <div class="modal-container">
            <div class="modal-header">
              <a href="#close" class="btn btn-clear float-right" aria-label="Close"></a>
              <div class="modal-title h5">${options.title}</div>
            </div>
            <div class="modal-body">
              <div class="content" style="text-align: justify">
                ${options.message}
              </div>
            </div>
            <div class="modal-footer">
            </div>
          </div>`
          modal.innerHTML = html;
          document.body.appendChild(modal);
      }

      this._map = map;
      this._btn = document.createElement('button');
      this._btn.id = "mglMessageButton";
      this._btn.type = 'button';
      this._btn.innerHTML = '&#x3f;';
      this._btn.style.fontWeight = 'bold';
      this._btn.style.fontSize = '1.2rem';
      this._btn['aria-label'] = 'Show Welcome Message';
      this._btn.onclick = function () {
        if (!document.querySelector("#welcome")) mglMessageButtonModal()
        window.location.hash = "#welcome";
      };
      this._container = document.createElement('div');
      this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
      this._container.appendChild(this._btn);
      return this._container;
    };

    this.onRemove = function () {
      this._container.parentNode.removeChild(this._container);
      this._map = undefined;
    };
  }
}

export {
  mglMessageButton
}