$(function () {
    $("#localgame").on("click", function () {
        var url = "/Home/LocalGame?uniqueId=" + currentPlayerUniqueId;
        window.location = url;
    });
});

