
const randomNumber = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getUnicNumbers = (count, fromCount) => {
	let arr = [],
		result = [];
	
	for(let i=0; i<fromCount; i++)
		arr[arr.length] = i;
	
	for(let i=0; i<count; i++)
		result[result.length] = arr.splice(randomNumber(0, arr.length-1), 1)[0];
	
	return result;
}


module.exports = {
	randomNumber,
	getUnicNumbers
}