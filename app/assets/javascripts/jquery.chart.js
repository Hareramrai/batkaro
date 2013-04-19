
(function($) {

    $.fn.chat = function() {

        this.each(function(elementIndex) {

            // Config settings
            var chartSizePercent = 55;
            var sliceBorderWidth = 1;
            var sliceBorderStyle = "#fff";
            var sliceGradientColour = "#ddd";
            var maxPullOutDistance = 25;
            var pullOutFrameStep = 4;
            var pullOutFrameInterval = 40;
            var pullOutLabelPadding = 65;
            var pullOutLabelFont = "bold 16px 'Trebuchet MS', Verdana, sans-serif";
            var pullOutValueFont = "bold 12px 'Trebuchet MS', Verdana, sans-serif";
            var pullOutValuePrefix = "$";
            var pullOutShadowColour = "rgba( 0, 0, 0, .5 )";
            var pullOutShadowOffsetX = 5;
            var pullOutShadowOffsetY = 5;
            var pullOutShadowBlur = 5;
            var pullOutBorderWidth = 2;
            var pullOutBorderStyle = "#333";
            var chartStartAngle = -.5 * Math.PI;

            // Declare some variables for the chart
            var canvas;                       // The canvas element in the page
            var currentPullOutSlice = -1;     // The slice currently pulled out (-1 = no slice)
            var currentPullOutDistance = 0;   // How many pixels the pulled-out slice is currently pulled out in the animation
            var animationId = 0;              // Tracks the interval ID for the animation created by setInterval()
            var chartData = [];               // Chart data (labels, values, and angles)
            var chartColours = [];            // Chart colours (pulled from the HTML table)
            var totalValue = 0;               // Total of all the values in the chart
            var canvasWidth = 600;                  // Width of the canvas, in pixels
            var canvasHeight = 500;                 // Height of the canvas, in pixels
            var centreX;                      // X-coordinate of centre of the canvas/chart
            var centreY;                      // Y-coordinate of centre of the canvas/chart
            var chartRadius;                  // Radius of the pie chart, in pixels
            var chartDataElement;
            var $table = $(this);            
            var canvasId = "canvas-id-" + elementIndex;
            
            chartDataElement = $table;
            $table.wrap('<div class="chart-container" />');
            $table.addClass("chart-data-table");
            
            //insert canvas for chart drawing 
            $table.after("<div class='chart-canvas-container'><canvas class='chart-canvas' id='" + canvasId + "' height='"+canvasHeight+"' width='"+canvasWidth+"'></canvas></div>");
            canvas = document.getElementById(canvasId);

            var drawSlice = function(context, slice) {

                // Compute the adjusted start and end angles for the slice
                var startAngle = chartData[slice]['startAngle'] + chartStartAngle;
                var endAngle = chartData[slice]['endAngle'] + chartStartAngle;

                if (slice == currentPullOutSlice) {

                    var midAngle = (startAngle + endAngle) / 2;
                    var actualPullOutDistance = currentPullOutDistance * easeOut(currentPullOutDistance / maxPullOutDistance, .8);
                    startX = centreX + Math.cos(midAngle) * actualPullOutDistance;
                    startY = centreY + Math.sin(midAngle) * actualPullOutDistance;
                    context.fillStyle = 'rgb(' + chartColours[slice].join(',') + ')';
                    context.textAlign = "center";
                    context.font = pullOutLabelFont;
                    context.fillText(chartData[slice]['label'], centreX + Math.cos(midAngle) * (chartRadius + maxPullOutDistance + pullOutLabelPadding), centreY + Math.sin(midAngle) * (chartRadius + maxPullOutDistance + pullOutLabelPadding));
                    context.font = pullOutValueFont;
                    context.fillText(pullOutValuePrefix + chartData[slice]['value'] + " (" + (parseInt(chartData[slice]['value'] / totalValue * 100 + .5)) + "%)", centreX + Math.cos(midAngle) * (chartRadius + maxPullOutDistance + pullOutLabelPadding), centreY + Math.sin(midAngle) * (chartRadius + maxPullOutDistance + pullOutLabelPadding) + 20);
                    context.shadowOffsetX = pullOutShadowOffsetX;
                    context.shadowOffsetY = pullOutShadowOffsetY;
                    context.shadowBlur = pullOutShadowBlur;

                } else {

                    // This slice isn't pulled out, so draw it from the pie centre
                    startX = centreX;
                    startY = centreY;
                }

                // Set up the gradient fill for the slice
                var sliceGradient = context.createLinearGradient(0, 0, canvasWidth * .75, canvasHeight * .75);
                sliceGradient.addColorStop(0, sliceGradientColour);
                sliceGradient.addColorStop(1, 'rgb(' + chartColours[slice].join(',') + ')');

                // Draw the slice
                context.beginPath();
                context.moveTo(startX, startY);
                context.arc(startX, startY, chartRadius, startAngle, endAngle, false);
                context.lineTo(startX, startY);
                context.closePath();
                context.fillStyle = sliceGradient;
                context.shadowColor = (slice == currentPullOutSlice) ? pullOutShadowColour : "rgba( 0, 0, 0, 0 )";
                context.fill();
                context.shadowColor = "rgba( 0, 0, 0, 0 )";

                // Style the slice border appropriately
                if (slice == currentPullOutSlice) {
                    context.lineWidth = pullOutBorderWidth;
                    context.strokeStyle = pullOutBorderStyle;
                } else {
                    context.lineWidth = sliceBorderWidth;
                    context.strokeStyle = sliceBorderStyle;
                }

                // Draw the slice border
                context.stroke();

            };


            var easeOut = function(ratio, power) {

                return (Math.pow(1 - ratio, power) + 1);

            };

            var animatePullOut = function(slice) {

                // Pull the slice out some more
                currentPullOutDistance += pullOutFrameStep;

                // If we've pulled it right out, stop animating
                if (currentPullOutDistance >= maxPullOutDistance) {
                    clearInterval(animationId);
                    return;
                }

                // Draw the frame
                drawChart();
            };

            var handleTableClick = function(clickEvent) {

                var slice = $(this).data('slice');
                toggleSlice(slice);

            };

            var startPullOut = function(slice) {

                // Exit if we're already pulling out this slice
                if (currentPullOutSlice == slice)
                    return;

                // Record the slice that we're pulling out, clear any previous animation, then start the animation
                currentPullOutSlice = slice;
                currentPullOutDistance = 0;
                clearInterval(animationId);
                animationId = setInterval(function() {
                    animatePullOut(slice);
                }, pullOutFrameInterval);

                // Highlight the corresponding row in the key table
                chartDataElement.find("td").removeClass('highlight');
                var labelCell = chartDataElement.find('td:eq(' + (slice * 2) + ')');
                var valueCell = chartDataElement.find('td:eq(' + (slice * 2 + 1) + ')');
                labelCell.addClass('highlight');
                valueCell.addClass('highlight');

            };

            var toggleSlice = function(slice) {

                if (slice == currentPullOutSlice) {
                    pushIn();
                } else {
                    startPullOut(slice);
                }

            };

            var pushIn = function() {

                currentPullOutSlice = -1;
                currentPullOutDistance = 0;
                clearInterval(animationId);
                drawChart();
                chartDataElement.find('td').removeClass('highlight');

            };

            var handleChartClick = function(clickEvent) {

                // Get the mouse cursor position at the time of the click, relative to the canvas
                var mouseX = clickEvent.pageX - this.offsetLeft;
                var mouseY = clickEvent.pageY - this.offsetTop;

                // Was the click inside the pie chart?
                var xFromCentre = mouseX - centreX;
                var yFromCentre = mouseY - centreY;
                var distanceFromCentre = Math.sqrt(Math.pow(Math.abs(xFromCentre), 2) + Math.pow(Math.abs(yFromCentre), 2));

                if (distanceFromCentre <= chartRadius) {

                    // Yes, the click was inside the chart.
                    // Find the slice that was clicked by comparing angles relative to the chart centre.

                    var clickAngle = Math.atan2(yFromCentre, xFromCentre) - chartStartAngle;
                    if (clickAngle < 0)
                        clickAngle = 2 * Math.PI + clickAngle;

                    for (var slice in chartData) {
                        if (clickAngle >= chartData[slice]['startAngle'] && clickAngle <= chartData[slice]['endAngle']) {

                            // Slice found. Pull it out or push it in, as required.
                            toggleSlice(slice);
                            return;
                        }
                    }
                }

                // User must have clicked outside the pie. Push any pulled-out slice back in.
                pushIn();

            };

            var drawChart = function() {

                // Get a drawing context
                var context = canvas.getContext('2d');

                // Clear the canvas, ready for the new frame
                context.clearRect(0, 0, canvasWidth, canvasHeight);

                // Draw each slice of the chart, skipping the pull-out slice (if any)
                for (var slice in chartData) {
                    if (slice != currentPullOutSlice)
                        drawSlice(context, slice);
                }
                if (currentPullOutSlice != -1)
                    drawSlice(context, currentPullOutSlice);

            };

            var init = function() {

                // Exit if the browser isn't canvas-capable
                if (typeof canvas.getContext === 'undefined')
                    return;

                // Initialise some properties of the canvas and chart                
                //canvasWidth = canvas.width;
               // canvasHeight = canvas.height;
                centreX = canvasWidth / 2 ;
                centreY = canvasHeight / 2;
                chartRadius = Math.min(canvasWidth, canvasHeight) / 2 * (chartSizePercent / 100);

                var currentRow = -1;
                var currentCell = 0;

                chartDataElement.find("td").each(function() {
                    currentCell++;
                    if (currentCell % 2 != 0) {
                        currentRow++;
                        chartData[currentRow] = [];
                        chartData[currentRow]['label'] = $(this).text();
                    } else {
                        var value = parseFloat($(this).text());
                        totalValue += value;
                        value = value.toFixed(2);
                        chartData[currentRow]['value'] = value;
                    }

                    // Store the slice index in this cell, and attach a click handler to it
                    $(this).data('slice', currentRow);
                    $(this).click(handleTableClick);

                    // Extract and store the cell colour
                    if (rgb = $(this).css('color').match(/rgb\((\d+), (\d+), (\d+)/)) {
                        chartColours[currentRow] = [rgb[1], rgb[2], rgb[3]];
                    } else if (hex = $(this).css('color').match(/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/)) {
                        chartColours[currentRow] = [parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16)];
                    } else {
                        alert("Error: Colour could not be determined! Please specify table colours using the format '#xxxxxx'");
                        return;
                    }

                });

                // Now compute and store the start and end angles of each slice in the chart data

                var currentPos = 0; // The current position of the slice in the pie (from 0 to 1)

                for (var slice in chartData) {
                    chartData[slice]['startAngle'] = 2 * Math.PI * currentPos;
                    chartData[slice]['endAngle'] = 2 * Math.PI * (currentPos + (chartData[slice]['value'] / totalValue));
                    currentPos += chartData[slice]['value'] / totalValue;
                }

                // All ready! Now draw the pie chart, and add the click handler to it
                drawChart();
                $(canvas).click(handleChartClick);

            };
                
            init();
        });

    };

})(jQuery);