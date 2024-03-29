//Rink Pieters

//Function when selecting a new file
$(document).on('change', '.custom-file-input', function (event) {
    $("#fileinputNote").html(null);
    if (event.target.files.length == 0) {
        $(this).next('.custom-file-label').html("No file selected");
        $(this).addClass("is-invalid");
        $(this).removeClass("is-valid");
        $("#fileinputNote").append(document.createTextNode("Please select a file using \"Browse\" and click on \"Upload\" to upload your file"));
    } else {
        $(this).next('.custom-file-label').html(event.target.files[0].name);
        $(this).addClass("is-valid");
        $(this).removeClass("is-invalid");
        if (event.target.files[0].size > 7.5e6) $("#fileinputNote").append(document.createTextNode("The file you have selected has a size of " + formatBytes(event.target.files[0].size) + ". Please note that it might take a while to process your file depending on the current server load."));
        console.log(event.target.files[0]);
        console.log(this);
    }
});

//Custom error message shower
//Input:  string errorMessage
//        string type (one of "info", "warning", "danger", "success", "message")
function errorMessage(errorMessage, type='danger') {
    let div = document.getElementById("divErrorMessages");
    let message = document.createElement("div");
    message.setAttribute("class", "alert alert-" + type + " alert-dismissable fade show");
    message.innerHTML = `
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>` + errorMessage; //just a little faster and uglier than doing it with DOM
    div.appendChild(message);
    if (type == 'danger') {
      console.error("Danger: " + errorMessage);
    } else if (type == "warning") {
      console.warn("Warning: " + errorMessage);
    } else {
      console.info(type.charAt(0).toUpperCase() + type.slice(1) + ": " + errorMessage);
    }
}

function updateOrderingOptions(vistype_select) {
    let type = vistype_select.value;
    let ordering_element = vistype_select.nextElementSibling; //get the ordering selector
      //ordering_element = document.getElementById("sel_clustering")
      //['default', 'pagerank', 'cluster', 'lexicographic', 'cluster_graph', 'degrees', 'betweenness']
    if (type == "matrix") {
        enableOrderings();
    } else if (type == "forceLink") {
        enableOrderings(['default', 'cluster_graph']);
    } else if (type == "roundNodeLink") {
        enableOrderings(['default', 'pagerank', 'cluster', 'cluster_graph', 'degrees', 'betweenness', 'fiedler']);
    } else if (type == "treeNodeLink") {
        enableOrderings(['n/a']);
    } else {
        enableOrderings();
        throw "Unknown ordering type. Showing all options.";
    }

    //only used in updateOrderingOptions
    //required arguments: select_element and enabled items
    function enableOrderings(enabled_orderings = null) {
        //ordering_element.style.display = null;
        ordering_element.removeAttribute("disabled");
        for (let child of ordering_element.children) {
            if ((enabled_orderings == null || child.value == "" || enabled_orderings.includes(child.value)) && child.value != "n/a") {
              child.hidden = false;
            }
            else child.hidden = true;
        }
        if (ordering_element.selectedOptions[0].hidden == true) {
            let count = 0;
            for (let child of ordering_element.children) {
                if (child.hidden == false && child.value != "") {
                    count += 1;
                    ordering_element.value = child.value;
                }
            }
            console.log(count);
            if (count == 0) {
                //ordering_element.style.display = 'none';
                ordering_element.setAttribute("disabled", null);
                ordering_element.value = "n/a";
            }
        }
    }
}

//Custom feedback for input checks
function checkInput(element) {
    if (!element.checkValidity()) {
      element.classList.add("is-invalid");
      element.classList.remove("is-valid");
    } else {
      element.classList.add("is-valid");
      element.classList.remove("is-invalid");
    }
}

$(document).on('change', '.custom-select', function (event) {
    checkInput(this);
});

// Copied from https://stackoverflow.com/a/18650828/6367506
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function visReorder(element) {
    updateLoadingState(true);
    GVH.updateData("/data/" + data_id + "?type=" + element.value);
}

function updateLoadingState(isLoading) {
    Array.prototype.forEach.call(document.getElementsByClassName("disabled-when-loading"), function(element) {
        if (isLoading == true) {
            element.setAttribute("disabled", null);
        } else {
            element.removeAttribute("disabled");
        }
    });
    Array.prototype.forEach.call(document.getElementsByClassName("loading-overlay"), function(element) {
        if (isLoading == true) {
            element.style.display = null;
        } else {
            element.style.display = "none";
        }
    });
}

function toggleFullScreen(fullScreen = null) {
    let div = document.getElementById("divViewOptions");
    if (fullScreen == null) {
        if (document.fullscreenElement == null) toggleFullScreen(true);
        else toggleFullScreen(false);
        return true;
    } else if (fullScreen == true && document.fullscreenElement == null) {
        document.getElementsByTagName("main")[0].requestFullscreen();
    } else if (fullScreen == false && document.fullscreenElement != null) {
        document.exitFullscreen();
    }
    for (let child of div.children) {
        if (child.innerText == "Fullscreen" && fullScreen == true) child.style.display = 'none';
        else if (child.innerText == "Fullscreen" && fullScreen == false) child.style.display = 'inherit';
        else if (child.innerText == "Window mode" && fullScreen == true) child.style.display = 'inherit';
        else if (child.innerText == "Window mode" && fullScreen == false) child.style.display = 'none';
    }
    return true;
}
