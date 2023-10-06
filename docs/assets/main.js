
// Automatically add '#' hyperlinks to headers
$(document).ready(function() {
    $('h2, h3, h4, h5, h6').each(function() {
        var id = $(this).attr('id');
        if (id) {
            var anchor = $('<a/>').addClass('anchor').attr('href', '#' + id).text('#');
            $(this).append(' ');
            $(this).append(anchor);
        }
    });
});
