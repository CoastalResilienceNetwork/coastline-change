define([
	"esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/tasks/query" ,"esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", 
	"esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/graphic", "dojo/_base/Color", "dojo/_base/lang", "dojo/on", "jquery", './jquery-ui-1.11.2/jquery-ui'
],
function ( 	ArcGISDynamicMapServiceLayer, Extent, SpatialReference, Query, QueryTask, declare, FeatureLayer, 
			SimpleLineSymbol, SimpleFillSymbol, Graphic, Color, lang, on, $, ui) {
        "use strict";

        return declare(null, {
			esriApiFunctions: function(t){	
				// Add dynamic map service
				t.dynamicLayer = new ArcGISDynamicMapServiceLayer(t.url);
				t.map.addLayer(t.dynamicLayer);
				t.dynamicLayer.on("load", lang.hitch(t, function () { 
					t.obj.visibleLayers = t.obj.historicLayers;				
					if (t.obj.visibleLayers.length > 0){	
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					}
					t.layersArray = t.dynamicLayer.layerInfos;
					t.histExtent = t.map.extent;
					t.navigation.setNavBtns(t);
				}));
				// feature layers
				t.islFeat = new FeatureLayer(t.url + "/" + t.obj.islandsLyr, { mode: FeatureLayer.MODE_SELECTION, outFields: ["*"] });
				t.islFeat.on('selection-complete', lang.hitch(t,function(evt){
					var islExtent = evt.features[0].geometry.getExtent();
					t.map.setExtent(islExtent, true);
				}));
				t.islandPolygons = new FeatureLayer(t.url + "/" + t.obj.islandsLyr, { mode: FeatureLayer.MODE_SELECTION, outFields: ["*"] });
				t.islandPolygons.on('mouse-over',lang.hitch(t,function(evt){
					if ( t.obj.section == 'historicalBtn' ) {
						t.map.graphics.clear();
						t.map.setMapCursor("pointer");
						var highlightGraphic = new Graphic(evt.graphic.geometry,t.selSymbolBh1);
						t.map.graphics.add(highlightGraphic);
					}	
				}));
				t.map.graphics.on("mouse-out", lang.hitch(t,function(){
					if ( t.obj.section == 'historicalBtn' ) {
						t.map.setMapCursor("default");
						t.map.graphics.clear();
					}	
				}));
				t.islandPolygons_click = new FeatureLayer(t.url + "/" + t.obj.islandsLyr, { mode: FeatureLayer.MODE_SELECTION, outFields: ["*"] });
				t.islandPolygons_click.on('selection-complete',lang.hitch(t,function(evt){
					if(evt.features.length > 0){
						if(t.obj.trigger == 'mapClick'){
							var islandValue = evt.features[0].attributes.IslandName;
							$('#' + t.id + 'ch-ISL').val(islandValue).trigger('chosen:updated').trigger('change');
						}
						t.map.graphics.clear();
					}
				}));
				t.shortTermChange = new FeatureLayer(t.url + "/" + t.obj.chRateShLyr, { mode: FeatureLayer.MODE_SELECTION, outFields: ["*"] });
				t.shortTermChange.on('selection-complete', lang.hitch(t,function(evt){
					if(evt.features.length > 0){
						t.esriapi.transectAtts(t, evt.features[0].attributes);
					}else{
						$('#' + t.id + 'transectWrap').slideUp();
					}		
				}));
				t.longTermChange = new FeatureLayer(t.url + "/" + t.obj.chRateLnLyr, { mode: FeatureLayer.MODE_SELECTION, outFields: ["*"] });
				t.longTermChange.on('selection-complete', lang.hitch(t,function(evt){
					if(evt.features.length > 0){
						t.esriapi.transectAtts(t, evt.features[0].attributes);
					}else{
						$('#' + t.id + 'transectWrap').slideUp();
					}
				}));
				// symbols
				var sls = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([255,255,0]), 3 );
				t.selSymbolBh1 = new SimpleFillSymbol( SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol( SimpleLineSymbol.STYLE_SOLID, new Color([0,0,255]), 2 ), new Color([255,255,255,0.3]) );
				t.selSymbolBh2 = new SimpleFillSymbol( SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol( SimpleLineSymbol.STYLE_SOLID, new Color([44, 96, 124, 0]), 0 ), new Color([0,0,0,0]) );
				
				t.islandPolygons.setSelectionSymbol(t.selSymbolBh2);
				t.shortTermChange.setSelectionSymbol(sls);
				t.longTermChange.setSelectionSymbol(sls);
				// query island polygons
				t.q = new Query();
				t.q.returnGeometry = false;
				t.q.outFields = ['OBJECTID_1','IslandName'];
				t.q.where = "OBJECTID_1 > -1"
				t.islandPolygons.selectFeatures(t.q,FeatureLayer.SELECTION_NEW);
				// add map feature layers
				t.map.addLayer(t.islandPolygons);
				//t.map.addLayer(t.islandPolygons_click);
				t.map.addLayer(t.shortTermChange);
				t.map.addLayer(t.longTermChange);
				// handle on click of map to query out attributes
				t.map.on("click", lang.hitch(t, function(evt) {
					if ( t.obj.section == 'historicalBtn' ) {
						var query = new Query();
						query.geometry = evt.mapPoint;
						t.obj.trigger = 'mapClick'
						t.islandPolygons_click.selectFeatures(query,esri.layers.FeatureLayer.SELECTION_NEW);
						if (t.obj.dataTypeButton == 'chRateBtn'){
							t.shortTermChange.clear();
							t.longTermChange.clear();
							query.distance = 10;
							if (t.obj.termSelected == 'Short'){	
								t.shortTermChange.selectFeatures(query,esri.layers.FeatureLayer.SELECTION_NEW);
							}
							if (t.obj.termSelected == 'Long'){	
								t.longTermChange.selectFeatures(query,esri.layers.FeatureLayer.SELECTION_NEW);
							}
						}	
					}	
				}));
			},
			esriStartUp: function(t){
				// get future array
				t.futurePercents = [];
 				var cq = new Query();
				var cqt = new QueryTask(t.url + "/44");
				cq.where = "OBJECTID > -1";
				cq.returnGeometry = false;
				cq.outFields = ["cleanName, percentArray"];
				cqt.execute(cq, lang.hitch(t,function(e){
					$.each(e.features, lang.hitch(t,function(i,v){
						t.futurePercents.push(v.attributes);
					}));
				}))	
				// get change rate percentages
				t.chngRtPercents = [];
				var ltQueryTask = new QueryTask(t.url + "/45")
				var ltQuery = new Query();
				ltQuery.returnGeometry = false;
				ltQuery.outFields = ['IslandName','perErosionLong','perAccretionLong', 'perErosionShort','perAccretionShort'];
				ltQuery.where = "OBJECTID_1 > -1"
				ltQueryTask.execute(ltQuery, lang.hitch(this, function(results){	
					$.each(results.features, lang.hitch(t,function(i,v){
						t.chngRtPercents.push(v.attributes);
					}));
					t.esriapi.changeRatePercent(t);
				}));
			},
			changeRatePercent: function(t){
				$.each(t.chngRtPercents, lang.hitch(t,function(i,v){
					if(v.IslandName == t.obj.islSelected){
						var pA = "perAccretion" + t.obj.termSelected;
						var pE = "perErosion" + t.obj.termSelected;
						//blue bar
						$('#' + t.id + 'bar2').animate({left : v[pA] +"%", width: v[pE] +"%"});
						// orange bar 
						$('#' + t.id + 'bar1').animate({left : "0%", width: v[pA] +"%"});
						$('#' + t.id + 'bar2L').html(v[pE] +"%")
						$('#' + t.id + 'bar1L').html(v[pA] +"%")
					}
				}));
				$('#' + t.id + 'chartTitle').text(t.obj.islandText + ' – ' + t.obj.termSelected + ' Term Change')
			},
			transectAtts: function(t, a){
				if (a.Shoreline == 0){
					$('#' + t.id + 'transectWrap .tsect').each(lang.hitch(t,function(i, v){
						var field = v.id.split("-").pop()
						var val = a[field]
						if ( isNaN(a[field]) == false ){
							val = Math.round(val);
						}	
						$('#' + v.id).html(val)
					}));
					if (t.obj.termSelected == 'Long'){
						$('#' + t.id + 'longWrap').show();	
						$('#' + t.id + 'shortWrap').hide();	
					}	
					if (t.obj.termSelected == 'Short'){
						$('#' + t.id + 'longWrap').hide();	
						$('#' + t.id + 'shortWrap').show();	
					}
					$('#' + t.id + 'transectWrap').slideDown();
				}
				if (a.Shoreline == 1){
					t.shortTermChange.clear();
					t.longTermChange.clear();
					$('#' + t.id + 'transectWrap').slideUp();
				}		
			},
			commaSeparateNumber: function(val){
				while (/(\d+)(\d{3})/.test(val.toString())){
					val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
				}
				return val;
			}			
		});
    }
);