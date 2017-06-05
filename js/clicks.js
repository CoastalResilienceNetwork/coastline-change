define([
	"esri/tasks/query", "esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", "dojo/_base/lang", "dojo/on"
],
function ( Query, QueryTask, declare, FeatureLayer, lang, on ) {
        "use strict";

        return declare(null, {
			chosenListeners: function(t){
				t.obj.sliderYearQuery = "CRToolDate = '" + t.obj.sliderYear + "'";
				// Enable jquery plugin 'chosen'
				require(["jquery", "plugins/coastline-change/js/chosen.jquery"],lang.hitch(this,function($) {
					var configCrs =  { '.chosen-islands' : {allow_single_deselect:false, width:"280px", disable_search:true}}
					for (var selector in configCrs)  { $(selector).chosen(configCrs[selector]); }
				}));
				// User selections on chosen menus 
				require(["jquery", "plugins/coastline-change/js/chosen.jquery"],lang.hitch(t,function($) {	
					//Select CRS 
					$('#' + t.id + 'ch-ISL').chosen().change(lang.hitch(t,function(c, p){
						t.obj.islSelected = c.currentTarget.value;
						ga('send', 'event', 'VA Coastline Change', t.obj.islSelected + ' Selected From Dropdown');
						$.each(c.currentTarget, lang.hitch(t,function(i,v){
							if (v.selected === true){
								t.obj.islandText = $(v).html();	
							}	
						}))	
						if(c.target.value != 'EasternShore'){
							t.eq = "=";
							// query to zoom to island
							var q = new Query();
							q.where = "IslandName = '" + t.obj.islSelected + "'";
							t.islFeat.selectFeatures(q,FeatureLayer.SELECTION_NEW);
							// Hide selected island polygon
							var q1 = new Query();
							q1.where = "IslandName <> '" + t.obj.islSelected + "'";
							t.islandPolygons.selectFeatures(q1,FeatureLayer.SELECTION_NEW);
							t.islandPolygons_click.setDefinitionExpression("IslandName <> '" + t.obj.islSelected + "'");
							// Hide selcted island label
							var layerDefinitions = [];
							layerDefinitions[t.obj.islandsLyr] = q1.where;
							layerDefinitions[t.obj.chRateShLyr] = "Island = '" + t.obj.islSelected + "'";
							layerDefinitions[t.obj.chRateLnLyr] = "Island = '" + t.obj.islSelected + "'";
							layerDefinitions[t.obj.shorelineLyr] = t.obj.sliderYearQuery + " AND IslandName " + t.eq + "'" + t.obj.islSelected + "'";
							t.dynamicLayer.setLayerDefinitions(layerDefinitions);
							// check to see if in historical 
							if(t.obj.dataTypeButton == 'hisShoreBtn'){
								t.obj.visibleLayers = [t.obj.islandsLyr,t.obj.shorelineLyr];
								t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
							}							
						}else{
							t.eq = "<>";
							// Show all island labels
							var layerDefinitions = [];
							layerDefinitions[t.obj.islandsLyr] = "IslandName <> 'a'";
							layerDefinitions[t.obj.shorelineLyr] = t.obj.sliderYearQuery + " AND IslandName " + t.eq + "'" + t.obj.islSelected + "'";
							t.dynamicLayer.setLayerDefinitions(layerDefinitions);
							t.islandPolygons_click.setDefinitionExpression("IslandName <> 'xyz'");
							var q1 = new Query();
							q1.where = "IslandName <> 'xyz'";
							t.islandPolygons.selectFeatures(q1,FeatureLayer.SELECTION_NEW);
							// zoom to eastern shore
							t.map.setExtent(t.obj.initialExtent, true);
						}
						t.esriapi.changeRatePercent(t);
						if(t.obj.trigger != 'mapClick'){
							var query = new esri.tasks.Query();
							query.where = "IslandName = '" + t.obj.islSelected + "'"
							t.islandPolygons_click.selectFeatures(query,esri.layers.FeatureLayer.SELECTION_NEW);
							t.obj.trigger = 'dropDown'
						}
					}));
				}));
				// HANDLE INDIVIDUAL SHORELINE CHECKBOX CLICKS AND CHECK ALL YEAR SHORELINES///////////////////////////////////////////////////////////////////////////////////
				$('#' + t.id + 'multiShoreCheck input').on('click',lang.hitch(this,function(c){
					t.obj.checkedMultiYears = [];
					$('#' + t.id + 'multiShoreCheck input').each(lang.hitch(t,function(i, v){
						if(v.checked == true){
							var lyr = v.value + " Shoreline";
							t.obj.checkedMultiYears.push(v.value)						
						}
					}));
					if (t.obj.checkedMultiYears.length == 0){
						t.obj.visibleLayers = [t.obj.islandsLyr];
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					}else{	
						t.obj.visibleLayers = [t.obj.islandsLyr,t.obj.shorelineLyr];
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
						t.clicks.showMultiYears(t);
					}	
				}));
				// SET UP SLIDER AND ADD EVENT LISTENER //////////////////
				var vals = 13;
				var labels = ['1850s','1910s','1940s', '1962', '1970s', '1985-6', '1994', '2002', '2004', '2006', '2009', '2011', '2013', '2014'];
				for (var i = 0; i <= vals; i++) {
					var el = $('<label>'+(labels[i])+'</label>').css('left',(i/vals*100)+'%');
					$('#' + t.id + 'multiShoreSlider').append(el);
				}
				$('#' + t.id + 'multiShoreSlider').on('slide', lang.hitch(this,function(w,evt){
					t.obj.sliderYear = labels[evt.value];
					t.obj.sliderYearQuery = "CRToolDate = '" + t.obj.sliderYear + "'";
					t.clicks.setSliderYear(t);
					if (t.sliderPlayBtn  == 'play'){
						t.sliderPlayBtn  == ''
						$('#' + t.id + 'sliderStop').trigger('click');
					}
				}));
				// slider play button click
				$('#' + t.id + 'sliderPlay').on('click', lang.hitch(t,function(){
					$('#' + t.id + 'sliderPlay').addClass('hide');
					$('#' + t.id + 'sliderStop').removeClass('hide');
					t.sliderPlayBtn  = 'play' 
					t.setInt = setInterval(function(){
						$('#' + t.id + 'multiShoreSlider').slider('value',t.obj.sliderCounter);
						t.obj.sliderYear = labels[t.obj.sliderCounter];
						t.obj.sliderYearQuery = "CRToolDate = '" + t.obj.sliderYear + "'";
						t.clicks.setSliderYear(t);
						t.obj.sliderCounter++
						if(t.obj.sliderCounter>13){
							t.obj.sliderCounter = 0
						}
					}, 1000);
				}));
				//slider stop button click
				$('#' + t.id + 'sliderStop').on('click', lang.hitch(t,function(){
					$('#' + t.id + 'sliderPlay').removeClass('hide');
					$('#' + t.id + 'sliderStop').addClass('hide');
					clearInterval(t.setInt);
					t.sliderPlayBtn  = '';
				}));
				//FUTURE CLICKS ////////////////////
				//inlet arrays
				t.inlet1 = ['Future Scenarios: High - Greater NE - None','Future Scenarios: Highest - Greater NE - None',
							'Future Scenarios: High - Greater NE - Wallops', 'Future Scenarios: High - Greater NE - Assateague',
							'Future Scenarios: High - Greater NE - Both', 'Future Scenarios: Highest - Greater NE - Wallops',
							'Future Scenarios: Highest - Greater NE - Assateague', 'Future Scenarios: Highest - Greater NE - Both'];
				t.inlet2 = ['Future Scenarios: High - Lesser NE - Both', 'Future Scenarios: Highest - Lesser NE - Both'];
				// click on any of the buttons in the future wrapper section.
				$('#' + t.id + 'futButtonWrapper input').on('click', lang.hitch(t,function(c){
					t.obj.visibleLayers = [t.obj.islandsLyr];
					var nm = c.target.value;		
					// Add conditional logic based on id of parent div
					var pid = $('#' + c.currentTarget.id).parent().parent().prop('id');
					if (pid == t.id + "riseWrapper"){
						t.obj.seaLevelValue = nm;
						t.obj.riseBtn = "-" + c.target.id.substr(c.target.id.indexOf("-") + 1);
					}
					if (pid == t.id + "waveWrapper"){
						t.obj.waveValue = " - " + nm;
						t.obj.waveBtn = "-" + c.target.id.substr(c.target.id.indexOf("-") + 1);
					}
					if (pid == t.id + "nourWrapper"){
						t.obj.nourValue = " - " + nm;
						t.obj.nourBtn = "-" + c.target.id.substr(c.target.id.indexOf("-") + 1);						
					}
					t.obj.fsLyrName = "Future Scenarios: " + t.obj.seaLevelValue + t.obj.waveValue + t.obj.nourValue;
					if (t.obj.nourValue == ' - Wallops'){
						t.obj.visibleLayers.push(t.obj.nourishWa)
					}
					if (t.obj.nourValue == ' - Assateague'){
						t.obj.visibleLayers.push(t.obj.nourishAs)
					}
					if (t.obj.nourValue == ' - Both'){
						t.obj.visibleLayers.push(t.obj.nourishAs)
						t.obj.visibleLayers.push(t.obj.nourishWa)
					}
					// Comment out to no longer show "Areas with enhanced potential for inlet opening" layers
					$.each(t.inlet1, lang.hitch(t,function(i,v){
						if 	(t.obj.fsLyrName == v){
							t.obj.visibleLayers.push(t.obj.inlet1Lyr)	
						}	
					}))
					$.each(t.inlet2, lang.hitch(t,function(i,v){
						if 	(t.obj.fsLyrName == v){
							t.obj.visibleLayers.push(t.obj.inlet2Lyr)	
						}	
					}))	 		
					$.each(t.layersArray, lang.hitch(t,function(i,v){
						if (t.obj.fsLyrName == v.name){
							t.obj.visibleLayers.push(v.id);
							t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
							$.each(t.futurePercents, lang.hitch(t,function(j,w){
								if (w.cleanName == v.name){
									var a = JSON.parse(w.percentArray);
									a = a.splice(2, a.length);
									//a.reverse();
									t.barChart.updateChart(a, t)
								}	
							}));							
						}	
					}));	
				}));
				$('#' + t.id + 'moreInfoF').on('click',lang.hitch(t,function(){
					$('#' + t.id + 'moreInfoF span').toggle();
					$('#' + t.id + 'futButtonWrapper .futureInfo').slideToggle();
				}));
				$('#' + t.id + 'moreInfoH').on('click',lang.hitch(t,function(){
					$('#' + t.id + 'moreInfoH span').toggle();
					$('#' + t.id + 'historicalWrapper .historicInfo').slideToggle();
				}));
			},
			showMultiYears: function(t){
				var de = "";
				$.each(t.obj.checkedMultiYears, lang.hitch(t,function(i,v){
					if (i == 0){
						de = "'" + v + "'";	
					}else{
						de = de + ", '" + v + "'";
					}
				}))
				console.log(de)
				t.obj.sliderYearQuery = "CRToolDate IN (" + de + ")";
				t.clicks.setSliderYear(t);
			},	
			setSliderYear: function(t){
				var layerDefinitions = [];
				layerDefinitions[t.obj.islandsLyr] = "IslandName <> '" + t.obj.islSelected + "'";
				layerDefinitions[t.obj.shorelineLyr] = t.obj.sliderYearQuery + " AND IslandName " + t.eq + "'" + t.obj.islSelected + "'";
				t.dynamicLayer.setLayerDefinitions(layerDefinitions);	
			}	
        });
    }
);