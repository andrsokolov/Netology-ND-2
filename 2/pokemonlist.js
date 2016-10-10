const Pokemon = require('./pokemon');

class PokemonList extends Array {	
	constructor(...items) {
		if(items.length === 1 && items[0] instanceof Array) {
			items = items[0].map(
				obj => new Pokemon(obj.name, obj.level)
			)
		}
		else
			items = items.filter(el => el instanceof Pokemon);
		
		super(...items);
	}
	add(name, level) {
		this.push(new Pokemon(name, level));
		
		return this;
	}
	show() {
		console.log(`Список пакемонов (кол-во ${this.length}):`);
		
		for (let el of this)
			el.show();
		
		return this;
	}
}

PokemonList.prototype.max = function() {
	if(!this.length) return null;
	
	var maxLevel = Math.max(...this);
		
	return this.find(el => el.level === maxLevel);
}


module.exports = PokemonList;