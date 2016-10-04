class Pokemon {
	constructor(name, level) {
		this.name = name;
		this.level = level;
	}
	show() {
		console.log(`${this.name}, уровень ${this.level}`);		
	}
}

class PokemonList extends Array {	
	constructor(...items) {
		super(...items);
		console.log(this);
	}
	add(name, level) {
		this.push(new Pokemon(name, level));
		console.log(this);
	}
}

var p = new Pokemon('Вася', 2);
p.show();

var lost = new PokemonList(new Pokemon('Вася', 2), new Pokemon('Коля', 1), new Pokemon('Миша', 3));

lost.add('Васек', 5);
lost.add('Бобр', 6);
lost.add('Конь', 7);

console.log(lost.shift());
console.log(lost);

var found = new PokemonList(new Pokemon('Лена', 12), new Pokemon('Катя', 11), new Pokemon('Оля', 13));

found.add('Татьяна', 16);

PokemonList.prototype.show = function() {
	console.log(`Список пакемонов (кол-во ${this.length}):`);
	
	for (let el of this)
		console.log(`${el.name}, уровень ${el.level}`);
}

lost.show();
found.show();

found.push(lost.pop());

lost.show();
found.show();

Pokemon.prototype.valueOf = function() { 
	return this.level;
};

PokemonList.prototype.max = function() {
	var max = null;
	for (let el of this)
		if(!max || el > max) max = el;
	return max;
}

console.log(lost.max());
console.log(found.max());




