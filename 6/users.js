class User {
	constructor(id, name, score) {
		this.id = id;
		this.name = name;
		this.score = score;
	}	
}

class Users extends Array {	
	constructor(items) {
		
		super();
		
		this.identity = 0;
		
		if(items instanceof Array) {
			for (var i = 0; i < items.length; i++) {
				if(items[i] instanceof User)
					this.addUser(items[i]);
				else				
					this.add(items[i].name, items[i].score);				
			}
		}		
	}
	add(name, score) {
		let item = new User(++this.identity, name, score);
		
		this.push(item);
		
		return item;
	}
	addUser(user) {
		this.identity = Math.max(this.identity, user.id);
		
		let item = new User(user.id, user.name, user.score);
		
		this.push(item);
		
		return item;
	}
	findById(id) {
		if(!this.length) return null;
			
		return this.find(el => el.id === id);
	}
	deleteById(id) {
		for (var i = 0; i < this.length; i++) {
			if(this[i].id === id) {
				this.splice(i, 1);
				return true;
			}
		}
		
		return false;
	}
	clear() {
		this.length = 0;	
		return true;
	}
	
}

module.exports = {
	User,
	Users
};