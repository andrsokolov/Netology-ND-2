const http = require('http');
const url = require('url');
const port = process.env.PORT || 8081;
const items = require('./items');


var storage = new items.ItemList();


function handler(req, res) {
	
	let urlInfo = url.parse(req.url, true),		
		action = urlInfo.pathname.replace('/', '');
		
	let result = '';
	
	switch(action) {
		case '':
			result = JSON.stringify(storage);
		
			break;
		
		case 'add':
		{
			let name = urlInfo.query['name'],
				count = parseInt(urlInfo.query['count'] || '');
			
			if(!name || isNaN(count)) {
				result = JSON.stringify({error: "Fill required params"});
				break;
			}
			
			result = JSON.stringify(storage.add(name, count));
		}	
		break;
		
		case 'append':
		case 'remove':
		{
			let id = parseInt(urlInfo.query['id'] || ''),
				count = parseInt(urlInfo.query['count'] || '');
			
			if(isNaN(id) || isNaN(count)) {
				result = JSON.stringify({error: "Fill required params"});
				break;
			}
						
			let item = storage.findById(id);
			
			if(!item) {
				result = JSON.stringify({error: "Not found"});
				break;
			}
			
			item.append((action == 'append' ? 1 : -1) * Math.abs(count));
			
			result = JSON.stringify(item);
		}	
		break;
		
			
			
		default:
			result = JSON.stringify({error: "Unknown command"});
	}
	
	res.writeHead(200, 'OK', {'Content-Type': 'application/json'} );
	res.write(result);	
	res.end();
	
}



const server = http.createServer();

server.on('error', error => console.log(error));
server.on('request', handler);
server.on('listening', () => {
	console.log('Start server on port %d', port);
});

server.listen(port);