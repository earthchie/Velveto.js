document.getElementById('velveto').addEventListener('loadFail',function(){
	console.log('Load fail');
	alert('Error 404 - Page not found!');
	Velveto.goTo('#!/home/');
});