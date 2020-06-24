class welcomeMessageButton {

  constructor(options) {
    console.log(options)
    this.options = {
      modalTitle: (!options.modalTitle) ? "Modal" : options.modalTitle
    };

    this.onAdd = function (map) {
      console.log(this);
      //CREATE WELCOME MESSAGE MODAL

      (function welcomeMessageModal () {
        return `
        <div class="modal" id="welcomeMessageModal">
          <a href="#close" class="modal-overlay" aria-label="Close"></a>
          <div class="modal-container">
            <div class="modal-header">
              <a href="#close" class="btn btn-clear float-right" aria-label="Close"></a>
              <div class="modal-title h5">${this.options.modalTitle}</div>
            </div>
            <div class="modal-body">
              <div class="content" style="text-align: justify">
                ${this.options.modalDescription}
              </div>
            </div>
            <div class="modal-footer">
            </div>
          </div>
        </div>`
      })()

      this._map = map;
      this._btn = document.createElement('button');
      this._btn.id = "welcomeMessageButton";
      this._btn.type = 'button';
      this._btn.innerHTML = '&#x3f;';
      this._btn.style.fontWeight = 'bold';
      this._btn.style.fontSize = '1.2rem';
      this._btn['aria-label'] = 'Show Welcome Message';
      this._btn.onclick = function () {
        // if (document.querySelector("#welcomeMessageModal")) welcomeMessageModal()
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
  welcomeMessageButton
}