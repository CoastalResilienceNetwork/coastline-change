define([
	"esri/tasks/query", "esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", "dojo/_base/lang", "dojo/on"
],
function ( Query, QueryTask, declare, FeatureLayer, lang, on) {
        "use strict";

        return declare(null, {
			makeChart: function(t){	
			// symbolize x axis
				var l = $('.vertAndLines').find('.dashedLines');  
				$.each(l, function(i,v){
					if (i == l.length - 1){
						$(v).css({'opacity': '1', 'border-top': '2px solid #000'})
					}
				})
				// calculate width of bars
				var bars = $('.barHolder').find('.sumBarsWrap');
				var lw = $('.dashedLines').css('width').slice(0,-2)
				var sLw = lw/bars.length;
				var bWw = sLw - 4;
				$('.smallLabels').css('width', sLw + 'px')
				$('.sumBarsWrap').css('width', bWw + 'px')
				$('.sumBars').css('width', bWw + 'px')
				
				//var a1 = [85,60,70,25,40,5,55,20,40,30,90]
				//t.barChart.updateChart(a1, t)
			},
			updateChart: function(a, t){ 
				var colors = ['#bf812d','#f6e8c3','#c7eae5','#80cdc1','#358d8f','#01665E','#003c30']
				// old colors keep for now 12/15/2016.
				//var colors = ['#4FA84A', '#79B244', '#A3BD3F', '#CEC83A', '#CCB130','#CA9A26','#C8841D' ]
				//var colors = ['#4FA84A', '#79B244', '#A3BD3F', '#CEC83A', '#CCB130','#CA9A26','#C8841D' ]
				$('.barHolder').find('.sumBars').each(function(i,v){
					$(v).css("background-color", colors[i]);
					var h = Math.round(a[i]/90*100)
					$(v).animate({ height: h + '%'});
				});
			}
        });
    }
);
