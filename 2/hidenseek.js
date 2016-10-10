const Pokemon = require('./pokemon');
const PokemonList = require('./pokemonlist');
const random = require('./random');
const fs = require('fs');
const path = require('path');

const folders = [1,2,3,4,5,6,7,8,9,10];
const maxToHide = 3;


function getUnicNumbers(count, fromCount) {
	let arr = [],
		result = [];
	
	for(let i=0; i<fromCount; i++)
		arr[arr.length] = i;
	
	for(let i=0; i<count; i++)
		result[result.length] = arr.splice(random(0, arr.length-1), 1)[0];
	
	return result;
}


fs.mkdirRecurs = function(dirPath, callback) {
	fs.mkdir(dirPath, function(error) {
		
		if (error && error.code === 'ENOENT') {	  
			fs.mkdirRecurs(path.dirname(dirPath), function(error) {
				if(!error || error.code === 'EEXIST')
					fs.mkdirRecurs(dirPath, callback);
				else
					console.log(`Ошибка создания [${dirPath}]`);
			});			
		}
		else if (!error || error.code === 'EEXIST') {	  
			callback && callback(error);
		}
		else
			console.log(`Ошибка создания [${dirPath}]`);
					
	});
};

fs.mkdirRecursAsync = function (dirPath, toHideItems) {
    return new Promise(function (resolve, reject) {
        fs.mkdirRecurs(dirPath, function(err, data){
			
			if(toHideItems) {
				var info = '';
				
				toHideItems.forEach((pokemon, i) => {
					info += (i ? '\r\n' : '') + `${pokemon.name}|${pokemon.level}`;					
				});
				
				fs.writeFile(path.join(dirPath, 'pokemon.txt'), info, {flag: 'w'}, err => resolve(toHideItems) );
			}
			else
				fs.unlink(path.join(dirPath, 'pokemon.txt'), err => resolve(toHideItems) );
        });
    });
};

function folderFormat(num) {
	return ("0" + num).slice(-2);
}

const hide = (dirPath = '', pokemonList = null, callback) => {
	if(!pokemonList || !(pokemonList instanceof PokemonList)) return;
	
	let toHideCount = Math.min(maxToHide, random(1, pokemonList.length)),
		toHideItemsByFolders = {};
		
	getUnicNumbers(toHideCount, pokemonList.length).forEach (
			item => {				
				let folder = 'f' + folderFormat(random(1, 10));
				
				if(!toHideItemsByFolders[folder])
					toHideItemsByFolders[folder] = [];
				
				toHideItemsByFolders[folder][toHideItemsByFolders[folder].length] = pokemonList[item]; 
			}
		);
	
	let result = new PokemonList();
	let foldersInfo = folders.map(i => {
		var folderName = folderFormat(i);
		return fs.mkdirRecursAsync(path.join(dirPath, folderName), toHideItemsByFolders['f' + folderName] || null);
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


fs.readFileAsync = function (filePath) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filePath, {encoding: 'utf8', flag: 'r'}, function(err, data){
            resolve(!err ? data : null);				
        });
    });
};

function getPokemonsInfoFromFile(dirPath, i) {
	let filePath = path.join(dirPath, folderFormat(i), 'pokemon.txt');
	
    return fs.readFileAsync(filePath);
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