<template>
	<div class="chat-box">
		<img class="chat-button" @click="getChat" src="plus.svg"/>
		<vue-advanced-chat
			v-show="isOpen"
			class="chat"
			:current-user-id="currentUserId"
			:rooms="JSON.stringify(rooms)"
			:rooms-loaded="true"
			:messages="JSON.stringify(messages)"
			:messages-loaded="messagesLoaded"
			:single-room="true"
			@send-message="sendMessage($event.detail[0])"
			@fetch-messages="fetchMessages($event.detail[0])"
		/>
	</div>
</template>

<script>
import { register } from 'vue-advanced-chat'
import axios from 'axios'
// import { register } from '../../vue-advanced-chat/dist/vue-advanced-chat.es.js'
register()

export default {
	data() {
		return {
			currentUserId: '1234',
			rooms: [
				{
					roomId: '1',
					roomName: 'Pixel2Mesh小助教',
					avatar: 'https://66.media.tumblr.com/avatar_c6a8eae4303e_512.pnj',
					users: [
						{ _id: '1234', username: '用户' },
						{ _id: '4321', username: '小助教' }
					]
				}
			],
			messages: [],
			history:[],
			messagesLoaded: false,
			isOpen: false
		}
	},

	methods: {
		getChat(){
			this.isOpen = !this.isOpen
		},
		fetchMessages({ options = {} }) {
			setTimeout(() => {
				if (options.reset) {
					this.messages = this.addMessages(true)
				} else {
					this.messages = [...this.addMessages(), ...this.messages]
					this.messagesLoaded = true
				}
				// this.addNewMessage()
			})
		},

		addMessages(reset) {
			const messages = []
			messages.push({
					_id: 1,
					content: `你好，我是Pixel2Mesh小助教，你有任何问题都可以问我。`,
					senderId: '4321',
					username: '小助教',
					timestamp: new Date().toString().substring(16, 21),
					date: new Date().toDateString()
				})
			// for (let i = 0; i < 30; i++) {
			// 	messages.push({
			// 		_id: reset ? i : this.messages.length + i,
			// 		content: `${reset ? '' : 'paginated'} message ${i + 1}`,
			// 		senderId: '4321',
			// 		username: 'John Doe',
			// 		date: '13 November',
			// 		timestamp: '10:20'
			// 	})
			// }

			return messages
		},

		sendMessage(message) {
			console.log("sendMessage:", message.content)
			this.history = [
						...this.history,
						{
							role:"user",
							content:message.content
						}
					]
			// axios.post('http://172.20.137.74:7861/chat/knowledge_base_chat', {
			axios.post('http://localhost:7861/chat/knowledge_base_chat', {

				query: message.content,
				knowledge_base_name: "samples",
				top_k: 3,
				score_threshold: 1,
				history: this.history,
				stream: false,
				model_name: "chatglm2-6b",
				temperature: 0.7,
				max_tokens: 1000,
				prompt_name: "default"
			})
			.then(response => {
				console.log(response.data)
				setTimeout(() => {
					this.messages = [
						...this.messages,
						{
							_id: this.messages.length,
							content: response.data.answer,
							senderId: '4321',
							username: '小助教',
							timestamp: new Date().toString().substring(16, 21),
							date: new Date().toDateString()
						}
					]
					this.history = [
						...this.history,
						{
							role:"assistant",
							content:response.data.answer
						}
					]
			}, 2000)
			})
			.catch(error => {
				console.log(error)
			})
			this.messages = [
				...this.messages,
				{
					_id: this.messages.length,
					content: message.content,
					senderId: this.currentUserId,
					timestamp: new Date().toString().substring(16, 21),
					date: new Date().toDateString()
				}
			]
		},

		addNewMessage() {
			setTimeout(() => {
				this.messages = [
					...this.messages,
					{
						_id: this.messages.length,
						content: 'NEW MESSAGE',
						senderId: '1234',
						timestamp: new Date().toString().substring(16, 21),
						date: new Date().toDateString()
					}
				]
			}, 2000)
		}
	}
}
</script>

<style lang="scss">
body {
	font-family: 'Quicksand', sans-serif;
}
.chat-box{
	position: relative;
	height: 600px;
	width: 350px;
	.chat{
		position: absolute;
		height: 100%;
		width: 300px;
	}
	.chat-button{
		position: absolute;
		height: 50px;
		width: 50px;
		left: 300px;
		top:600px;
	}
}

</style>
