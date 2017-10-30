/*****************************************************************************************************
    guest_player.js

    This js file is to assist control the local game as a guest player has not registered and there 
    is no easy way to control the behaviour from the server end
*****************************************************************************************************/


$(function () {
    $("#localgame").on("click", function () {
        var url = "/Home/LocalGame?uniqueId=" + currentPlayerUniqueId;
        window.location = url;
    });
});

