/*****************************************************************************************************
    my_script.js

    This js file is to assist some behaviour of side pages.
*****************************************************************************************************/

// Assist About.cshtml to open/close the information portfolio, e.g. game rules.
function toggleIcon(e) {
    e.stopPropagation();
    $(e.target)
        .prev('.panel-heading')
        .find(".more-less")
        .toggleClass('glyphicon-plus glyphicon-minus');
}
$('.panel-group').on('hidden.bs.collapse', toggleIcon);
$('.panel-group').on('shown.bs.collapse', toggleIcon);

// Assist Login.cshtml to enable the player request a new confirmation Email
function resendEmail(checkedEmail) {
    if ($("#Email").val() == checkedEmail) {
        var $form = $("form");
        $form.attr("action", "/Account/SendEmailConfirmation");
        $form.submit();
        $form.attr("action", "/Account/Login");
    } else {
        $(".validation-summary-errors.text-danger").html("<ul><li>Invalid Email or password.</li></ul>");
    }
}