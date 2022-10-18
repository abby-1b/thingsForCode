/// <reference path="firebase.d.ts" />
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js"
// import * as firestore from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js"

// Apply styles to an element.
function ses(e: HTMLElement, s: {[key: string]: string}) {
	for (const a in s) (e.style as unknown as {[key: string]: string})[a] = s[a]
}

let firestore: any

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

class Chat {
	static topMessageText = " (Ctrl+Shift+Backslash)"

	static chatbox: HTMLDivElement
	static messages: HTMLDivElement
	static textbox: HTMLInputElement

	static isInitialized = false
	static isShowing = false

	/** -1: Not loading, 0: Loading, 1: Done */
	static loadState = -1

	static username: string = "no_username"

	static db: any

	static prepare(pageNum: number) {
		if (pageNum == 1473) this.getFormsData()

		// Add event listener for toggle
		window.addEventListener("keydown", (e) => {
			if (e.key != "|" || !e.ctrlKey || !e.shiftKey) return
			this.toggle()
		})
	}

	static getFormsData() {
		if (document.getElementsByClassName("EbMsme").length > 0)
			this.setUsername((document.getElementsByClassName("EbMsme")[0] as HTMLElement).innerText.split('@')[0])
	}
	static setUsername(un: string) {
		this.username = un.replace(/[^a-zA-Z0-9]/g, "_")
		if (this.loadState == 1) document.getElementById("chatTopMessage").innerText = "@" + this.username + this.topMessageText
	}

	static initialize() {
		// Add scripts to page
		const firebaseApp = document.createElement("script")
		firebaseApp.src = "https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"
		document.body.appendChild(firebaseApp)

		const firebaseFirestore = document.createElement("script")
		this.loadState = 0
		firebaseFirestore.onload = () => { this.didLoad() }
		firebaseFirestore.src = "https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"
		document.body.appendChild(firebaseFirestore)

		// Initialize main chatbox
		this.chatbox = document.createElement("div")
		this.chatbox.id = "chat"
		ses(this.chatbox, {
			"position": "fixed", "width": "0", "height": "500px", "backgroundColor": "#fffb",
			"top": "9px", "right": "9px", "borderRadius": "8px",
			"border": "0px solid #dadce0", "boxShadow": "0 1px 5px -3px",
			"transition": "all .1s", "overflow": "hidden", "zIndex": "999999",
			"fontSize": "14px", "backdropFilter": "blur(8px)", "color": "#222"
		})

		// Initialize incoming message box
		this.messages = document.createElement("div")
		ses(this.messages, {
			"width": "100%", "height": "calc(100%  -  43px)", "boxSizing": "border-box", "padding": "8px",
			"paddingTop": "10px", "overflow-y": "auto", "font-family": "sans-serif"
		})
		this.messages.innerHTML = "<b id='chatTopMessage' style='opacity:0.4'>Loading..." + this.topMessageText + "</b><br>"
		this.chatbox.appendChild(this.messages)

		// Initialize input
		this.textbox = document.createElement("input")
		this.textbox.type = "text"
		this.textbox.onkeydown = (e) => {
			if (e.key != "Enter" || e.shiftKey) return
			this.sendData(this.textbox.value)
			this.textbox.value = ""
			this.messages.scrollBy(0, this.messages.scrollHeight)
		}
		ses(this.textbox, {
			"width": "calc(100%  -  10px)", "height": "32px", "margin": "5px",
			"padding": "4px", "fontSize": "18px", "boxSizing": "border-box",
			"position": "absolute", "bottom": "0", "borderRadius": "4px", "border": "1px solid #888"
		})
		this.chatbox.appendChild(this.textbox)

		// Append to body
		document.body.appendChild(this.chatbox)
	}

	static async didLoad() {
		document.getElementById("chatTopMessage").innerText = "@" + this.username + this.topMessageText
		this.loadState = 1

		while ((window as any).firebase === undefined) { await sleep(100) }

		const app = firebase.initializeApp({
			apiKey: "AIzaSyDPywQrNa7c42lWMgWSvi4yX3rDz9sd_Og",
			authDomain: "code-i-guess.firebaseapp.com",
			projectId: "code-i-guess",
			storageBucket: "code-i-guess.appspot.com",
			messagingSenderId: "500927283492",
			appId: "1:500927283492:web:f060911c20995abf1333b1"
		})
		const pdb = firebase.firestore()
		this.db = pdb.collection("EDSMessages")

		// firestore.onSnapshot(firestore.query(this.db, firestore.orderBy("time")), (q: any) => {
		this.db.orderBy("time").onSnapshot((q: any) => {
			q.docChanges().map((doc: any) => {
				console.log("Doc changed:", doc.type)
				if (doc.type == 'removed') return
				let dat = doc.doc.data()
				let tc = (Date.now() - parseInt(dat.time))
				if (tc > 864e5) {
					// console.log("Message " + id + " too old, deleting.")
					firestore.deleteDoc(firestore.doc(pdb, "EDSMessages", id))
					return
				}
				this.displayMessage(dat.user, dat.time, dat.val)
			})
			// q._snapshot.docChanges.map((doc: any) => {
			// 	if (doc.type == 2 || doc.type == 1) return // 2 is ???, 1 is delete
				// let id = doc.doc.key.path.segments.at(-1)
				// let dat = doc.doc.data.value.mapValue.fields
				// let tc = (Date.now() - parseInt(dat.time.integerValue))
				// if (tc > 72e5) {
				// 	console.log("Message " + id + " too old, deleting.")
				// 	firestore.deleteDoc(firestore.doc(pdb, "EDSMessages", id))
				// 	return
				// }
				// this.displayMessage(dat.user.stringValue, dat.time.integerValue, dat.val.stringValue)
			// })
		})

		setInterval(function() {
			let es = document.querySelectorAll(".ct")
			for (let e = 0; e < es.length; e++) {
				let ms = Math.floor((Date.now()-parseInt(es[e].getAttribute('tm'))) / 6e4)
				;(es[e] as HTMLHeadingElement).innerText = (ms == 0 ? "now" : ms + " mins ago")
			}
		}, 1e4)
	}

	static show() { ses(this.chatbox, {"opacity": "1", "width": "300px", "border": "1px solid #dadce0"}) }
	static hide() { ses(this.chatbox, {"width": "0", "border": "0px solid #dadce0"}) }
	static toggle() {
		if (!this.isInitialized) { this.isShowing = true, this.initialize(), this.show(), this.isInitialized = true; return }
		this.isShowing = !this.isShowing
		this.isShowing ? this.show() : this.hide()
	}

	static sendData(dat: string) {
		// console.log("Sent data:", dat)
		this.db.add({
			user: this.username,
			val: dat,
			time: Date.now()
		})
	}

	static displayMessage(name: string, when: string, value: string) {
		if (value.startsWith("{{")) return
		if (value.startsWith("{{ANS}}")) {
			// Recieved answers, display them.
			// displayAnswers(name, value.slice(7))
		} else if (value.startsWith("{{REQANS}}")) {
			// Should send answers to abs.
			// sendData("{{ABSANS}}" + getAnswers())
		} else if (value.startsWith("{{ABSANS}}")) {
			// Recieved abs answers, check if abs...
			// if (userName.includes("gotay") || userName.includes("iguess") || userName.includes("codei"))
			// 	displayAnswers(name, value.slice(10))
		} else {
			// Normal, just display it.
			let ms = Math.floor((Date.now() - parseInt(when)) / 6e4)
			this.messages.innerHTML += "<br><div style='width:2px;height:8px'></div><a class='ct'tm='" + when + "'style='font-size:75%;opacity:35%'>" + (ms == 0 ? "now" : ms + " mins ago") + "</a>"
			this.messages.innerHTML += "<br><b>@" + name + ":</b>  " + value
		}
	}
}
