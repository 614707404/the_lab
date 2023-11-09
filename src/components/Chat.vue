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
						{ _id: '1234', username: '小助教' },
						{ _id: '4321', username: '用户' }
					]
				}
			],
			messages: [],
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

			for (let i = 0; i < 30; i++) {
				messages.push({
					_id: reset ? i : this.messages.length + i,
					content: `${reset ? '' : 'paginated'} message ${i + 1}`,
					senderId: '4321',
					username: 'John Doe',
					date: '13 November',
					timestamp: '10:20'
				})
			}

			return messages
		},

		sendMessage(message) {
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
