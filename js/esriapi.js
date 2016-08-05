define([
	"esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", 
	"esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/graphic", "dojo/_base/Color", "dojo/_base/lang", "dojo/on", "jquery", './jquery-ui-1.11.2/jquery-ui'
],
function ( 	ArcGISDynamicMapServiceLayer, Extent, SpatialReference, QueryTask, declare, FeatureLayer, 
			SimpleLineSymbol, SimpleFillSymbol, Graphic, Color, lang, on, $, ui) {
        "use strict";

        return declare(null, {
			esriApiFunctions: function(t){
				// Copy of dynamic layer for transparency slider
				t.dynamicLayer1 = new ArcGISDynamicMapServiceLayer(t.url, {opacity: 1 - t.obj.sliderVal/10});
				t.map.addLayer(t.dynamicLayer1);
				t.dynamicLayer1.on("load", lang.hitch(t, function () {  
					if (t.obj.visibleLayers1.length > 0){	
						t.dynamicLayer1.setVisibleLayers(t.obj.visibleLayers1);
					}
				}));				
				// Add dynamic map service
				t.dynamicLayer = new ArcGISDynamicMapServiceLayer(t.url);
				t.map.addLayer(t.dynamicLayer);
				t.dynamicLayer.on("load", lang.hitch(t, function () {  
					
					if (t.obj.visibleLayers.length > 0){	
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
						t.spid = t.obj.visibleLayers[0];	
					}
					t.layersArray = t.dynamicLayer.layerInfos;
				}));
				t.dynamicLayer.on("update-end", lang.hitch(t,function(e){
					if (e.target.visibleLayers.length > 0){
						$('#' + t.appDiv.id + 'bottomDiv').show();	
					}else{
						$('#' + t.appDiv.id + 'bottomDiv').hide();	
					}
				}));
				// Create a QueryTask for PIN search
				t.pinQt = new QueryTask(t.url + "/6");
				// Create a QueryTask for Future PIN search
				t.fPinQt = new QueryTask(t.url + "/16");
				// red selection symbol
				t.selSymbol = new SimpleFillSymbol( SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_SOLID, new Color([255,0,0]), 3 ), new Color([0,0,0,0.1])
				);
				t.selSymbolB = new SimpleFillSymbol( SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_SOLID, new Color([0,0,255]), 2 ), new Color([255,255,255,0])
				);
				t.selSymbolBhl = new SimpleFillSymbol( SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_SOLID, new Color([0,128,255]), 2 ), new Color([0,0,0,0.25])
				);
				// Create a feature layer of parcel selected by PIN
				t.pinFL = new FeatureLayer(t.url + "/6", { mode: FeatureLayer.MODE_SELECTION, outFields: ["*"] });
				t.pinFL.setSelectionSymbol(t.selSymbol);
				t.pinFL.on('selection-complete', lang.hitch(t,function(evt){
					if (t.pinTracker == "yes"){
						t.pinTracker = "zcheck"
						var pinExtent = evt.features[0].geometry.getExtent();
						t.map.setExtent(pinExtent, true);
					}
				}));	
				// Create a feature layer of future parcels selected by PIN
				t.fPinFL = new FeatureLayer(t.url + "/16", { mode: FeatureLayer.MODE_SELECTION, outFields: ["*"] });
				t.fPinFL.setSelectionSymbol(t.selSymbol);
				t.fPinFL.on('selection-complete', lang.hitch(t,function(evt){
					if (evt.features.length > 0) {
						if (t.obj.subSection == "queryParNavBtn"){
							if (t.stateSet == "no"){
								if ($('#' + t.appDiv.id + 'toggleQuery').html() == 'Hide Query'){
									$('#' + t.appDiv.id + 'toggleQueryWrap').slideUp();
									$('#' + t.appDiv.id + 'toggleQuery').html('Show Query');
									t.obj.queryVis = "no";
								}
							}else{
								if (t.queryVis == "yes"){
									$('#' + t.appDiv.id + 'toggleQueryWrap').slideDown();
									$('#' + t.appDiv.id + 'toggleQuery').html('Hide Query');
									t.obj.queryVis = "yes";
								}else{
									$('#' + t.appDiv.id + 'toggleQueryWrap').slideUp();
									$('#' + t.appDiv.id + 'toggleQuery').html('Show Query');
									t.obj.queryVis = "no";
								}
								//Change stateSet to no because future selected, query parcels selected, query performed, and a parcel was selected from results	
								t.stateSet = "no";								
							}	
						}	
						
						t.patts = evt.features[0].attributes;
						t.pin = t.patts.PIN;
						$('#' + t.appDiv.id + 'parcelInfo .pInfoField').each(lang.hitch(t,function (i,v){
							var field = v.id.split("-").pop()
							var val = t.patts[field];
							if (field == 'DEED_DATE'){
								var date = new Date(val)
								var d = t.esriapi.dateFinder(date)
								val = d;
							}else{
								if ( isNaN(t.patts[field]) == false ){
									if (field != 'PIN'){
											
									
										val = Math.round(val);
										val = t.esriapi.commaSeparateNumber(val);
										if (field == 'TAX_VALUE'){
											val = '$' + val;	
										}
									}					
								}	
							}	
							$('#' + v.id).html(val)
							$('#' + t.appDiv.id + 'searchPinNone').slideUp();
							$('#' + t.appDiv.id + 'parcelInfo').slideDown();
							t.pinExtent = evt.features[0].geometry.getExtent();
							if (t.obj.subSection == 'zoomParNavBtn' && t.stateSet == 'no'){
								t.map.setExtent(t.pinExtent, true);
							}
							if (t.obj.subSection == 'zoomParNavBtn' && t.stateSet == 'yes'){
								//Change stateSet to no because future selected, zoom to parcels select, and a PIN searched
								t.stateSet = "no";
							}								
						}));
						
						
						// Update bar graphs values - get cur and potential points
						t.n = [t.atts.OSP_PTS_2013, t.atts.SUM_ALL_cpts, t.patts.OSP_fpts]
						// find the remaining value so bar numbers can be calculated as percentages
						var m = 2020 - (t.n[0] + t.n[1] + t.n[2])
						t.n.push(m)
						
						// Create empty array and populate it with percentages of current, potential, and remaining
						var p = [];
						$.each(t.n, lang.hitch(t, function(i,v){
							var x = Math.round(v/2020*100);
							p.push(x);
						}));
						$('#' + t.appDiv.id + 'futureGraph').css('display', 'inline-block');
						//$('#' + t.appDiv.id + 'graphLegLblF').show();
						// Update bar values with percentages array
						$('#' + t.appDiv.id + 'barf').animate({left : p[0]+p[1]+"%", width: p[2]+"%"});
						$('#' + t.appDiv.id + 'bar2').animate({left : p[0]+"%", width: p[1]+"%"});
						$('#' + t.appDiv.id + 'bar1').animate({left : "0%", width: p[0]+"%"});
						// Add labels to current and potential bars (round decimals and add commas as necessary)
						if (isNaN(t.atts.OSP_PTS_2013) == false){
							var curPnts = Math.round(t.atts.OSP_PTS_2013);
							curPnts = t.esriapi.commaSeparateNumber(curPnts);
							$('#' + t.appDiv.id + 'bar1L').html(curPnts)
						}	
						if (isNaN(t.atts.SUM_ALL_cpts) == false){
							var potPnts = Math.round(t.atts.SUM_ALL_cpts);
							potPnts = t.esriapi.commaSeparateNumber(potPnts);
							$('#' + t.appDiv.id + 'bar2L').html(potPnts);
						}
						if (isNaN(t.patts.OSP_fpts) == false){
							var futPnts = Math.round(t.patts.OSP_fpts);
							futPnts = t.esriapi.commaSeparateNumber(futPnts);
							$('#' + t.appDiv.id + 'barfL').html(futPnts);
						}
						
					}else{
						$('#' + t.appDiv.id + 'parcelInfo').slideUp();
						$('#' + t.appDiv.id + 'searchPinNone').slideDown();	
					}	
					$('.accrodBg').removeClass('waiting');
				}));
				$('#' + t.appDiv.id + 'futureZoom').on('click',lang.hitch(t,function(){
					t.map.setExtent(t.pinExtent, true);
				}));
				// Create a feature layer of future parcels selected by PIN
				t.fManyPinFL = new FeatureLayer(t.url + "/16", { mode: FeatureLayer.MODE_SELECTION, outFields: ["*"] });
				t.fManyPinFL.setSelectionSymbol(t.selSymbolB);
				t.fManyPinFL.on('mouse-over',lang.hitch(t,function(evt){
					t.map.setMapCursor("pointer");
					var highlightGraphic = new Graphic(evt.graphic.geometry,t.selSymbolBhl);
					t.map.graphics.add(highlightGraphic);
					t.obid = evt.graphic.attributes.OBJECTID
				}))
				t.map.graphics.on("mouse-out", lang.hitch(t,function(){
					t.map.setMapCursor("default");
					t.map.graphics.clear();
					t.obid = -1
				}));
				t.map.on("click", lang.hitch(t, function(event) {
					if ( t.obid > -1 ){ 
						var p = "r"
						$('#' + t.appDiv.id + 'ch-FUT').val(String(t.obid)).trigger('chosen:updated').trigger('change', p)
					}	
				}));
				t.fManyPinFL.on('selection-complete', lang.hitch(t,function(evt){
					if (evt.features.length > 100) {
						t.fManyPinFL.clear();
						$('#' + t.appDiv.id + 'queryParMany').slideDown();
						$('#' + t.appDiv.id + 'queryParNone').slideUp();
						$('#' + t.appDiv.id + 'fParSelWrapper').slideUp();
					}else{
						if (evt.features.length > 0) {
							t.obj.totalFuturePoints = 0;
							t.futDDoptions = [];
							$.each(evt.features, lang.hitch(t, function(i,v){
								t.obj.totalFuturePoints = t.obj.totalFuturePoints + v.attributes.OSP_fpts;
								t.futDDoptions.push({acres: v.attributes.OSP_fac, tax: v.attributes.TAX_VALUE, obid: v.attributes.OBJECTID})
							}));
							// Update dropdown list of parcels by acres and tax value
							t.esriapi.futureDropdown(t);
							
							// Update bar graphs values - get cur and potential points
							t.n = [t.atts.OSP_PTS_2013, t.atts.SUM_ALL_cpts, t.obj.totalFuturePoints]
							// find the remaining value so bar numbers can be calculated as percentages
							var m = 2020 - (t.n[0] + t.n[1] + t.n[2])
							t.n.push(m)
							
							// Create empty array and populate it with percentages of current, potential, and remaining
							var p = [];
							$.each(t.n, lang.hitch(t, function(i,v){
								var x = Math.round(v/2020*100);
								p.push(x);
							}));
							$('#' + t.appDiv.id + 'futureGraph').css('display', 'inline-block');
							//$('#' + t.appDiv.id + 'graphLegLblF').show();
							// Update bar values with percentages array
							$('#' + t.appDiv.id + 'barf').animate({left : p[0]+p[1]+"%", width: p[2]+"%"});
							$('#' + t.appDiv.id + 'bar2').animate({left : p[0]+"%", width: p[1]+"%"});
							$('#' + t.appDiv.id + 'bar1').animate({left : "0%", width: p[0]+"%"});
							// Add labels to current and potential bars (round decimals and add commas as necessary)
							if (isNaN(t.atts.OSP_PTS_2013) == false){
								var curPnts = Math.round(t.atts.OSP_PTS_2013);
								curPnts = t.esriapi.commaSeparateNumber(curPnts);
								$('#' + t.appDiv.id + 'bar1L').html(curPnts)
							}	
							if (isNaN(t.atts.SUM_ALL_cpts) == false){
								var potPnts = Math.round(t.atts.SUM_ALL_cpts);
								potPnts = t.esriapi.commaSeparateNumber(potPnts);
								$('#' + t.appDiv.id + 'bar2L').html(potPnts);
							}
							if (isNaN(t.obj.totalFuturePoints) == false){
								var futPnts = Math.round(t.obj.totalFuturePoints);
								futPnts = t.esriapi.commaSeparateNumber(futPnts);
								$('#' + t.appDiv.id + 'barfL').html(futPnts);
								$('#' + t.appDiv.id + 'futurePointsSum').html(futPnts)
							}
							
							$('#' + t.appDiv.id + 'futureParcelCount').html(evt.features.length)
							$('#' + t.appDiv.id + 'queryParNone, #' + t.appDiv.id + 'queryParMany').slideUp();
							$('#' + t.appDiv.id + 'toggleQuery').html('Hide Query');
							$('#' + t.appDiv.id + 'fParSelWrapper').slideDown();
							t.obj.queryVis = "yes";
						}else{
							t.fManyPinFL.clear();
							$('#' + t.appDiv.id + 'fParSelWrapper').slideUp();
							$('#' + t.appDiv.id + 'queryParMany').slideUp();
							$('#' + t.appDiv.id + 'queryParNone').slideDown();
						}	
					}
					$('.accrodBg').removeClass('waiting');					
				}));
				$('#' + t.appDiv.id + 'toggleQuery').on('click', lang.hitch(t,function(evt){
					if ($('#' + t.appDiv.id + 'toggleQuery').html() == 'Show Query'){
						$('#' + t.appDiv.id + 'toggleQueryWrap').slideDown();
						$('#' + t.appDiv.id + 'toggleQuery').html('Hide Query');
						t.obj.queryVis = "yes";
					}else{
						$('#' + t.appDiv.id + 'toggleQueryWrap').slideUp();
						$('#' + t.appDiv.id + 'toggleQuery').html('Show Query');
						t.obj.queryVis = "no";
					}
				}));	
				// Track extent changes for pin zooms
				t.pinTracker = "no"			
				// Create a feature layer of the selected layer and add mouseover, mouseout, and click listeners
				t.crsFL = new FeatureLayer(t.url + "/0", { mode: FeatureLayer.MODE_SELECTION, outFields: ["*"] });
				//t.crsFL.setSelectionSymbol(selSymbol);
				t.crsFL.on('selection-complete', lang.hitch(t,function(evt){
					// Get and zoom to extent of selected feature
					var crsExtent = evt.features[0].geometry.getExtent();				
					if ( t.stateSet == "yes" ){	
						var extent = new Extent(t.obj.extent.xmin, t.obj.extent.ymin, t.obj.extent.xmax, t.obj.extent.ymax, new SpatialReference({ wkid:4326 }))
						t.map.setExtent(extent, true);
						t.obj.extent = "";
						if (t.obj.section == 'ospAppBtn'){
							// Change stateSet to no because download data for OSP selected and a community was selected.
							t.stateSet = "no";
						}	
					}else{
						t.map.setExtent(crsExtent, true); 
					}
					// Get attributes of selected feature
					t.atts = evt.features[0].attributes;
					// User clicked download section on home page
					if (t.obj.section == "ospAppBtn" || t.obj.section == "futureOSPBtn"){
						// Loop through all elements with class s2Atts in the step1 div and use their IDs to show selected features attributes
						$('#' + t.appDiv.id + 'step2 .s2Atts').each(lang.hitch(t,function (i,v){
							var field = v.id.split("-").pop()
							var val = t.atts[field]
							if ( isNaN(t.atts[field]) == false ){
								val = Math.round(val);
								val = t.esriapi.commaSeparateNumber(val);
							}	
							$('#' + v.id).html(val)
						}));
						// Update bar graphs values - get cur and potential points
						t.n = [t.atts.OSP_PTS_2013, t.atts.SUM_ALL_cpts]
						// find the remaining value so bar numbers can be calculated as percentages
						var m = 2020 - (t.n[0] + t.n[1])
						t.n.push(m)
						// Create empty array and populate it with percentages of current, potential, and remaining
						var p = [];
						$.each(t.n, lang.hitch(t, function(i,v){
							var x = Math.round(v/2020*100);
							p.push(x);
						}));
						// Update bar values with percentages array
						$('#' + t.appDiv.id + 'barf').animate({left : "0%", width: "0%"});
						$('#' + t.appDiv.id + 'bar2').animate({left : p[0]+"%", width: p[1]+"%"});
						$('#' + t.appDiv.id + 'bar1').animate({left : "0%", width: p[0]+"%"});
						// Add labels to current and potential bars (round decimals and add commas as necessary)
						if (isNaN(t.atts.OSP_PTS_2013) == false){
							var curPnts = Math.round(t.atts.OSP_PTS_2013);
							curPnts = t.esriapi.commaSeparateNumber(curPnts);
							$('#' + t.appDiv.id + 'bar1L').html(curPnts)
						}	
						if (isNaN(t.atts.SUM_ALL_cpts) == false){
							var potPnts = Math.round(t.atts.SUM_ALL_cpts);
							potPnts = t.esriapi.commaSeparateNumber(potPnts);
							$('#' + t.appDiv.id + 'bar2L').html(potPnts);
						}
					}
					// Future Save and Share
					if (t.stateSet == "yes" && t.obj.section == 'futureOSPBtn'){
						if (t.obj.subSection == 'zoomParNavBtn'){	
							if (t.searchedPin != ''){
								$('#' + t.appDiv.id + 'pinSearch').val(t.searchedPin);
								$('#' + t.appDiv.id + 'searchPin').trigger('click');
							}else{
								//Change stateSet to no because future selected, zoom to parcels select, but no PIN search
								t.stateSet = "no"
							}								
						}	
						if (t.obj.subSection == 'queryParNavBtn'){
							if (t.obj.acreGrLs == '>'){
								$('#' + t.appDiv.id + 'acresGrThan').trigger('click');	
							}else{
								$('#' + t.appDiv.id + 'acresLsThan').trigger('click');	
							}
							if (t.obj.futQuAndOr == 'AND'){
								$('#' + t.appDiv.id + 'futQuAnd').trigger('click');	
							}else{
								$('#' + t.appDiv.id + 'futQuOr').trigger('click');	
							}
							if (t.obj.taxGrLs == '>'){
								$('#' + t.appDiv.id + 'taxGrThan').trigger('click');	
							}else{
								$('#' + t.appDiv.id + 'taxLsThan').trigger('click');	
							}
							$('#' + t.appDiv.id + 'futAcreVal').val(t.obj.futAcreVal);
							$('#' + t.appDiv.id + 'futTaxVal').val(t.obj.futTaxVal);
							if (t.obj.parQueryClicked == "yes"){
								$('#' + t.appDiv.id + 'queryParcels').trigger('click');
							}else{
								//Change stateSet to no because future selected, query parcels selected, and no query performed
								t.stateSet = "no";
							}	
						}						
					}	
				}));	
				//t.map.addLayer(t.crsFL);
				t.map.addLayer(t.pinFL);
				t.map.addLayer(t.fManyPinFL);
				t.map.addLayer(t.fPinFL);
				//t.resize();
				
				// Create and handle transparency slider
				$('#' + t.appDiv.id + 'slider').slider({ min: 0,	max: 10, value: t.obj.sliderVal });
				$('#' + t.appDiv.id + 'slider').on( "slidechange", lang.hitch(t,function( e, ui ) {
					t.obj.sliderVal = ui.value;
					t.dynamicLayer1.setOpacity(1 - ui.value/10);
				}));	
			},
			futureDropdown: function(t){
				// Create sorted objects by tax and acreage for teh returned parcels
				t.aSm = _.sortBy( t.futDDoptions, 'acres' );
				t.aLr = _.sortBy( t.futDDoptions, 'acres' ).reverse();
				t.tSm = _.sortBy( t.futDDoptions, 'tax' );
				t.tLr = _.sortBy( t.futDDoptions, 'tax' ).reverse();
				// Add conditional statements to determine which array to add to select menu	
				var resultArray = [];
				if (t.obj.futSortOn == 'acres' && t.obj.futSortOrder == "acen"){
					resultArray = t.aSm;
				}
				if (t.obj.futSortOn == 'acres' && t.obj.futSortOrder == "decen"){
					resultArray = t.aLr;
				}				
				if (t.obj.futSortOn == 'taxval' && t.obj.futSortOrder == "acen"){
					resultArray = t.tSm;
				}
				if (t.obj.futSortOn == 'taxval' && t.obj.futSortOrder == "decen"){
					resultArray = t.tLr;
				}
				$('#' + t.appDiv.id + 'ch-FUT').empty();
				$('#' + t.appDiv.id + 'ch-FUT').append("<option value=''></option>");
				$.each(resultArray, lang.hitch(t,function(i,v){
					var acres = Math.round(v.acres);
					acres = t.esriapi.commaSeparateNumber(acres);
					var tax = t.esriapi.commaSeparateNumber(v.tax);
					$('#' + t.appDiv.id + 'ch-FUT').append("<option value='" + v.obid + "'>" + acres + " acres | $" + tax + "</option>");
				}));
				$('#' + t.appDiv.id + 'ch-FUT').trigger("chosen:updated");
				// Save state functions
				if (t.stateSet == 'yes'){
					if (t.obj.futSortOn == 'acres'){
						$('#' + t.appDiv.id + 'futTaxSort').removeClass('navBtnSel');
						$('#' + t.appDiv.id + 'futAcreSort').addClass('navBtnSel');	
					}	
					if (t.obj.futSortOn == 'taxval'){
						$('#' + t.appDiv.id + 'futAcreSort').removeClass('navBtnSel');
						$('#' + t.appDiv.id + 'futTaxSort').addClass('navBtnSel');	
					}	
					if (t.obj.futSortOrder == "acen"){
						$('#' + t.appDiv.id + 'futDecen').removeClass('navBtnSel');
						$('#' + t.appDiv.id + 'futAcen').addClass('navBtnSel');
					}
					if (t.obj.futSortOrder == "decen"){
						$('#' + t.appDiv.id + 'futAcen').removeClass('navBtnSel');
						$('#' + t.appDiv.id + 'futDecen').addClass('navBtnSel');
					}
					if (t.futObid != -1){
						var p = "r"
						$('#' + t.appDiv.id + 'ch-FUT').val(String(t.futObid)).trigger('chosen:updated').trigger('change', p)		
					}else{
						//Change stateSet to no because future selected, query parcels selected, query performed, and no parcel selected from results
						t.stateSet = "no";
					}	
					if ( t.obj.sortVis == "yes" ){								
						$('#' + t.appDiv.id + 'futSortWrapper').slideDown();
						$('#' + t.appDiv.id + 'toggleFutSort').html('Hide Sort');
					}else { 				
						$('#' + t.appDiv.id + 'futSortWrapper').slideUp();
						$('#' + t.appDiv.id + 'toggleFutSort').html('Sort');
					}
							
				}	
			},
			commaSeparateNumber: function(val){
				while (/(\d+)(\d{3})/.test(val.toString())){
					val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
				}
				return val;
			},
			dateFinder: function(date){
				var month = date.getMonth() + 1;
				var day = date.getDate();
				var year = date.getFullYear();
				var d = month + "/" + day + "/" + year;
				return d;
			}			
        });
    }
);