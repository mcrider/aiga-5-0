$(document).ready( function(){
	$('.criteriatitle').on('mouseover', function (){
		$('a.criteriapdf').fadeIn('fast').css('display','block');
	}).on('mouseout',function(){
		$('a.criteriapdf').css('display','none');
	});
});