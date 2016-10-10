const Pokemon = require('./pokemon');
const PokemonList = require('./pokemonlist');
const hs = require('./hidenseek');
const path = require('path');

var pokemons = [
		{name: 'Вася', level: 2},
		{name: 'Коля', level: 1},
		{name: 'Миша', level: 3},
		{name: 'Ира',  level: 12},
		{name: 'Катя', level: 11},
		{name: 'Лена', level: 13}
	];

function setRightFolder(dirPath, isFolder) {
	process.chdir(__dirname);
	let sep = '/'; //sep
		
	return '.' + (sep + path.normalize(dirPath).replace(/(^\.+[/\\])|([/\\]\.\.+[/\\])/g, sep) + (isFolder ? sep : '')).replace(/[/\\]+/g, sep);
}
	

if(process.argv.length < 3 || (process.argv[2].toLowerCase() != 'hide' && process.argv[2].toLowerCase() != 'seek')) {
	console.log('Прячет / ищет покемонов в указанной папке.');
	console.log('');
	console.log('NODE INDEX [<команда>] [<путь к папке>] [<путь к списку покемонов>]');
	console.log('');
	console.log('<команда>: hide - спрятать или seek - найти');
	console.log('<путь к папке> - относительный путь к папке, где прятать/искать покемонов. По-умолчанию "/field/".');
	console.log('<путь к списку покемонов> - относительный путь к json файлу с переченем покемонов. По-умолчанию - предварительно подготовленный список.');
}
else if(process.argv[2].toLowerCase() == 'hide') {
	
	if(process.argv.length == 5) {
		var jsonFile = setRightFolder(process.argv[4], false);		
		pokemons = require(jsonFile);
	}
	
	var list = new PokemonList(pokemons);
	
	hs.hide(setRightFolder(process.argv.length < 4 ? '/field/' : process.argv[3], true), list, function(result) {
		result.show();
	});
}
else if(process.argv[2].toLowerCase() == 'seek') {
	hs.seek(setRightFolder(process.argv.length < 4 ? '/field/' : process.argv[3], true), function(result) {
		result.show();
	});
}