function createFormFields(schema) {
  let html = "";
  for (let s in schema) {
    html += `
    <div class="form-group">
      <label for="${s}">${schema[s].name}</label>
      ${(!schema[s].options) 
          ?
        `<input class="form-input" id="${s}" type="${schema[s].type}" name="${s}"  ${(!schema[s].readonly) ? '' : 'readonly="true"'} ${(!schema[s].required) ? '' : 'required="true"'}>`
          :
        `<select id="${s}" class="form-select" name="${s}" ${(!schema[s].required) ? '' : 'required="true"'}>
          ${schema[s].options.map(o => {
            return `<option>${o}</option>`
          })}
         </select>`
      }
    </div>
    `
  }
  return html
}

//TODO MAKE A BUTTON THAT WOULD TOGGLE EDITING OF THE ZONING INFORMATION ON EXISTING RECORDS
function inputFormModal(schema) {
  if (!document.getElementById("inputFormModal")) {
    let modal = document.createElement("div");
    modal.classList = "modal input-modal";
    modal.id = "inputFormModal";
    modal.innerHTML = `
      <a href="#close" class="modal-overlay" aria-label="Close"></a> 
      <div class="modal-container"> 
        <!--div class="modal-header"> 
          <a href="#close" class="btn btn-clear float-right" aria-label="Close"></a> 
        </div--> 
        <div class="modal-body"> 
          <div class="content"> 
            <form action="#" method="post"> 
              ${createFormFields(schema)}
              <div class="form-group"> 
                <br> 
                <input class="btn btn-primary float-left" style="width:auto" type="submit" data-submit="true" value="Submit Edits"></input> 
                <a href="#close"><button class="btn btn-outline float-right" type="button">Cancel</button></a>
              </div> 
            </form> 
          </div> 
        </div> 
        <div class="modal-footer"> 
        </div> 
      </div>`
    document.body.appendChild(modal);
  }
}

function inputFormModalShow() {
  window.location.hash = "#inputFormModal"
}

function inputFormModalReset(form) {
  window.location.hash = "#"
  let inputs = form.querySelectorAll("input");
  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].dataset.submit != "true") inputs[i].value = "";
  }
}

export {
  inputFormModal,
  inputFormModalReset,
  inputFormModalShow
}