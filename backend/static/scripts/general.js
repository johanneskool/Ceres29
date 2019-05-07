//Rink Pieters

//Changing filename (we already use jQuery so why don't we do it easy)
$(document).on('change', '.custom-file-input', function (event) {
    $(this).next('.custom-file-label').html(event.target.files[0].name);
})
