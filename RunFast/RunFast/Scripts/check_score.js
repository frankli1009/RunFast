/*****************************************************************************************************
    check_score.js

    This js file is to assist to check the score that a player holds to decide whether the player can
    take a new game, used in Home page, Local Game page and Online Game page.
*****************************************************************************************************/

var currentPlayerUniqueId = ""; // The unique Id of the guest player

function refreshBtnState() {
    var $lesspoint = $("#lesspoint");
    if ($lesspoint.length) {
        if ($lesspoint.hasClass("nodisplay")) {
            if ($("#localgame").hasClass("disabled")) $("#localgame").removeClass("disabled");
            if ($("#onlinegame").hasClass("disabled")) $("#onlinegame").removeClass("disabled");
        } else {
            if (!$("#localgame").hasClass("disabled")) $("#localgame").addClass("disabled");
            if (!$("#onlinegame").hasClass("disabled")) $("#onlinegame").addClass("disabled");
        }
    }
}

$(function () {
    var uniqueId = readFromStorage("UniqueId");
    console.log("1");
    console.log(uniqueId);
    if (uniqueId === null || uniqueId === "" || uniqueId === HelperConsts.STORAGE_NOT_SUPPORTED) {
        uniqueId = getCookie("UniqueId");
        console.log("2");
        console.log(uniqueId);
        if (uniqueId !== "" && uniqueId !== null) {
            saveToStorage("UniqueId", uniqueId);
        }
    }
    if (uniqueId === null) uniqueId = "";
    currentPlayerUniqueId = uniqueId;
    console.log("3");
    console.log(uniqueId);

    if (getStartFlag() === "1" && currentPlayerUniqueId !== "") {
        var url = "/Home/LeaveGame?uniqueId="+currentPlayerUniqueId;
        $.post(
            url,
            null,
            function (data) {
                console.log(data);
                setStartFlag("0");
                var $score = $("#score");
                if ($score.length) {
                    $score.text(data.Score);
                }
                if (data.Score < 50) {
                    var $lesspoint = $("#lesspoint");
                    if ($lesspoint.length) {
                        if (data.Score < 2) $score.text(data.Score + " point");
                        else $score.text(data.Score + " points");
                        if (parseInt(data.CanGetAid) === 0) {
                            if (!$("#aid").hasClass("nodisplay")) $("#aid").addClass("nodisplay");
                        } else if ($("#aid").hasClass("nodisplay")) $("#aid").removeClass("nodisplay");
                        if ($lesspoint.hasClass("nodisplay")) $lesspoint.removeClass("nodisplay");
                        refreshBtnState();
                    }
                    if ($("#gameid").length) {
                        console.log("has gameid");
                        checkScoreEnough(data.Score); // Function defined in play_game.js
                    }
                }
            },
            "json"
        );
    } else {
        var $lesspoint = $("#lesspoint");
        if ($lesspoint.length) {
            var url = "/Home/GetScore?uniqueId="+currentPlayerUniqueId;
            $.post(
                url,
                null,
                function (data) {
                    console.log(data);
                    if (data.Score < 50) {
                        var score = data.Score + " point" + (parseInt(data.Score) > 1 ? "s" : "");
                        $("#score").text(score);
                        if (data.CanGetAid === 1) {
                            if ($("#aid").hasClass("nodisplay")) $("#aid").removeClass("nodisplay");
                        } else if (!$("#aid").hasClass("nodisplay")) $("#aid").addClass("nodisplay");
                        if ($lesspoint.hasClass("nodisplay")) $lesspoint.removeClass("nodisplay");
                    } else {
                        if (!$lesspoint.hasClass("nodisplay")) $lesspoint.addClass("nodisplay");
                    }
                    refreshBtnState();
                },
                "json"
            );
        }
    }

    if ($("#getaid").length) {
        $("#getaid").on("click", function () {
            var url = "/Home/GetAid?uniqueId="+currentPlayerUniqueId;
            $.post(
                url,
                null,
                function (data) {
                    if (data.Score >= 50) $lesspoint.addClass("nodisplay");
                    else $("#aid").addClass("nodisplay");
                    refreshBtnState();
                },
                "json"
            );
        });
    }

    refreshBtnState();
});