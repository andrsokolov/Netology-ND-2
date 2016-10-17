process.chdir(__dirname);

const fs = require('fs');
const testFile = 'test.txt';

/*
• Создать два потока: чтение и запись файла;
• Используя crypto.createHash() вычислить md5 читаемых данных;
• Результат вывести в консоль и записать в файл;
• Использовать pipe() .
*/

const rstream = fs.createReadStream(testFile, { encoding: 'utf-8' }),
	wstream = fs.createWriteStream(testFile.replace('.txt', '_hash.txt'));

rstream.on('error', err => console.log(err));
wstream.on('error', err => console.log(err));

const crypto = require('crypto');

const hash = crypto.createHash('md5');
hash.setEncoding('hex');
hash.on('error', err => console.log(err));

rstream.pipe(hash).pipe(process.stdout);

rstream
	.pipe(hash)
	.pipe(wstream)
	.on('finish', () => {
		fs.unlink(testFile.replace('.txt', '_hash.txt'), (err) => {
			if (err)
				console.log("\ntest file delete error");
		});
	});

/*
const hash2 = crypto.createHash('md5');
hash2.setEncoding('hex');
hash2.write('test file');
hash2.end();
console.log(hash2.read());
*/
	
/*
• Расширить предыдущие решение используя stream.Transform ;
• Реализовать свой класс, что будет конвертировать результат crypto.createHash()
(бинарные данные - хеш-сумма) в hex формат;
• Результат вывести в консоль и записать в файл;
• Использовать pipe() .
*/


const rstream2 = fs.createReadStream(testFile, { encoding: 'utf-8' }),
	wstream2 = fs.createWriteStream(testFile.replace('.txt', '_hash2.txt'));

rstream2.on('error', err => console.log(err));
wstream2.on('error', err => console.log(err));

const hash2 = crypto.createHash('md5');
hash2.on('error', err => console.log(err));
	
const stream = require('stream');

class MyTrans extends stream.Transform {
	constructor (options={}){
		super(options);
		
		this.chunks = [];
	}
	
	_transform (chunk, encoding, callback) {
		this.chunks.push(chunk);
		
		callback();
	}
	
	_flush (callback) {
		console.log("\n");
		this.push(Buffer.concat(this.chunks).toString('hex'));
		callback();
	};
}

rstream2.pipe(hash2).pipe(new MyTrans()).pipe(process.stdout);

rstream2
	.pipe(hash2)
	.pipe(new MyTrans())
	.pipe(wstream2)
	.on('finish', () => {
		fs.unlink(testFile.replace('.txt', '_hash2.txt'), (err) => {
			if (err)
				console.log("\ntest file delete error");
		});
	});

	
/*
• Реализовать свой класс на основе: Readable, Writable, Transform
• Readable класс должен генерировать бесконечное кол-во случайных цифр;
• Writable класс должен выводить полученные данные через _write в консоль;
• Transform класс должен как-либо изменять данные и передавать их на дальнейшую
обработку, но с интервалами в 1 сек;
• Использовать pipe() .
*/

const random = require('./random');

class RGen extends stream.Readable {
	constructor (options={}){
		super(options);
	}
	
	_read(size) {
		setTimeout(function(st) {
			return function() {
				st.push(random(1, 9).toString());
			}
		}(this), 100);		
	}	
}
	
class TGen extends stream.Transform {
	constructor (options={}){
		super(options);
		
		this.chunks = [];
		
		setInterval(function(st) {
			return function() {
				let c = st.chunks.splice(0, st.chunks.length);
				
				st.push(c.join(''));
			}
		}(this), 1000);
	}
	
	_transform (chunk, encoding, callback) {
		this.chunks.push('0' + chunk);
			
		callback();
	}
}

class WGen extends stream.Writable {
	constructor (options={}){
		super(options);
	}
	
	_write (chunk, encoding, callback) {
		console.log(chunk.toString());
			
		callback();
	}	
}
	
	
(new RGen()).pipe(new TGen()).pipe(new WGen());
	
	
	
