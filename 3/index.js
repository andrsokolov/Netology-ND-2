const ChatApp = require('./chat');

let webinarChat =  new ChatApp('webinar');
let facebookChat = new ChatApp('=========facebook');
let vkChat =       new ChatApp('---------vk');

let chatOnMessage = (message) => {
  console.log(message);
};

webinarChat.on('message', chatOnMessage);
facebookChat.on('message', chatOnMessage);
vkChat.on('message', chatOnMessage);


// Закрыть вконтакте
setTimeout( ()=> {
  console.log('Закрываю вконтакте...');
  vkChat.removeListener('message', chatOnMessage);
}, 10000 );


// Закрыть фейсбук
setTimeout( ()=> {
  console.log('Закрываю фейсбук, все внимание — вебинару!');
  facebookChat.removeListener('message', chatOnMessage);
}, 15000 );

//1.1 Добавить обработчик события message для Чата Вебинара (webinarChat), который выводит в консоль сообщение 'Готовлюсь к ответу'. Обработчик создать в отдельной функции.
function webinarChatRady(message) {
	console.log('Готовлюсь к ответу');
}

webinarChat.on('message', webinarChatRady);

//1.2 Для вконтакте (vkChat) установить максимальное количество обработчиков событий, равное 2.
//1.3 Добавить обработчик 'Готовлюсь к ответу' из пп. 1.1 к чату вконтакте.
vkChat
	.setMaxListeners(2)
	.on('message', webinarChatRady);

	
//2.1 В классе чата ChatApp добавить метод close, который будет вызывать событие close (событие вызывается один раз,setInterval как в констукторе, не нужен).
ChatApp.prototype.close = function() {
	this.emit('close');
};

//2.2 Для чата вконтакте (vkChat) добавить обработчик close, выводящий в консоль текст "Чат вконтакте закрылся :(".
vkChat.on('close', () => console.log('Чат вконтакте закрылся :('));

//2.3 Вызывать у чата вконтакте метод close().
vkChat.close();


//- Добавить код, который через 30 секунд отписывает chatOnMessage от вебинара webinarChat :).

setTimeout( ()=> {
	console.log('Отписываем chatOnMessage от вебинара webinarChat');
	webinarChat.eventNames().forEach(function(eventName){
		//console.log(eventName);
		webinarChat.listeners(eventName).forEach(function(listener){
			if(listener === chatOnMessage)
				webinarChat.removeListener(eventName, chatOnMessage);
		});
	});
}, 30000 );
