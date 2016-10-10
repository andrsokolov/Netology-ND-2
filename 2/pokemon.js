class Pokemon {
	constructor(name, level) {
		this.name = name;
		this.level = level;
	}
	show() {
		console.log(`${this.name}, уровень ${this.level}`);	

		return this;
	}
}

Pokemon.prototype.valueOf = function() { 
	return this.level;
};

module.exports = Pokemon;