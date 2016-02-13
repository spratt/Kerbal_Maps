(function (undefined) {
    'use strict';

    function parse_csv(csv) {
        document.csvArray = $.csv.toArrays(csv);
    }

    (function get_csv(url) {
        console.log(url);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.send(null);
        xhr.onreadystatechange = function() {
            var DONE = 4;
            var OK   = 200;
            if (xhr.readyState === DONE) {
                if (xhr.status === OK) {
                    parse_csv(xhr.responseText);
                } else {
                    console.error('XHR: ' + xhr.status);
                }
            }
        };
    })('data/Kerbin_elevation_720x360_KavrayskiyVII_data.csv');
}).call( this );
