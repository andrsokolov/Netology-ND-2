$(function() {

    var userName,
        userRoom,
        connected = false,
        socket = io();

    function clearTags(text) {
        return $('<div />').text(text).text();
    }

    function addChatMessage(data) {
        var $message = $('<li class="message" />');  
        
        $('<span class="username"/>').text(data.name).appendTo($message);
        $('<span class="messageBody"/>').text(data.message).appendTo($message);

        $('ul.messages').append($message);
    }

    function addChatInfo(message) {
        var $message = $('<li class="log" />').text(message);

        $('ul.messages').append($message);
    }


    $('.usernameInput').keydown(function(){
        if (event.which === 13) {
            userName = clearTags($('.usernameInput').val());

            if(userName) {
                $('.login.page').hide();
                $('.chat.page').show();

                userRoom = $('.loginRoom').val();

                $('.roomname').text('Комната ' + userRoom);

                socket.emit('add user', { name: userName, room: userRoom });
            }
        }
    });

    $('.inputMessage').keydown(function(){
        if (event.which === 13) {
            let message = clearTags($('.inputMessage').val());

            if(message) {
                $('.inputMessage').val('');

                addChatMessage({ message: message, name: userName });

                socket.emit('new message', { message: message });
            }
        }
    });


    socket.on('new message', function (data) {
        addChatMessage(data);
    });

    socket.on('user joined', function (data) {
        addChatInfo(data.name + ' присоединился к чату (участников:' + data.numUsers + ')');
    });

    socket.on('login', function (data) {
        addChatInfo('Вы присоединились к чату (участников:' + data.numUsers + ')');
    });

    socket.on('user left', function (data) {
        addChatInfo(data.name + ' отключился от чата (участников:' + data.numUsers + ')');
    });


});