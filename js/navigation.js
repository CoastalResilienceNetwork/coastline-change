define([
	"dojo/_base/declare", "dojo/dom-style", "dojo/_base/lang", "dojo/on", "esri/tasks/query",
	"esri/tasks/QueryTask",'esri/geometry/Extent', 'esri/SpatialReference'
],
function ( declare, domStyle, lang, on, Query, QueryTask, Extent, SpatialReference) {
        "use strict";

        return declare(null, {

			navListeners: function(t){				
				$("#" + t.id + "hfWrap input").on('click', lang.hitch(t,function(c){
					if (c.target.id == t.id + 'futureBtn'){
						ga('send', 'event', 'VA Coastline Change', 'Clicked Future Scenerios');
						t.map.graphics.clear();
						$('label[for=' + t.id + 'futureBtn]').css({"padding":"0px 7px", "font-size":"0.9em"})
						$('label[for=' + t.id + 'futureBtn]').html('Zooming is disabled for Future Scenarios');
						$.each($('.basemap-selector-list ul li'), lang.hitch(t,function(i,v){
							if ($(v).html() == 'Basic Dark Gray'){
								$(v).trigger('click')
							}	
						}));
						$('.basemap-selector').hide();
						t.map.hideZoomSlider();
						t.map.disableDoubleClickZoom();
						t.map.disableRubberBandZoom();
						t.map.disableScrollWheelZoom();
						t.obj.section = 'futureBtn';
						t.histExtent = t.map.extent;
						var futureExtent = new Extent( -76.1, 37.0, -75.2, 38.1, new SpatialReference({ wkid:4326 }) );
						t.map.setExtent(futureExtent.expand(1));
						if (t.sliderPlayBtn  == 'play'){
							t.sliderPlayBtn  == ''
							$('#' + t.id + 'sliderStop').trigger('click');
						}
						$('#' + t.id + 'historicalWrapper').slideUp();
						$('#' + t.id + 'futureWrapper').slideDown();
						$('#' + t.id + t.obj.riseBtn).trigger('click');
						$('#' + t.id + t.obj.waveBtn).trigger('click');
						$('#' + t.id + t.obj.nourBtn).trigger('click');
						t.shortTermChange.clear();
						t.longTermChange.clear();
					}
					if (c.target.id == t.id + 'historicalBtn'){
						ga('send', 'event', 'VA Coastline Change', 'Clicked Hitorical Data Button');
						$('label[for=' + t.id + 'futureBtn]').css({"padding":"7px", "font-size":"1em"})
						$('label[for=' + t.id + 'futureBtn]').html(' View Future Scenarios');
						$.each($('.basemap-selector-list ul li'), lang.hitch(t,function(i,v){
							if ($(v).html() == 'Imagery'){
								$(v).trigger('click')
							}	
						}));
						$('.basemap-selector').show();
						t.map.showZoomSlider();
						t.map.enableDoubleClickZoom();
						t.map.enableRubberBandZoom();
						t.map.enableScrollWheelZoom();
						if (t.obj.section == 'futureBtn'){
							t.map.setExtent(t.histExtent);
						}else{
							t.map.setExtent(t.dynamicLayer.fullExtent);
						}
						t.obj.section = 'historicalBtn';
						t.obj.visibleLayers = t.obj.historicLayers;
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
						$('#' + t.id + 'futureWrapper').slideUp();
						$('#' + t.id + 'historicalWrapper').slideDown();
					}	
				}));	
				$('#' + t.id + 'historicalBtn1').on('click', lang.hitch(t,function(){
					
				}));
				$('#' + t.id + 'longBtn').on('click', lang.hitch(t,function(){
					ga('send', 'event', 'VA Coastline Change', 'Clicked long term change rate');
					t.shortTermChange.clear();
					t.obj.termSelected = 'Long';
					t.esriapi.changeRatePercent(t);
					t.obj.historicLayers = [t.obj.islandsLyr,t.obj.chRateLnLyr];
					t.obj.visibleLayers = t.obj.historicLayers;
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					$('#' + t.id + 'transectWrap').slideUp();
				}));
				// short button click
				$('#' + t.id + 'shortBtn').on('click', lang.hitch(t,function(){
					ga('send', 'event', 'VA Coastline Change', 'Clicked long term change rate');
					t.longTermChange.clear();
					t.obj.termSelected = 'Short';
					t.esriapi.changeRatePercent(t);
					t.obj.historicLayers = [t.obj.islandsLyr,t.obj.chRateShLyr];
					t.obj.visibleLayers = t.obj.historicLayers;
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					$('#' + t.id + 'transectWrap').slideUp();
				}));
// SHORELINE CHECKBOXES //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				$('#' + t.id + 'chRateBtn').on('click', lang.hitch(t,function(){
					ga('send', 'event', 'VA Coastline Change', 'Clicked change rate button');
					clearInterval(t.setInt);
					t.obj.dataTypeButton = 'chRateBtn';
					$('#' + t.id + 'multiShoreLine, #' + t.id + 'historicalShoreWrapper').slideUp();
					$('#' + t.id + 'chartWrapper, #' + t.id + 'termWrapper').slideDown();
					if(t.obj.termSelected == 'Long'){
						t.obj.historicLayers = [t.obj.islandsLyr,t.obj.chRateLnLyr];
						t.obj.visibleLayers = t.obj.historicLayers;
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					}else{
						t.obj.historicLayers = [t.obj.islandsLyr,t.obj.chRateShLyr];
						t.obj.visibleLayers = t.obj.historicLayers;
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					}
				}));
				// Historical shorelines button click
				$('#' + t.id + 'hisShoreBtn').on('click', lang.hitch(t,function(){
					ga('send', 'event', 'VA Coastline Change', 'Clicked historic shoreline button');
					t.shortTermChange.clear();
					t.longTermChange.clear();
					t.obj.dataTypeButton = 'hisShoreBtn';
					$('#' + t.id + 'multiShoreLine, #' + t.id + 'historicalShoreWrapper').slideDown();
					$('#' + t.id + 'chartWrapper, #' + t.id + 'termWrapper').slideUp();
					if(t.obj.yearSliderMulti == 'sliderBtn'){
						t.obj.sliderYearQuery = "CRToolDate = '" + t.obj.sliderYear + "'";
						t.clicks.setSliderYear(t);
						t.obj.historicLayers = [t.obj.islandsLyr,t.obj.shorelineLyr];
						t.obj.visibleLayers = t.obj.historicLayers;
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					}
					if(t.obj.yearSliderMulti == 'multiBtn'){
						t.obj.historicLayers = [t.obj.islandsLyr,t.obj.shorelineLyr]
						t.obj.visibleLayers = t.obj.historicLayers;
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					}
				}));
				// slider button click
				$('#' + t.id + 'sliderBtn').on('click', lang.hitch(t,function(){
					t.obj.yearSliderMulti = 'sliderBtn';
					$('#' + t.id + 'multiShoreCheck').slideUp();
					$('#' + t.id + 'singleShore').slideDown();
					t.obj.historicLayers = [t.obj.islandsLyr,t.obj.shorelineLyr];
					t.obj.visibleLayers = t.obj.historicLayers;
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					t.obj.sliderYearQuery = "CRToolDate = '" + t.obj.sliderYear + "'";
					t.clicks.setSliderYear(t);
				}));
				// multi button click
				$('#' + t.id + 'multiBtn').on('click', lang.hitch(t,function(){	
					t.obj.yearSliderMulti = 'multiBtn';
					if (t.obj.checkedMultiYears.length == 0){
						t.obj.checkedMultiYears.push(t.obj.sliderYear);
					}
					$('#' + t.id + 'multiShoreCheck input').each(lang.hitch(t,function(i, v){
						$(v).prop('checked', false);
					}));
					$('#' + t.id + 'multiShoreCheck input').each(lang.hitch(t,function(i, v){
						$.each(t.obj.checkedMultiYears, lang.hitch(t,function(j,w){
							if (v.value == w){
								$(v).prop('checked', true);
							}	
						}))
					}))
					t.clicks.showMultiYears(t);					
					if (t.sliderPlayBtn  == 'play'){
						$('#' + t.id + 'sliderStop').trigger('click');
					}
					$('#' + t.id + 'multiShoreCheck').slideDown();
					$('#' + t.id + 'singleShore').slideUp();
				}));
				// Handle Class changes on all togBtn clicks
				$('#' + t.id + ' .togBtn').on('click', lang.hitch(t,function(c){		
					// Go to parent of selected button, find all elements with class togBtn, and remove togBtnSel from each one
					$.each($(c.currentTarget).parent().find('.togBtn'), lang.hitch(t,function(i, x){
						$(x).removeClass('togBtnSel');
					}))
					// Add togBtnSel class to selected button
					$(c.currentTarget).addClass('togBtnSel');
				}));
			},
			setNavBtns: function(t){
				//$('#' + t.id + t.obj.section).trigger('click');
				if (t.obj.section == 'historicalBtn'){
					$('#' + t.appDiv.id + 'ch-ISL').val(t.obj.islSelected).trigger('chosen:updated').trigger('change');
					// click change rate or historic shorelines
					$('#' + t.id + t.obj.dataTypeButton).trigger('click');
					// click slider or multiple button as selected 				
					$('#' + t.appDiv.id + t.obj.yearSliderMulti).trigger('click');
					// check boxes for multi
					$(t.obj.checkedMultiYears).each(lang.hitch(t,function(i, v){
						$('#' + t.appDiv.id + 'ch-' + v).prop("checked", true);
					}));	
					$('#' + t.id + 'multiShoreSlider').slider('value', t.obj.sliderCounter);	
					
				}	
				$('#' + t.id + t.obj.section).trigger('click');
			}	
        });
    }
);