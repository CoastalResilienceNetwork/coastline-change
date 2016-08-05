define([
	"esri/tasks/query", "dojo/_base/declare", "esri/layers/FeatureLayer", "dojo/_base/lang", "dojo/on", "jquery", './jquery-ui-1.11.2/jquery-ui'
],
function ( Query, declare, FeatureLayer, lang, on, $, ui ) {
        "use strict";

        return declare(null, {
			chosenListeners: function(t){
				// Enable jquery plugin 'chosen'
				require(["jquery", "plugins/community-rating-system/js/chosen.jquery"],lang.hitch(this,function($) {
					var configCrs =  { '.chosen-crs' : {allow_single_deselect:true, width:"200px", disable_search:true}}
					var configPin =  { '.chosen-pin' : {allow_single_deselect:true, width:"200px", search_contains:true}}
					var configfPin =  { '.chosen-fpin' : {allow_single_deselect:true, width:"250px", search_contains:true}}
					for (var selector in configCrs)  { $(selector).chosen(configCrs[selector]); }
					for (var selector in configPin)  { $(selector).chosen(configPin[selector]); }
					for (var selector in configfPin)  { $(selector).chosen(configfPin[selector]); }
				}));
				// User selections on chosen menus 
				require(["jquery", "plugins/community-rating-system/js/chosen.jquery"],lang.hitch(t,function($) {			
					//Select CRS 
					$('#' + t.appDiv.id + 'ch-CRS').chosen().change(lang.hitch(t,function(c, p){
						//Clear Items
						t.pinFL.clear();
						//$('#' + t.appDiv.id + 'step2 .gExp').show();
						//$('#' + t.appDiv.id + 'step2 .gCol').hide();
						//$('#' + t.appDiv.id + 'step2 .infoOpen').hide();
						t.map.graphics.clear();
						t.obj.pinSelArray = [];
						// something was selected
						if (p) {
							t.obj.crsSelected = c.currentTarget.value;
							t.obj.crsNoSpace = c.currentTarget.value.replace(/\s+/g, '');
							// use selected community to query community layer 	
							var q = new Query();
							q.where = "CRS_NAME = '" + t.obj.crsSelected + "'";
							t.crsFL.selectFeatures(q,FeatureLayer.SELECTION_NEW);
							$('#' + t.appDiv.id + 'printAnchorDiv').empty();
							// User clicked download section on home page
							if (t.obj.section == "ospAppBtn"){
								$('#' + t.appDiv.id + 'allParLink').show();
								$('#' + t.appDiv.id + 'larParLink').show();
								$('#' + t.appDiv.id + 'ceosLink').show();
								$('#' + t.appDiv.id + 'sbLink').show();
								$('#' + t.appDiv.id + 'csvDesc').show();
								if (t.obj.crsSelected == "Duck NC1"){
									$('#' + t.appDiv.id + 'allParLink').hide();
									$('#' + t.appDiv.id + 'larParLink').hide();
									$('#' + t.appDiv.id + 'csvDesc').hide();
								}
								if (t.obj.crsSelected == "Manteo NC"){
									$('#' + t.appDiv.id + 'ceosLink').hide();
								}	
								$('#' + t.appDiv.id + 'downloadDiv').slideDown();
								// Set layer defs on layers id's in dlSspLayers array
								$.each(t.obj.dlOspLayers1, lang.hitch(t,function(i,v){
									t.layerDefs[v] = "CRS_NAME = '" + t.obj.crsSelected + "'"
								})); 							 
								t.dynamicLayer.setLayerDefinitions(t.layerDefs);
								t.dynamicLayer1.setLayerDefinitions(t.layerDefs);
								$('#' + t.appDiv.id + 'dlAccord1').show();
								$('#' + t.appDiv.id + 'step2').slideDown();
								t.obj.visibleLayers = t.obj.dlOspLayers;
								t.obj.visibleLayers1 = t.obj.transLayer;
								t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
								t.dynamicLayer1.setVisibleLayers(t.obj.visibleLayers1);
								//$('.legend').removeClass("hideLegend");
							}
							// user clicked on PIN button
							if (t.obj.section == "parcelByIdBtn"){
								// placeholder for Community with no OSP parcels (used to be Duck)
								if (t.obj.crsSelected == "NP Community"){
									$('#' + t.appDiv.id + 'ch-PIN').prop( "disabled", true );
									$('#' + t.appDiv.id + 'ch-PIN').attr("data-placeholder", "No Parcels");
									$('#' + t.appDiv.id + 'hasParcelsDiv').hide();
									$('#' + t.appDiv.id + 'noParcelsDiv').show();
								}else{
									$('#' + t.appDiv.id + 'ch-PIN').prop( "disabled", false );
									$('#' + t.appDiv.id + 'ch-PIN').attr("data-placeholder", "Find Parcel by PIN");
									$('#' + t.appDiv.id + 'hasParcelsDiv').show();
									$('#' + t.appDiv.id + 'noParcelsDiv').hide();
								}			
								$('#' + t.appDiv.id + 'ch-PIN').trigger("chosen:updated");
								//$('#' + t.appDiv.id + 'crsNameParcel').html(t.obj.crsSelected)
								// Set layer defs on layers id's in dlSspLayers array
								$.each(t.obj.pinLayers1, lang.hitch(t,function(i,v){
									t.layerDefs[v] = "CRS_NAME = '" + t.obj.crsSelected + "'"
								})); 							 
								t.dynamicLayer.setLayerDefinitions(t.layerDefs);
								t.dynamicLayer1.setLayerDefinitions(t.layerDefs);
								t.obj.visibleLayers = t.obj.pinLayers;
								t.obj.visibleLayers1 = t.obj.transLayer;
								t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
								t.dynamicLayer1.setVisibleLayers(t.obj.visibleLayers1);
								//$('.legend').removeClass("hideLegend");
								// select all parcels in tax district
								var q = new Query();
								q.returnGeometry = false;
								q.outFields = ["PIN"];
								q.where = "CRS_NAME = '" + t.obj.crsSelected + "'";
								t.pinQt.execute(q, lang.hitch(t,function(evt){
									$('body').addClass('waiting');
									$('#' + t.appDiv.id + 'ch-PIN').empty();
									$('#' + t.appDiv.id + 'ch-PIN').append("<option value=''></option>");
									t.f = evt.features;
									$.each(t.f, lang.hitch(t,function(i,v){
										var pin = v.attributes.PIN;
										$('#' + t.appDiv.id + 'ch-PIN').append("<option value='"+pin+"'>"+pin+"</option>");
									}));
									$('#' + t.appDiv.id + 'ch-PIN').trigger("chosen:updated");
									$('#' + t.appDiv.id + 'printWrapper').slideDown();
									$('body').removeClass('waiting');
									if ( t.stateSet == "yes" ){
										var len = t.pinSelArray.length - 1
										t.pinReady = "no";
										$.each(t.pinSelArray, lang.hitch(t,function(i,v){
											if (i == len){ 
												t.pinReady = "yes" 
											}
											var p = "r"
											$('#' + t.appDiv.id + 'ch-PIN').val(v).trigger('chosen:updated').trigger('change', p)	
										}));
										if (t.pinReady == "no"){
											// Change stateSet to no because find parcel by PIN selected and no parcels chosen from dropdown
											t.stateSet = "no";
										}	
									}	
								}));
							}
							// User clicked on Future OSP button							
							if (t.obj.section == "futureOSPBtn"){
								// Set layer defs on layers id's in dlSspLayers array
								$.each(t.obj.dlOspLayers1, lang.hitch(t,function(i,v){
									t.layerDefs[v] = "CRS_NAME = '" + t.obj.crsSelected + "'"
								})); 							 
								this.navigation.clearFuture(t);
								t.dynamicLayer.setLayerDefinitions(t.layerDefs);
								t.dynamicLayer1.setLayerDefinitions(t.layerDefs);								
								$('#' + t.appDiv.id + 'dlAccord1').hide();
								$('#' + t.appDiv.id + 'step2').slideDown();
								$('#' + t.appDiv.id + 'futureWrapper').slideDown();
								t.obj.visibleLayers = t.obj.dlOspLayers;
								t.obj.visibleLayers1 = t.obj.transLayer;
								t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
								t.dynamicLayer1.setVisibleLayers(t.obj.visibleLayers1);
								$('#' + t.appDiv.id + 'curElOsp').prop('checked', t.obj.curElOsp);
								$('#' + t.appDiv.id + 'ImpactAd').prop('checked', t.obj.ImpactAd);
							}	
						}
						// selection was cleared
						else{
							t.obj.crsSelected = "";
							t.crsFL.clear();
							t.obj.visibleLayers = [];
							t.obj.visibleLayers1 = [];
							t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
							t.dynamicLayer1.setVisibleLayers(t.obj.visibleLayers1);
							//$('.legend').addClass("hideLegend");	
							$('#' + t.appDiv.id + 'step2').slideUp();
							$('#' + t.appDiv.id + 'printWrapper').slideUp();
							$('#' + t.appDiv.id + 'futureWrapper, #' + t.appDiv.id + 'parcelInfo, #' + t.appDiv.id + 'futureGraph').hide();
							this.navigation.clearFuture(t);
							$('#' + t.appDiv.id + 'pinSearch').val('');
							t.obj.searchedPin = '';
							$('#' + t.appDiv.id + 'barf').animate({left : "0%", width: "0%"});
							t.fPinFL.clear();
							//$('#' + t.appDiv.id + 'step2 .gExp').show();
							//$('#' + t.appDiv.id + 'step2 .gCol').hide();
							//$('#' + t.appDiv.id + 'step2 .infoOpen').hide();
						}	
					}));
					$('#' + t.appDiv.id + 'ch-PIN').chosen().change(lang.hitch(t,function(c, p){
						if (p){
							t.pinSelected = c.currentTarget.value;
							t.obj.pinSelArray.push(t.pinSelected)
							if ( t.stateSet == "no" ){
								var q = new Query();
								q.where = "CRS_NAME = '" + t.obj.crsSelected + "' AND PIN = '" + t.pinSelected + "'";
								t.pinFL.selectFeatures(q,FeatureLayer.SELECTION_NEW);
							}
							$('#' + t.appDiv.id + 'ch-PIN').attr("data-placeholder", "Select More Parcels");
							$("#" + t.appDiv.id + "ch-PIN option[value='" + t.pinSelected + "']").remove();
							if ($('#' + t.appDiv.id + 'ch-PIN option').size() == 1){
								$('#' + t.appDiv.id + 'ch-PIN').attr("data-placeholder", "No More Parcels");
								$('#' + t.appDiv.id + 'ch-PIN').prop( "disabled", true );
							}	
							$('#' + t.appDiv.id + 'ch-PIN').trigger("chosen:updated");
							t.clicks.zoomSelectedClass(t)
							$('#' + t.appDiv.id + 'printAnchorDiv').append(
								"<div class='pinPDFdiv zoomSelected'>" +
									t.pinSelected + ": " + 
									"<a class='pinPDFLinks' id='" + t.appDiv.id + "m-" + t.pinSelected + "'>View Map</a>" +
									" | " + 
									"<a class='pinZoomLinks' id='" + t.appDiv.id + "z-" + t.pinSelected + "'>Zoom</a>" +
								"</div>"
							);
							$('.pinPDFLinks').on('click',lang.hitch(t,function(e){
								t.clicks.zoomSelectedClass(t, e.currentTarget.parentElement)
								var pin = e.currentTarget.id.split("-").pop()
								window.open("http://crs-maps.coastalresilience.org/" + t.obj.crsNoSpace + "_" + pin + ".pdf", "_blank");
							}));	
							$('.pinZoomLinks').on('click',lang.hitch(t,function(e){
								t.pinTracker = "yes"
								var pin = e.currentTarget.id.split("-").pop()
								var q = new Query();
								q.where = "CRS_NAME = '" + t.obj.crsSelected + "' AND PIN = '" + pin + "'";
								t.pinFL.selectFeatures(q,FeatureLayer.SELECTION_NEW);	
								t.clicks.zoomSelectedClass(t, e.currentTarget.parentElement)
							}));
							if ( t.stateSet == "yes" ){
								if (t.pinReady == "yes" ) {
									var c = $('#' + t.appDiv.id + 'printAnchorDiv').children()
									$.each(c,lang.hitch(t,function(j,w){
										if ( t.obj.pinHighlighted == j ){
											var d = $(w).children()
											$.each(d,lang.hitch(t,function(i,v){
												if ( $(v).hasClass('pinZoomLinks') ){
													$( '#' + $(v)[0].id ).trigger('click')
												}
											}));
										}												
									}));
									// Change stateSet to no because find parcel by PIN selected and one or more parcels were chosen from dropdown
									t.stateSet = "no";
								}	
							}
						}
					}));
					$('#' + t.appDiv.id + 'ch-FUT').chosen().change(lang.hitch(t,function(c, p){
						if (p){
							t.obj.futObid = c.currentTarget.value;
							var query = new Query();	
							query.where = "OBJECTID = " + t.obj.futObid;
							t.fPinFL.selectFeatures(query, FeatureLayer.SELECTION_NEW);
						}else{
							t.fPinFL.clear();
							$('#' + t.appDiv.id + 'parcelInfo').slideUp();
							t.obj.futObid = -1;
						}	
					}));			
					
					// Temporarily update the chosen menu's max height.
					$('#' + t.appDiv.id + 'ch-FUT').on('chosen:showing_dropdown',lang.hitch(t,function(evt, params){
						$('.chosen-container .chosen-results').css('max-height', '112px');	
					})); 
					$('#' + t.appDiv.id + 'ch-FUT').on('chosen:hiding_dropdown',lang.hitch(t,function(evt, params){
						$('.chosen-container .chosen-results').css('max-height', '240px');
					})); 
				}));
				$('#' + t.appDiv.id + 'searchPin').on('click',lang.hitch(t,function(){
					$('.accrodBg').addClass('waiting');
					var q = new Query();
					q.returnGeometry = true;
					q.outFields = ['PIN', 'OSP_fpts', 'OSP_fac', 'TAX_VALUE', 'OWNER_TYPE', 'LAND_USE', 'DEED_BK_PG', 'DEED_DATE'];
					t.obj.searchedPin = $('#' + t.appDiv.id + 'pinSearch').val();
					q.where = "CRS_NAME = '" + t.obj.crsSelected + "' AND PIN = '" + t.obj.searchedPin + "'";
					t.fPinFL.selectFeatures(q,FeatureLayer.SELECTION_NEW);
				}));	
				$('#' + t.appDiv.id + 'clearSearchPin').on('click',lang.hitch(t,function(){
					$('#' + t.appDiv.id + 'pinSearch').val('');
					t.obj.searchedPin = '';
					$('#' + t.appDiv.id + 'parcelInfo, #' + t.appDiv.id + 'searchPinNone').slideUp();
					t.fPinFL.clear();
				}));
				$('#' + t.appDiv.id + 'pinSearch').keypress(lang.hitch(t,function(e){
					if(e.which == 13){
						$('#' + t.appDiv.id + 'searchPin').trigger('click')
					}
				}));
				$('#' + t.appDiv.id + 'curElOsp').on('click',lang.hitch(t,function(c){
					if (c.currentTarget.checked){
						t.obj.dlOspLayers = [0,9] 
						t.obj.visibleLayers = t.obj.dlOspLayers;
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
						t.obj.curElOsp = true;
					}else{
						t.obj.dlOspLayers = [0] 
						t.obj.visibleLayers = t.obj.dlOspLayers;
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);	
						t.obj.curElOsp = false;
					}	
				}));
				$('#' + t.appDiv.id + 'ImpactAd').on('click',lang.hitch(t,function(c){
					if (c.currentTarget.checked){
						t.obj.transLayer = [10]
						t.obj.visibleLayers1 = t.obj.transLayer;
						t.dynamicLayer1.setVisibleLayers(t.obj.visibleLayers1);
						t.obj.ImpactAd = true;
					}else{
						t.obj.transLayer = []
						t.obj.visibleLayers1 = t.obj.transLayer;
						t.dynamicLayer1.setVisibleLayers(t.obj.visibleLayers1);
						t.obj.ImpactAd = false;
					}	
				}));
				// Show Parcels by Query Listeners
				$('#' + t.appDiv.id + 'acresGrThan').on('click',lang.hitch(t,function(){
					$('#' + t.appDiv.id + 'acresLsThan').removeClass('navBtnSel');
					$('#' + t.appDiv.id + 'acresGrThan').addClass('navBtnSel');
					t.obj.acreGrLs = ">";
				}));
				$('#' + t.appDiv.id + 'acresLsThan').on('click',lang.hitch(t,function(){
					$('#' + t.appDiv.id + 'acresGrThan').removeClass('navBtnSel');
					$('#' + t.appDiv.id + 'acresLsThan').addClass('navBtnSel');
					t.obj.acreGrLs = "<";
				}));
				$('#' + t.appDiv.id + 'taxGrThan').on('click',lang.hitch(t,function(){
					$('#' + t.appDiv.id + 'taxLsThan').removeClass('navBtnSel');
					$('#' + t.appDiv.id + 'taxGrThan').addClass('navBtnSel');
					t.obj.taxGrLs = ">";
				}));
				$('#' + t.appDiv.id + 'taxLsThan').on('click',lang.hitch(t,function(){
					$('#' + t.appDiv.id + 'taxGrThan').removeClass('navBtnSel');
					$('#' + t.appDiv.id + 'taxLsThan').addClass('navBtnSel');
					t.obj.taxGrLs = "<";
				}));
				$('#' + t.appDiv.id + 'futQuAnd').on('click',lang.hitch(t,function(){
					$('#' + t.appDiv.id + 'futQuOr').removeClass('navBtnSel');
					$('#' + t.appDiv.id + 'futQuAnd').addClass('navBtnSel');
					t.obj.futQuAndOr = "AND";
				}));
				$('#' + t.appDiv.id + 'futQuOr').on('click',lang.hitch(t,function(){
					$('#' + t.appDiv.id + 'futQuAnd').removeClass('navBtnSel');
					$('#' + t.appDiv.id + 'futQuOr').addClass('navBtnSel');
					t.obj.futQuAndOr = "OR";
				}));
				$('#' + t.appDiv.id + 'futAcreSort').on('click',lang.hitch(t,function(){
					$('#' + t.appDiv.id + 'futTaxSort').removeClass('navBtnSel');
					$('#' + t.appDiv.id + 'futAcreSort').addClass('navBtnSel');
					t.obj.futSortOn = "acres";
					t.esriapi.futureDropdown(t);
				}));
				$('#' + t.appDiv.id + 'futTaxSort').on('click',lang.hitch(t,function(){
					$('#' + t.appDiv.id + 'futAcreSort').removeClass('navBtnSel');
					$('#' + t.appDiv.id + 'futTaxSort').addClass('navBtnSel');
					t.obj.futSortOn = "taxval";
					t.esriapi.futureDropdown(t);
				}));
				$('#' + t.appDiv.id + 'futAcen').on('click',lang.hitch(t,function(){
					$('#' + t.appDiv.id + 'futDecen').removeClass('navBtnSel');
					$('#' + t.appDiv.id + 'futAcen').addClass('navBtnSel');
					t.obj.futSortOrder = "acen";
					t.esriapi.futureDropdown(t);
				}));
				$('#' + t.appDiv.id + 'futDecen').on('click',lang.hitch(t,function(){
					$('#' + t.appDiv.id + 'futAcen').removeClass('navBtnSel');
					$('#' + t.appDiv.id + 'futDecen').addClass('navBtnSel');
					t.obj.futSortOrder = "decen";
					t.esriapi.futureDropdown(t);
				}));				
				$('#' + t.appDiv.id + 'queryParcels').on('click',lang.hitch(t,function(){	
					$('.accrodBg').addClass('waiting');
					$('#' + t.appDiv.id + 'parcelInfo').slideUp();
					t.fManyPinFL.clear();
					t.fPinFL.clear();
					$('#' + t.appDiv.id + 'fParSelWrapper').slideUp();
					$('#' + t.appDiv.id + 'queryParMany').slideUp();
					$('#' + t.appDiv.id + 'queryParNone').slideUp();			
					t.obj.futAcreVal = $('#' + t.appDiv.id + 'futAcreVal').val();
					t.obj.futTaxVal = $('#' + t.appDiv.id + 'futTaxVal').val();
					var q = new Query();
					q.returnGeometry = true;
					q.outFields = ['PIN', 'OSP_fpts', 'OSP_fac', 'TAX_VALUE', 'OWNER_TYPE', 'LAND_USE', 'DEED_BK_PG', 'DEED_DATE'];
					q.where = "CRS_NAME = '" + t.obj.crsSelected + "' AND ( OSP_fac " + t.obj.acreGrLs + " " + t.obj.futAcreVal + " " + 
						t.obj.futQuAndOr + " TAX_VALUE " + t.obj.taxGrLs + " " + t.obj.futTaxVal + " )";
					t.fManyPinFL.selectFeatures(q,FeatureLayer.SELECTION_NEW);
					t.obj.parQueryClicked = "yes";
				}));	
				$('#' + t.appDiv.id + 'toggleFutSort').on('click',lang.hitch(t,function(){
					if ( $('#' + t.appDiv.id + 'toggleFutSort').html() == 'Sort' ){ 
						t.obj.sortVis = "yes";
						$('#' + t.appDiv.id + 'futSortWrapper').slideDown();
						$('#' + t.appDiv.id + 'toggleFutSort').html('Hide Sort');
					}else { 
						t.obj.sortVis = "no";					
						$('#' + t.appDiv.id + 'futSortWrapper').slideUp();
						$('#' + t.appDiv.id + 'toggleFutSort').html('Sort');
					}					
				}));
			},
			mapPreviewDownload: function(t){
				$('#' + t.appDiv.id + 'allParcelPreview').on('click',lang.hitch(t,function(){
					window.open("http://crs-maps.coastalresilience.org/" + t.obj.crsNoSpace + "_AllParcels.pdf", "_blank");
				}));
				$('#' + t.appDiv.id + 'largeParcelPreview').on('click', lang.hitch(t,function(){
					window.open("http://crs-maps.coastalresilience.org/" + t.obj.crsNoSpace + "_Parcels_Large.pdf", "_blank");					
				}));
				$('#' + t.appDiv.id + 'setbackParcelPreview').on('click', lang.hitch(t,function(){
					window.open("http://crs-maps.coastalresilience.org/" + t.obj.crsNoSpace + "_Setbacks.pdf", "_blank");					
				}));
				$('#' + t.appDiv.id + 'ceosParcelPreview').on('click', lang.hitch(t,function(){
					window.open("http://crs-maps.coastalresilience.org/" + t.obj.crsNoSpace + "_CEOS.pdf", "_blank");					
				}));
				$('#' + t.appDiv.id + 'futurePDF').on('click', lang.hitch(t,function(){
					window.open("http://crs-maps.coastalresilience.org/" + t.obj.crsNoSpace + "_Future_" + t.pin + ".pdf", "_blank");					
				}));
				// Data download click
				$('#' + t.appDiv.id + 'dlBtn').on('click', lang.hitch(t,function(){
					window.open("http://crs-maps.coastalresilience.org/" + t.obj.crsNoSpace + "_Maps.zip", "_parent");
				}));
			},
			toggleInfoSum:function(t){
				$('.expCol').on('click', lang.hitch(t,function(c){
					$(c.currentTarget).children().toggle();
					$(c.currentTarget).parent().find('.infoOpen').slideToggle(250, lang.hitch(function(){
						// track which elements are expanded to use in save and share
						t.obj.ospElementsVis = [];
						$('#' + t.appDiv.id + 'elementsWrapper .firstIndent').each(lang.hitch(t,function(i, v){
							var io = $(v).find('.infoOpen');
							if (io[0].style.display == 'block'){
								t.obj.ospElementsVis.push(i);
							}	
						}));
					}));
				}));
			},
			zoomSelectedClass: function(t, e){
				var c = $('#' + t.appDiv.id + 'printAnchorDiv').children()
				$.each(c,lang.hitch(t,function(i,v){
					$(v).removeClass('zoomSelected');
				}));
				if (e){ 
					$(e).addClass('zoomSelected') 
				}	
			}			
        });
    }
);