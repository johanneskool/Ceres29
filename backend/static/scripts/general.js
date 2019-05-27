//Rink Pieters

//Changing filename (we already use jQuery so why don't we do it easy)
$(document).on('change', '.custom-file-input', function (event) {
    $(this).next('.custom-file-label').html(event.target.files[0].name);
});

function errorMessage(errorMessage, type='danger') {
    console.log("Error of type " + type + ": " + errorMessage);
    let div = document.getElementById("divErrorMessages");
    let message = document.createElement("div");
    message.setAttribute("class", "alert alert-" + type + " alert-dismissable fade show");
    message.innerHTML = `
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>` + errorMessage; //just a little faster and uglier than doing it with DOM
    div.appendChild(message);
}
