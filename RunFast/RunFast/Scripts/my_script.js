function toggleIcon(e) {
    e.stopPropagation();
    $(e.target)
        .prev('.panel-heading')
        .find(".more-less")
        .toggleClass('glyphicon-plus glyphicon-minus');
}
$('.panel-group').on('hidden.bs.collapse', toggleIcon);
$('.panel-group').on('shown.bs.collapse', toggleIcon);

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