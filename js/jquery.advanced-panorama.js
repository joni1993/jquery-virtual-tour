/* =========================================================
// jquery.panorama.js
// Author: OpenStudio (Arnault PACHOT)
// Mail: apachot@openstudio.fr
// Web: http://www.openstudio.fr
// Copyright (c) 2008 Arnault Pachot
// licence : GPL
========================================================= */

(function($) {
	$.fn.panorama = function(options) {		
		this.each(function(){ 
			var settings = {
				/* Navigation Configuration */
				slide_to_left_button_title: '',
				slide_to_left_button_text: '<<',
				
				back_button_title: 'Zurück',
				back_button_text: 'V',
				
				slide_to_right_button_title: '',
				slide_to_right_button_text: '>>',
				
				
				viewport_width: 600,
				speed: 10000,
				transition_time: 1000,
				direction: 'left',
				control_display: 'auto',
				start_position: 1000,
				mode_360: true
			};
			if(options) $.extend(settings, options);
			
			var activePanorama, lastPanorama;
            var maxElemWidth = 0;
			var maxElemHeight = 0;
			var currentPanoramaElement = 0;
			var panoramaCount = 0;
			var panoramaViewport, panoramaContainer;
			var bMouseMove = false;
			var mouseMoveStart = 0;
			var mouseMoveMarginStart = 0;
			var areaCount = 0;
			
			
			$(this).children('div.panorama-view').each(
				function() {
					var image = $(this).find('img');
					var panoImgWidth = parseInt(image.attr('width'));
					panoramaCount++;
					
					image.attr('unselectable','on')
					.css('position', 'relative')
					.css('-moz-user-select','none')
					.css('-webkit-user-select','none')
					.css('margin', '0')
					.css('padding', '0')
					.css('border', 'none')
					.addClass('panorama-image-'+panoramaCount);
					
					$(this).addClass('panorama-'+$(this).attr('name'));
				
					if (maxElemWidth < parseInt(image.attr('width'))) { 
						maxElemWidth = parseInt(image.attr('width')); 
					}
					if (maxElemHeight < parseInt(image.attr('height'))) { 
						maxElemHeight = parseInt(image.attr('height')); 
					}
						
				if (panoramaCount > 1) { 
				    $(this).css('display','none'); 
				} else {
				    $(this).addClass('active');
					activePanorama	= $(this);
				}
				
				
				if (settings.mode_360) 
						image.clone().addClass('clone').insertAfter(image);
						
				//Map area for img
				var map = $(this).find('map');
				map.find('area').each(
					function() {
						switch ($(this).attr("shape").toLowerCase()) {
							case 'rect' : 	
									var areacoord = $(this).attr("coords");
									var areaalt = $(this).attr("alt");
									var areaId = $(this).parent().attr("name")
									if (areaalt != '') {
										areaalt = areaalt.replace("'", "&#146;");
										areaalt = areaalt.replace('"', '&quot;');
										
									}
									var areaclass = $(this).attr("class");
									if (areaclass != '')
										areaclass = " "+areaclass;
									var areahref = $(this).attr("href");
									var areacoordArray = coords_fill(areacoord);
									
									$(this).parent().parent().append("<a class='panorama-area area-"+areaCount+" area-"+areaId+areaclass+"' style='position: absolute; left: "+areacoordArray[0]+"px; top: "+areacoordArray[1]+"px; width: "+(areacoordArray[2]-areacoordArray[0])+"px; height: "+(areacoordArray[3]-areacoordArray[1])+"px;' onmouseover='javascript:area_hover("+areaCount+")' onmouseout='javascript:area_out("+areaCount+")' href='"+areahref+"' title='"+areaalt+"'>&nbsp;</a>"); 
									$(this).parent().parent().append("<a class='panorama-area area-"+areaCount+" area-"+areaId+areaclass+"' style='position: absolute; left: "+(panoImgWidth+parseInt(areacoordArray[0]))+"px; top: "+areacoordArray[1]+"px; width: "+(areacoordArray[2]-areacoordArray[0])+"px; height: "+(areacoordArray[3]-areacoordArray[1])+"px;' onmouseover='javascript:area_hover("+areaCount+")' onmouseout='javascript:area_out("+areaCount+")' href='"+areahref+"' title='"+areaalt+"'>&nbsp;</a>");
									areaCount++;
									break;
							case 'circle' :  break;
							case 'poly' :  break;
						}
					}).remove();
					
					map.remove();
			});
			
			panoramaContainer = $(this);
			panoramaContainer.css('height', maxElemHeight+'px').css('overflow', 'hidden').wrap("<div class='panorama-viewport'></div>").parent().css('width',settings.viewport_width+'px')
				.append("<div class='panorama-control'><a href='#' title='"+settings.slide_to_left_button_title+"' class='panorama-control-left'>"+settings.slide_to_left_button_text+"</a> <a href='#' title='"+settings.back_button_title+"' class='panorama-control-back'>"+settings.back_button_text+"</a> <a href='#' title='"+settings.slide_to_right_button_title+"' class='panorama-control-right'>"+settings.slide_to_right_button_text+"</a> </div>");
			panoramaContainer.css('margin-left', '-'+options.start_position+'px');
			
			panoramaViewport = panoramaContainer.parent();

			panoramaViewport.mousedown(function(e){
			      if (!bMouseMove) {
				bMouseMove = true;
				mouseMoveStart = e.clientX;
			      }
			      return false;
			}).mouseup(function(){
			      bMouseMove = false;
			      mouseMoveStart = 0;
			      return false;
			}).mousemove(function(e){
			      if (bMouseMove){
				  var delta = parseInt((mouseMoveStart - e.clientX)/30);
				  if ((delta>10) || (delta<10)) {
				      var newMarginLeft = parseInt(panoramaContainer.css('marginLeft')) + (delta);
				      if (settings.mode_360) {
					    if (newMarginLeft > 0) {newMarginLeft = -maxElemWidth;}
					    if (newMarginLeft < -maxElemWidth) {newMarginLeft = 0;}
				      } else {
					    if (newMarginLeft > 0) {newMarginLeft = 0;}
					    if (newMarginLeft < -maxElemWidth) {newMarginLeft = -maxElemWidth;}
				      }
				      panoramaContainer.css('marginLeft', newMarginLeft+'px');
				  }
				
			      }
			}).bind('contextmenu',function(){return false;});
			
			panoramaViewport.css('height', maxElemHeight+'px').css('overflow', 'hidden').find('a.panorama-control-left').bind('mousedown', function() {
				$(panoramaContainer).stop();
				settings.direction = 'right';
				panorama_animate(panoramaContainer, maxElemWidth, settings);
				return false;
			});
			panoramaViewport.bind('click', function() {
				$(panoramaContainer).stop();
			});
			panoramaViewport.find('a.panorama-control-right').bind('mousedown', function() {
				$(panoramaContainer).stop();
				settings.direction = 'left';
				panorama_animate(panoramaContainer, maxElemWidth, settings);
				return false;
			});
			panoramaViewport.find('a.panorama-control-back').bind('click', function() {
				if ($.fn.panorama.lastPanorama) {
					var lastPanoramaName = $.fn.panorama.lastPanorama.attr('name');
					setActivePanoramaView(lastPanoramaName, options.transition_time);
				} else {
				    return false;
				}
			});
			
			if (settings.control_display == 'yes') {
				panoramaViewport.find('.panorama-control').show();
			} else if (settings.control_display == 'auto') {
				panoramaViewport.bind('mouseover', function(){
					$(this).find('.panorama-control').show();
					return false;
				}).bind('mouseout', function(){
					$(this).find('.panorama-control').hide();
					return false;
				});
				
			}

			if (settings.auto_start) 
				panorama_animate(panoramaContainer, maxElemWidth, settings);
				
			var imgTitle = activePanorama.find('img').attr('title');
			
			if (!imgTitle)
				imgTitle = activePanorama.find('img').attr('alt');
			
			if (imgTitle) {
				panoramaViewport.append("<p class='flipv panorama-title'>"+imgTitle+"</p>");
			}
			
		});
		
		
		/* Slide Effect for Panorama pictures */
		function panorama_animate(element, maxElemWidth, settings) {
			currentPosition = 0-parseInt($(element).css('margin-left'));
			
			if (settings.direction == 'right') {
				
				$(element).animate({marginLeft: 0}, ((settings.speed / maxElemWidth) * (currentPosition)) , 'linear', function (){ 
					if (settings.mode_360) {
						$(element).css('marginLeft', '-'+(parseInt(parseInt(maxElemWidth))+'px'));
						panorama_animate(element, maxElemWidth, settings);
					}
				});
			} else {
				
				var rightlimit;
				if (settings.mode_360) 
					rightlimit = maxElemWidth;
				else
					rightlimit = maxElemWidth-settings.viewport_width;
					
				$(element).animate({marginLeft: -rightlimit}, ((settings.speed / rightlimit) * (rightlimit - currentPosition)), 'linear', function (){ 
					if (settings.mode_360) {
						$(element).css('margin-left', 0); 
						panorama_animate(element, maxElemWidth, settings);
					}
				});
			}	
		}
	
		/* Load new panorama */
		function setActivePanoramaView(panoramaElement, time) {
			$('.panorama-view.last').removeClass('last');
	
			$.fn.panorama.lastPanorama = $('.panorama-view.active')
			$('.panorama-view.active').fadeOut(time).removeClass('active').addClass('last');
	
			$.fn.panorama.activePanorama = $('.panorama-'+panoramaElement);
			$('.panorama-'+panoramaElement).fadeIn(time).addClass('active')
		}
		
		/* Area Click for loading new panorama picture */
		$('.panorama-area').click(function(event) {
			if (!isImage($(this).attr('href'))) {
				event.preventDefault();
				var newPanorama = $(this).attr('href');
				setActivePanoramaView(newPanorama, options.transition_time);
			}
		});
		
		
	};


})(jQuery);


function coords_fill(mycoords) {
	var position1=0;
	var position2=0;

	var tabresult = new Array();
	while ((position2 = mycoords.indexOf(',', position1)) >= 0) {
		tabresult.push(mycoords.substring(position1, position2));
		position1 = position2+1;
		position2 = position1+1;
	}
	tabresult.push(mycoords.substring(position1));
		
	return tabresult;
}
function area_hover(areaId) {
	$('.area-'+areaId).addClass('panorama-area-hover').addClass('area-'+areaId+'-hover');
}
function area_out(areaId) {
	$('.area-'+areaId).removeClass('panorama-area-hover').removeClass('area-'+areaId+'-hover');
}

function isImage(str) {
	return str.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg)((\?|#).*)?$)/i);
}
