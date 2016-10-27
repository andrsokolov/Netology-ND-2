class Item {
	constructor(id, name, count) {
		this.id = id;
		this.name = name;
		this.count = count;
	}
	
	append(count) {
		this.count += count;
	}
	
	valueOf() {
		return this.count;
	}
}

class ItemList extends Array {	
	constructor(...items) {
		items = items.filter(el => el instanceof Item);
		
		super(...items);
		
		this.identity = 0;		
	}
	add(name, count) {
		let item = new Item(++this.identity, name, count);
		
		this.push(item);
		
		return item;
	}
	findById(id) {
		if(!this.length) return null;
			
		return this.find(el => el.id === id);
	}
}

module.exports = {
	Item,
	ItemList
};