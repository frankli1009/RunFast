// Consts

var HelperConsts = {
    STORAGE_NOT_SUPPORTED: "STORAGE_NOT_SUPPORTED"
};

// Object helper

// Get the type name of an object 
// Due to an error occurs in jquery when adding the function to the prototype of the Object,
// change it to a global function
// (Error in jquery: TypeError: matchExpr[type].exec is not a function)
function getObjectTypeName(obj) {
    var funcNameRegex = /function (.{1,})\(/;
    var results = (funcNameRegex).exec(obj.constructor.toString());
    return (results && results.length > 1) ? results[1] : "";
};
//Object.prototype.getObjectTypeName = function () {
//    var funcNameRegex = /function (.{1,})\(/;
//    var results = (funcNameRegex).exec((this).constructor.toString());
//    return (results && results.length > 1) ? results[1] : "";
//};

// Array helper

// Move an item in an array from oldIndex to newIndex
Array.prototype.move = function (oldIndex, newIndex) {
    if (newIndex >= this.length) newIndex = this.length - 1;
    this.splice(newIndex, 0, this.splice(oldIndex, 1)[0]);
    return this;
}

// Cookie helper

// Set cookie
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// Get cookie
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Storage helper

// Store
function saveToStorage(itemName, itemValue) {
    if (typeof (Storage) !== "undefined") {
        localStorage.setItem(itemName, itemValue);
        return true;
    } else return false;
}

// Retrieve
function readFromStorage(itemName) {
    if (typeof (Storage) !== "undefined") {
        return localStorage.getItem(itemName);
    } else return HelperConsts.STORAGE_NOT_SUPPORTED;
}

// Set start flag
function setStartFlag(flag) {
    saveToStorage("Started", flag);
    setCookie("Started", flag, 365);
}

// Get start flag
function getStartFlag() {
    var flag = readFromStorage("Started");
    if (flag !== "0" && flag !== "1") {
        flag = getCookie("Started");
    }
    console.log("start flag");
    console.log(flag);
    return flag;
}

// Download data to local file

// Function to download data to a file
function download(data, filename, type) {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}
