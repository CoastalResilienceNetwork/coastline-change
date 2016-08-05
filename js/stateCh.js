define([
	"dojo/_base/declare", "dojo/_base/lang", "dojo/on", "jquery" 
],
function ( declare, lang, on, $ ) {
        "use strict";

        return declare(null, {
			checkState: function(t){
				$(document).ready(lang.hitch(t,function(){
				// was setState called at startup?
				if ( t.stateSet == "yes" ){
					// what section was the user in?
					if ( t.obj.section != 'homeBtn' ){
						$('#' + t.appDiv.id + t.obj.section).trigger('click');
						// was a community selected?
						if ( t.obj.crsSelected != "" ){
							require(["jquery", "plugins/community-rating-system/js/chosen.jquery"],lang.hitch(t,function($) {
								var p = "r"
								$('#' + t.appDiv.id + 'ch-CRS').val(t.obj.crsSelected).trigger('chosen:updated').trigger('change', p)	
							}));
							// Download data for OSP section 
							if (t.obj.section == "ospAppBtn"){
								// open accordians to match user selections
								$('#' + t.appDiv.id + 'dlAccord').accordion( "option", "active", t.obj.activeAcIndex )	
								$('#' + t.appDiv.id + 'dlAccord1').accordion( "option", "active", t.obj.activeAc1Index )	
								// Open OPS element summaries
								$.each(t.obj.ospElementsVis, lang.hitch(t,function(i, v){
									$('#' + t.appDiv.id + 'elementsWrapper .firstIndent').each(lang.hitch(t,function(j, w){
										if (v == j){
											$(w).find('.infoOpen').show();
											$(w).find('.expCol').children().toggle();							
										}			
									}));
								}));
							}	
							// Find and print parcel by PIN and future sections handled in code because of order of operations.
						}else{ 
							// Change stateSet to no because download data for OSP selected and a community was NOT selected.
							t.stateSet = "no";
						}	
					}		
				}
				}));	
			}	
        });
    }
);