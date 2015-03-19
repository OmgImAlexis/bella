$(function() {
    // quick search regex
    var qsRegex;
    var mediaType = '';

    // init Isotope
    var $container = $('.main').isotope({
        itemSelector: '.media-object',
        layoutMode: 'fitRows',
        filter: function() {
            if (mediaType == '') {
                return true;
            }
            if($(this).hasClass(mediaType)){
                return qsRegex ? $(this).data('name').match(qsRegex) : true
            }
        }
    });

    // use value of search field to filter
    var $quicksearch = $('.search').keyup(debounce(function() {
        qsRegex = new RegExp( $quicksearch.val(), 'gi' );
        $container.isotope();
    }, 200));

    $('.nav-sidebar').children('li').on('click', function(e){
        $(this).parent().find('li').removeClass("active");
        $(this).addClass("active");
        mediaType = $('.nav-sidebar').find('li.active').children().data('type');
        $('.main').isotope();
        return false;
    });
});

// debounce so filtering doesn't happen every millisecond
function debounce( fn, threshold ) {
    var timeout;
    return function debounced() {
        if ( timeout ) {
            clearTimeout( timeout );
        }
        function delayed() {
            fn();
            timeout = null;
        }
        timeout = setTimeout( delayed, threshold || 100 );
    }
}
