var message = {};
	message.chatbox = document.querySelector('#chatbox');
	message.chatbox.addEventListener('keydown',(event)=>{
		if(event.key.toLowerCase() == 'enter'){
			event.preventDefault();
			message.send(chatbox.value);
			chatbox.value = '';
		}
	});
	message.chatbtn = document.querySelector('#chatbtn');
	message.chatbtn.addEventListener('click',(event)=>{
		message.send(chatbox.value);
		chatbox.value = '';
	});
	message.display = document.querySelector('#messages');
	message.display.innerHTML = '';
	message.add = function(o){
		this.display.innerHTML += `
			<div class="message">
				<div><img src="${o.avatar}"></div>
				<div>
					<div>${o.username} <span>${o.date}</span></div>
					<div>
						<p>${o.msg}</p>
					</div>
				</div>
				<div>
					<span class="material-icons">report_problem</span>
				</div>
			</div>
		`;
		this.display.scrollTo(0,this.display.scrollHeight);
	}
	message.sound = new Audio('../aud/newMessage.wav');
	message.send = function(msg){
		ws.send(msg);
	}

var ws = new WebSocket('wss://chat-webapp.bryku.repl.co');
	ws.addEventListener('open',(event)=>{
		ws.send(':get_messages');
	});
	ws.addEventListener('message',(event)=>{
		message.sound.play();
		var messages = JSON.parse(event.data);
			messages.forEach((v)=>{
				message.add(v);
			});
	})