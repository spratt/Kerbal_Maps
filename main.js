(function (undefined) {
    'use strict';
    var WIDTH=720;
    var HEIGHT=360;
    var ALT_MIN=-2000;
    var ALT_MAX=2000;
    var RGB_MIN=0;
    var RGB_MAX=255;
    var RGB_RANGE=RGB_MAX-RGB_MIN;
    var ALPHA=255;

    function set_pixel_colour(image, x, y, r, g, b, a) {
        var index = 4 * (x + y * WIDTH);
        image.data[index + 0] = r;
        image.data[index + 1] = g;
        image.data[index + 2] = b;
        image.data[index + 3] = a;
    }

    function draw_csv(canvas, map_data) {
        var context = canvas.getContext('2d');
        var image = context.createImageData(WIDTH, HEIGHT);
        for(var col = 0; col < WIDTH; ++col) {
            for(var row = 0; row < HEIGHT; ++row) {
                var r = 0;
                var g = 0;
                var b = 0;
                var entry = map_data[col][row];
                if(entry === undefined) {
                    // leave black
                } else if(entry.alt < 0) {
                    b = RGB_MIN + entry.alt * (RGB_RANGE/ALT_MIN);
                    g = RGB_MAX - b;
                } else {
                    r = RGB_MIN + entry.alt * (RGB_RANGE/ALT_MAX);
                    g = RGB_MAX - r;
                }
                set_pixel_colour(image, col, row, r, g, b, ALPHA);
            }
        }
        context.putImageData(image, 0, 0);
    }

    function parse_csv(csv) {
        var csv_array = $.csv.toArrays(csv);
        var map_data = [];
        for(var col = 0; col < WIDTH; ++col) {
            map_data[col] = [];
        }
        for(var n = 1; n < csv_array.length; ++n) {
            var entry = csv_array[n];
            var row = HEIGHT - entry[0];
            var col = entry[1];
            var lat = entry[2];
            var lon = entry[3];
            var alt = entry[4];
            map_data[col][row] = {
                lat: lat,
                lon: lon,
                alt: alt
            };
        }
        return map_data;
    }

    function get_csv(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.send(null);
        xhr.onreadystatechange = function() {
            var DONE = 4;
            var OK   = 200;
            if (xhr.readyState === DONE) {
                if (xhr.status === OK) {
                    var map_data = parse_csv(xhr.responseText);
                    var canvas = document.getElementById('c');
                    draw_csv(canvas, map_data);
                } else {
                    console.error('XHR: ' + xhr.status);
                }
            }
        };
    }

    function populate_dropdown(select, base, index, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', index);
        xhr.send(null);
        xhr.onreadystatechange = function() {
            var DONE = 4;
            var OK   = 200;
            if (xhr.readyState === DONE) {
                if (xhr.status === OK) {
                    var files = JSON.parse(xhr.responseText);
                    for(var i = 0; i < files.length; ++i) {
                        select.options[select.options.length] = new Option(files[i], base + files[i]);
                    }
                    if (callback !== undefined)
                        callback();
                } else {
                    console.error('XHR: ' + xhr.status);
                }
            }
        };
    }

    function set_image(image_src) {
        var image = document.getElementById('image');
        image.src = image_src;
    }

    (function start() {
        var select_data = document.getElementById('data_src');
        var select_image = document.getElementById('image_src');
        var data_button = document.getElementById('draw_data');
        var image_button = document.getElementById('draw_image');
        data_button.onclick = function() {
            get_csv(select_data.value);
        };
        image_button.onclick = function() {
            set_image(select_image.value);
        };
        populate_dropdown(select_data, 'data/', 'data/index.json', function() {
            data_button.click();
        });
        populate_dropdown(select_image, 'images/', 'images/index.json', function() {
            image_button.click();
        });
    })();
}).call( this );
