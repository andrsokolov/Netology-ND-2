const Pokemon = require('./pokemon');
const PokemonList = require('./pokemonlist');
const random = require('./random');
const fs = require('fs');
const path = require('path');

const folders = [1,2,3,4,5,6,7,8,9,10];
const maxToHide = 3;


function folderFormat(num) {
	return ("0" + num).slice(-2);
}

// очередь на создания пути папок /a/b/c/d/:  /a/, /a/b/, /a/b/c/, /a/b/c/d/
function mkdirWithParentsQueue(dirPath) {
	let subPaths = [],
		subPath = dirPath;
			
	while(subPath !== '.') {
		subPaths.unshift(subPath);
		
		subPath = path.dirname(subPath);
	}
	
	let iter = Promise.resolve();
	
	subPaths.forEach(function(path) {
		iter = iter.then(() =>
			new Promise(function (resolve, reject) {
				fs.mkdir(path, function(error) {
					if (!error || error.code === 'EEXIST')
						resolve(path);
					else
						reject(error);
				});
			})
		);				
	});
	
	return iter;
}


function hidePokemonsAsync (dirPath, toHideItems) {
	
	return mkdirWithParentsQueue(dirPath).then(() => 		
		new Promise(function (resolve, reject) {
			
			if (toHideItems) {
				var info = '';
				
				toHideItems.forEach((pokemon, i) => {
					info += (i ? '\r\n' : '') + `${pokemon.name}|${pokemon.level}`;					
				});
				
				fs.writeFile(path.join(dirPath, 'pokemon.txt'), info, {flag: 'w'}, err => resolve(toHideItems) );
			}
			else
				fs.unlink(path.join(dirPath, 'pokemon.txt'), err => resolve(null) );
			
		})
	);
	
}


const hide = (dirPath = '', pokemonList = null, callback) => {
	if(!pokemonList || !(pokemonList instanceof PokemonList)) return;
	
	let toHideCount = Math.min(maxToHide, random.randomNumber(1, pokemonList.length)),
		toHideItemsByFolders = {};
		
	//генерируем массив "куда прятать"
	random.getUnicNumbers(toHideCount, pokemonList.length).forEach (
			item => {				
				let folder = 'f' + folderFormat(random.randomNumber(1, 10));
				
				if(!toHideItemsByFolders[folder])
					toHideItemsByFolders[folder] = [];
				
				toHideItemsByFolders[folder][toHideItemsByFolders[folder].length] = pokemonList[item]; 
			}
		);
	
	let result = new PokemonList();
	
	//общения на создание каждой папки из списка и спрятать в ней, если требуется, покемонов
	let foldersInfo = folders.map(i => {
		var folderName = folderFormat(i);
		return hidePokemonsAsync(path.join(dirPath, folderName), toHideItemsByFolders['f' + folderName] || null);
	});
	
	Promise.all(foldersInfo).then(function (data) {
		
		data.forEach (
			pokemonArr => {				
				if(!pokemonArr) return;
				
				result = result.concat(pokemonArr);				
			}
		)
				
		callback && callback(result);
		
	});
	
}


function getPokemonsInfoFromFile(dirPath, i) {
	let filePath = path.join(dirPath, folderFormat(i), 'pokemon.txt');	
	
	return new Promise(function (resolve, reject) {
        fs.readFile(filePath, {encoding: 'utf8', flag: 'r'}, function(err, data){
            resolve(!err ? data : null);				
        });
    });
}


const seek = (dirPath = '', callback) => {
			
	let result = new PokemonList();
	let pokemonsInfo = folders.map(i => getPokemonsInfoFromFile(dirPath, i));
		
	Promise.all(pokemonsInfo).then(function (data) {
		data.forEach (
			pokemonStr => {
				
				if(!pokemonStr) return;
				
				pokemonStr.split('\r\n').forEach(item => {
					let p = item.split('|');
					
					if(p.length = 2)
						result.add(p[0], parseInt(p[1]));
				});
				
			}
		)
		
		callback && callback(result);
	});	
}


module.exports = {
	hide,
	seek
}