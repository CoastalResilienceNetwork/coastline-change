define([
	"dojo/_base/declare", "dojo/dom-style", "dojo/_base/lang", "dojo/on", "jquery", './jquery-ui-1.11.2/jquery-ui'
],
function ( declare, domStyle, lang, on, $, ui ) {
        "use strict";

        return declare(null, {
			navListeners: function(t){
				// Download data for all eligible OSP areas for my CRS application click
				$('#' + t.appDiv.id + 'ospAppBtn').on('click',lang.hitch(t,function(){
					t.obj.section = "ospAppBtn";
					$('#' + t.appDiv.id + 'topHeader').html($('#' + t.appDiv.id + 'ospAppBtn').html());
					$('#' + t.appDiv.id + 'home').slideUp();
					$('#' + t.appDiv.id + 'topWrapper, #' + t.appDiv.id + 'dlOspWrapper').slideDown();
					$(t.con).animate({ height: '578px', width: '425px' }, 250,
						lang.hitch(t,function(){
							t.resize1();
						})
					);
				}));
				// Find and Print a Parcel by PIN click
				$('#' + t.appDiv.id + 'parcelByIdBtn').on('click',lang.hitch(t,function(){
					t.obj.section = "parcelByIdBtn";
					$('#' + t.appDiv.id + 'topHeader').html($('#' + t.appDiv.id + 'parcelByIdBtn').html());
					$('#' + t.appDiv.id + 'home').slideUp();
					$('#' + t.appDiv.id + 'topWrapper, #' + t.appDiv.id + 'dlOspWrapper').slideDown();
					$(t.con).animate({ height: '540px', width: '425px' }, 250,
						lang.hitch(t,function(){
							t.resize1();
						})
					);
				}));	
				// Future OSP Button click
				$('#' + t.appDiv.id + 'futureOSPBtn').on('click',lang.hitch(t,function(){
					t.obj.section = "futureOSPBtn";
					$('#' + t.appDiv.id + 'topHeader').html($('#' + t.appDiv.id + 'futureOSPBtn').html());
					$('#' + t.appDiv.id + 'home').slideUp();
					$('#' + t.appDiv.id + 'topWrapper, #' + t.appDiv.id + 'dlOspWrapper').slideDown();
					$(t.con).animate({ height: '660px', width: '420px' }, 250,
						lang.hitch(t,function(){
							t.resize1();
						})
					);
					if (t.stateSet == "yes"){
						$('#' + t.appDiv.id + t.obj.subSection).trigger('click');
					}	
				}));	
				// Home button click
				$('#' + t.appDiv.id + 'homeBtn').on('click',lang.hitch(t,function(){
					t.obj.section = "homeBtn";
					t.map.setExtent(t.dynamicLayer.initialExtent, true);
					t.obj.dlOspLayers = [0,9];
					t.obj.transLayer = [10];
					t.obj.visibleLayers = [];
					t.obj.visibleLayers1 = [];
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					t.dynamicLayer1.setVisibleLayers(t.obj.visibleLayers1);			
					$('#' + t.appDiv.id + 'ch-CRS').val('').trigger('chosen:updated');
					$('#' + t.appDiv.id + 'ch-CRS').trigger('change');
					$('#'  + t.appDiv.id + 'topWrapper, #' + t.appDiv.id + 'dlOspWrapper, #' + t.appDiv.id + 'step2, #' + t.appDiv.id + 'printWrapper').slideUp();
					t.fPinFL.clear();
					this.navigation.clearFuture(t);
					$('#' + t.appDiv.id + 'home').slideDown();
					$(t.con).animate({ height: '216px', width: '425px' }, 250,
						lang.hitch(t,function(){
							domStyle.set(t.appDiv.domNode, "height", "100%"); 
						})
					);
				}));
				$('#' + t.appDiv.id + 'zoomParNavBtn').on('click',lang.hitch(t,function(){
					t.obj.subSection = 'zoomParNavBtn';
					$('#' + t.appDiv.id + 'queryParNavBtn').removeClass('navBtnSel');
					$('#' + t.appDiv.id + 'zoomParNavBtn').addClass('navBtnSel');
					t.fPinFL.clear();
					t.fManyPinFL.clear();
					$('#' + t.appDiv.id + 'parcelInfo, #' + t.appDiv.id + 'fParSelWrapper').slideUp();
					$('#' + t.appDiv.id + 'qpWrapper').slideUp( 250,lang.hitch(t,function() {
						$('#' + t.appDiv.id + 'ztpWrapper').slideDown(250);
					}));
					$('#' + t.appDiv.id + 'barf').animate({left : "0%", width: "0%"});
					$('#' + t.appDiv.id + 'futureGraph').css('display', 'none');	
				}));	
				$('#' + t.appDiv.id + 'queryParNavBtn').on('click',lang.hitch(t,function(){
					t.obj.subSection = 'queryParNavBtn';
					$('#' + t.appDiv.id + 'zoomParNavBtn').removeClass('navBtnSel');
					$('#' + t.appDiv.id + 'queryParNavBtn').addClass('navBtnSel');
					t.fPinFL.clear();
					$('#' + t.appDiv.id + 'ztpWrapper, #' + t.appDiv.id + 'parcelInfo, #' + t.appDiv.id + 'searchPinNone').slideUp( 250,lang.hitch(t,function() {
						$('#' + t.appDiv.id + 'qpWrapper').slideDown(250);
						if ($('#' + t.appDiv.id + 'toggleQuery').html() == 'Show Query'){
							$('#' + t.appDiv.id + 'toggleQueryWrap').slideDown();
							$('#' + t.appDiv.id + 'toggleQuery').html('Hide Query');
							t.obj.queryVis = "yes";
						}
					}));
					$('#' + t.appDiv.id + 'barf').animate({left : "0%", width: "0%"});
					$('#' + t.appDiv.id + 'futureGraph').css('display', 'none');
				}));
			},
			clearFuture: function(t){
				t.fPinFL.clear();
				t.fManyPinFL.clear();
				$('#' + t.appDiv.id + 'ch-FUT').val('').trigger('chosen:updated');
				$('#' + t.appDiv.id + 'ch-FUT').trigger('change');
				$('#' + t.appDiv.id + 'futureGraph').css('display', 'none');
				$('#' + t.appDiv.id + 'pinSearch').val('');
				t.obj.searchedPin = '';
				$('#' + t.appDiv.id + 'parcelInfo, #' + t.appDiv.id + 'fParSelWrapper, #' + t.appDiv.id + 'searchPinNone').slideUp();
				if (t.obj.subSection == 'zoomParNavBtn'){
					$('#' + t.appDiv.id + 'qpWrapper').slideUp(); 
					$('#' + t.appDiv.id + 'zptWrapper').slideDown(); 	
				}
				if (t.obj.subSection == 'queryParNavBtn'){
					$('#' + t.appDiv.id + 'zptWrapper').slideUp(); 
					$('#' + t.appDiv.id + 'qpWrapper').slideDown(); 
					$('#' + t.appDiv.id + 'toggleQueryWrap').slideDown();
				}
				$('#' + t.appDiv.id + 'futureWrapper').slideUp();				
			}	
        });
    }
);