$(function() {
    // quick search regex
    var qsRegex;

    // init Isotope
    var $container = $('.main').isotope({
        itemSelector: '.media-object',
        layoutMode: 'fitRows',
        filter: function() {
            return qsRegex ? $(this).data('name').match(qsRegex) : true
        }
    });

    // use value of search field to filter
    var $quicksearch = $('.search').keyup(debounce(function() {
        qsRegex = new RegExp( $quicksearch.val(), 'gi' );
        $container.isotope();
    }, 200));
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
