function padLeft(nr, n, str){
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}

(function() {
    var defaults = {
        data: null,
        tdInterval: 30,
        resizeInterval: 10,
        headers: null,
        mode: 'edit',
        changed: function(info) {
        }
    };


    $.fn.gatt = function(options, cb, closecb) {

        function process(bar) {
            var info = getBarInfo(bar);
            options.changed(info);
        }

        function getBarInfo(bar) {
            var leftPositionInMinutes = (((bar.css('left').replace(/[^-\d\.]/g, '')) / pixelsPerUnit)) * options.resizeInterval;
            var leftPositionInTimestamp = (leftPositionInMinutes * 60) + firstTimestamp;

            var units = Math.round(bar.css('width').replace(/[^-\d\.]/g, '') / pixelsPerUnit);

            var widthInTimestamp = ((units * options.resizeInterval) * 60) + leftPositionInTimestamp;

            var info = {
                length: Math.floor(units * options.resizeInterval),
                start: leftPositionInTimestamp,
                end: widthInTimestamp,
                id: bar.data('id'),
            };
            return info;
        }

        function showTooltip(bar, title) {
            bar.attr('title', title).tooltip('fixTitle').tooltip('show');
        }

        function resizing(event, ui, bar) {
            var info = getBarInfo(bar);
            var hour = Math.floor(info.length / 60);
            var minutes = info.length % 60;
            var title = hour + " hours, " + minutes + " min";
            showTooltip(bar, title);
        }

        function dragging(event, ui, bar) {
            var info = getBarInfo(bar);
            var b = new Date(info.start * 1000);
            var e = new Date(info.end * 1000);
            var title =  b.getUTCHours() + ":" + ( (b.getUTCMinutes()<10?'0':'') + b.getMinutes() ) + " - " + e.getUTCHours() + ":" + ( (e.getUTCMinutes()<10?'0':'') + e.getMinutes() );
            showTooltip(bar, title);
        }

        function createColumns(target) {
            var $target = $(this);
            console.log($target);
        }

        var $target = $(this);
        var $cont = $target.find(".cont");
        var $header = $target.find(".header");
        var $columns = $target.find(".columns");

        //var json = jQuery.parseJSON(options.data);
        var json = false;

        $.ajax({
            url: options.data,
            async: false,
            dataType: 'json',
            success: function(response) {
                json = response;
            }
        });

        var earliest_time = false;
        var latest_time = false;

        $.each(json, function() {
            if(this.from < earliest_time || !earliest_time) {
                earliest_time = this.from;
            }
            if(this.to > latest_time || !latest_time) {
                latest_time = this.to;
            }
        });

        var $differenceHours = Math.ceil((latest_time - earliest_time) / (60*60) + 1);
        var $differenceMinutes = $differenceHours * 60;

        var header = [];

        for(i = 0; i <= $differenceMinutes; i += options.tdInterval) {

            var time = earliest_time + (i*60);
            var dt = new Date(time*1000);

            header[i] = dt;

            var time_string = padLeft(dt.getUTCHours(), 2) + ':' + padLeft(dt.getUTCMinutes(), 2);

            var dd = $('<div/>', {
                class: 'hour',
                //'data-row-id': i,
                html: ' <span>'+time_string+'</span>'
            });
            $header.append(dd);
        }

        var i = 0;
        $.each(json, function() {

            console.log(this);

            var nn = $('<div/>', {
                class: 'task',
                'data-row-id': i,
                html: ' <span>' + time_string + '</span>'
            });

            var mm = 0;
            for (j = 0; j <= $differenceMinutes; j += options.tdInterval) {
                var nj = $('<div/>', {
                    class: 'col',
                    //'data-start':  $differenceHours,
                    'data-ts' : header[j].getTime() / 1000
                });
                nn.append(nj);
            }

            $cont.append(nn);

            var dd = $('<div/>', {
                class: 'desc',
                'data-row-id': i,
                html: ' <span class="task-name">' + this.name + '</span>' +
                '<span class="meta">' + this.quantity + ' shifts</span>',
            });
            $columns.append(dd);
            i++;
        });

        // Hier

        var width = $target.width();


        $target.find('.right').css('width', (width - 200 - 20 - 10) + 'px');


        var $initialTdWidth = $target.find('.col:first').css('width').replace(/[^-\d\.]/g, '');
        var $calculus = $initialTdWidth % (options.tdInterval / options.resizeInterval);
        var $newWidth = $initialTdWidth - $calculus;

        if(options.mode == 'view') {
            $columns.css('height', 'auto');
            $cont.css('height', 'auto');
            $maxWidth = width - 200;
            var $headers = jQuery.parseJSON(options.headers);
            var calculus = ($maxWidth % Object.keys($headers).length);
            var $newTableWidth = ($maxWidth - calculus);
            var $tdWidth = ($newTableWidth) / Object.keys($headers).length;
            var calculus2 = $tdWidth % (options.tdInterval / options.resizeInterval);
            var $newtdWidth = $tdWidth - calculus2;
            var correction = calculus2 * Object.keys($headers).length;
            var $newnewTableWidth = $newTableWidth - correction;
            var $totalWidth = $newnewTableWidth;
            $newWidth = $newtdWidth;
            $cont.css('overflow', 'hidden');
            $columns.css('overflow', 'hidden');
            $header.css('overflow', 'hidden');
        } else {
            // Synchronise the scroll events
            $header.scroll(function () {
                $cont.scrollLeft($header.scrollLeft());
            });
            $cont.scroll(function () {
                $header.scrollLeft($cont.scrollLeft());
                $columns.scrollTop($cont.scrollTop());
            });
            $columns.scroll(function () {
                $cont.scrollTop($columns.scrollTop());
            });
        }

        // Set new width of columns
        $target.find('.col, .hour').css('width', $newWidth+'px');
        $target.find('.col, .hour').css('max-width', $newWidth+'px');
        $target.find('.col, .hour').css('min-width', $newWidth+'px');


        var firstTimestamp = $target.find('.col').first().data('ts');

        console.log($target.find('.col').first());

        var pixelsPerUnit = $newWidth / (options.tdInterval / options.resizeInterval);

        var tasks = [];



        var i = 0;
        $.each(json, function() {

            //alert('go');

            var $tt = $target.find("div.task[data-row-id=" + this.row_id + "]");

            var $first =  $tt.find('.col:first');

            $first.css('position', 'relative');

            var planningTime = ((this.to - this.from) / 60);

            var margin = (parseInt(planningTime / 60)) * 2;

            var barLength = (planningTime / options.resizeInterval) * pixelsPerUnit;
            var diff = (this.from - firstTimestamp) / 60;

            var startPosition = ((diff / options.resizeInterval) * pixelsPerUnit);


            var $label = jQuery('<span/>', {
                'html': this.label,
                'style': 'margin-top: 4px; margin-left: 8px; display: block;'
            });


            var $newBar = jQuery('<div/>', {
                class: 'bar',
                html: $label,
                style: 'position: absolute; width: 200px; height: 25px; background-color: #70b4cb; cursor: grab; cursor: move; opacity: 0.8; color: black; top: 10px; left: 0; border-radius: 5px; overflow: hidden;'
            });

            var top = 10 + (tasks[this.task_id] * 6);

            $newBar.attr('data-id', this.id);
            $newBar.css('width', barLength+'px');
            $newBar.css('left', startPosition+'px');
            $newBar.css('top', top+'px');
            $newBar.css('background-color', this.color);
            $newBar.tooltip({
                title : 'Hier de afmetingen',
                trigger: 'manual',
                animation: false
            });

            $(document).find('.tooltip-inner').css('width', '350px').css('max-width', '350px');


            $newBar.appendTo($first);

            var resizableGridInPixels = parseFloat(pixelsPerUnit);

            var planning_id = this.planning_id;

            if(options.mode == 'edit') {
                $( $newBar).resizable({
                    grid: resizableGridInPixels,
                    handles: 'e, w',
                    resize: function( event, ui ) {
                        resizing(event, ui, $(this));
                        $( '.bar[data-planning-id="'+planning_id+'"]' ).width($(this).width());
                        $( '.bar[data-planning-id="'+planning_id+'"]' ).css('left', ui.position.left+'px');
                        return true;
                    },
                    start: function( event, ui ) {
                        $(this).tooltip('show');
                        return true;
                    },
                    stop: function( event, ui ) {
                        $(this).tooltip('hide');
                        process($(this));
                        return true;
                    }
                });
                $($newBar).draggable({
                    snap: false,
                    grid: [ resizableGridInPixels, null ],
                    drag: function( event, ui ) {
                        dragging(event, ui, $(this));
                        $( '.bar[data-planning-id="'+planning_id+'"]' ).css('left', ui.position.left+'px');
                    },
                    start: function( event, ui ) {
                        $(this).tooltip('show');
                    },
                    stop: function( event, ui ) {
                        $(this).tooltip('hide');
                        process($(this));
                    }
                });
            } else {
                $newBar.css('cursor', 'default');
            }
        });



    }
})(jQuery);