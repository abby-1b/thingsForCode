
// FIREBASE

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js"
import * as firestore from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js"

// console.log(firestore)

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Initialize Firebase
const app = initializeApp({
	apiKey: "AIzaSyDPywQrNa7c42lWMgWSvi4yX3rDz9sd_Og",
	authDomain: "code-i-guess.firebaseapp.com",
	projectId: "code-i-guess",
	storageBucket: "code-i-guess.appspot.com",
	messagingSenderId: "500927283492",
	appId: "1:500927283492:web:f060911c20995abf1333b1"
})

const pdb = firestore.getFirestore(app)
const db = firestore.collection(pdb, "EDSMessages")
const query = await firestore.getDocs(db)

const unsub = firestore.onSnapshot(firestore.query(db, firestore.orderBy("time")), (q) => {
	// console.log(doc._snapshot.docChanges)
	q._snapshot.docChanges.map((doc) => {
		if (doc.type == 2 || doc.type == 1) return // 2 is ???, 1 is delete
		let id = doc.doc.key.path.segments.at(-1)
		let dat = doc.doc.data.value.mapValue.fields
		let tc = (Date.now() - parseInt(dat.time.integerValue))
		if (tc > 72e5) {
			console.log("Message " + id + " too old, deleting.")
			firestore.deleteDoc(firestore.doc(pdb, "EDSMessages", id))
			return
		}
		let ms = Math.floor(tc / 6e4)
		msg.innerHTML += "<br><div style='width:2px;height:8px'></div><a class='ct'tm='" + dat.time.integerValue + "'style='font-size:75%;opacity:35%'>" + (ms==0?"now":ms+" mins ago") + "</a>"
		msg.innerHTML += "<br><b>@" + dat.user.stringValue + "</b>:  " + dat.val.stringValue
	})
})

setInterval(function() {
	let es=document.getElementsByClassName("ct")
	for (let e=0;e<es.length;e++) {
		let ms=Math.floor((Date.now()-parseInt(es[e].getAttribute('tm')))/6e4)
		es[e].innerText=(ms==0?"now":ms+" mins ago")
	}
}, 1e4)

let userName = document.getElementsByClassName("freebirdFormviewerViewHeaderEmailAddress").length > 0
	? document.getElementsByClassName("freebirdFormviewerViewHeaderEmailAddress")[0].innerText.split('@')[0]
	: prompt("Enter your name:")

if ((!userName) || userName == "")
	userName = "[no name]"

function ses(e, s) { for (let a in s) e.style[a] = s[a] }

let chat = document.createElement("div")
chat.id = "chat"
ses(chat, {
	"position": "fixed", "width": "0", "height": "500px",
	"backgroundColor": "white", "top": "9px", "right": "9px",
	"borderRadius": "8px", "border": "0px solid #dadce0", "boxShadow": "0 1px 5px -3px",
	"transition": "all .1s", "overflow": "hidden"
})

let header = document.createElement("div")
header.style.opacity = "0"
header.style.transition = chat.style.transition
header.className = "freebirdFormviewerViewHeaderThemeStripe freebirdSolidBackground exportThemeStripe"
chat.appendChild(header)

let msg = document.createElement("div")
ses(msg, {
	"width": "100%", "height": "calc(100%  -  43px)",
	"boxSizing": "border-box", "padding": "8px", "paddingTop": "18px",
	"overflow-y": "scroll"
})
msg.innerHTML = "<b style='opacity:0.35'>@" + userName + "  (Ctrl+Shift+\\)</b><br>"

chat.appendChild(msg)

let input = document.createElement("input")
input.type = "text"
input.onkeydown = (e) => {
	if (e.key == "Enter" && !e.shiftKey) {
		firestore.addDoc(db, {
			user: userName,
			val: input.value,
			time: Date.now()
		})
		input.value = ""
		msg.scrollBy(0, msg.scrollHeight)
	}
}
ses(input, {
	"width": "calc(100%  -  10px)", "height": "32px", "margin": "5px",
	"padding": "4px", "fontSize": "18px", "boxSizing": "border-box",
	"position": "absolute", "bottom": "0"
})
chat.appendChild(input)

document.body.appendChild(chat)
let shown = false
function show() {
	header.style.opacity = "1"
	ses(chat, {"opacity": "1", "width": "300px", "border": "1px solid #dadce0"})
}
function hide() {
	header.style.opacity = "0"
	ses(chat, {"width": "0", "border": "0px solid #dadce0"})
}
window.onkeydown = function(e) {
	if (e.key == '|' && e.ctrlKey && e.shiftKey) {
		shown = !shown
		if (shown) show()
		else hide()
	}
}
// show()

setTimeout(()=>{msg.scrollBy(0, msg.scrollHeight)},1e3)

function compress(vl) {
	let s = {}
	for(ss=2;ss<60;ss++) {
		d={}
		for(i=0;i<vl.length-ss;i++) {
			c=vl.substring(i,i+ss)
			if(c in d)d[c]++
			else d[c]=1
		}
		m=Math.max(...Object.values(d))
		if(m<3)continue
		s[Object.keys(d)[Object.values(d).indexOf(m)]]=m
	}
	mx=-1
	mw=-1
	for (c in s) {
		_=c.length*s[c]-s[c]
		mw=_>mx?c:mw
		mx=_>mx?_:mx
	}
	if(mx>-1)vl=mw+"ª"+vl.split(mw).join("ª")
	return vl
}

function decompress(vl) {
	if (vl.includes("ª")) return vl
	vl=vl.split`ª`
	return vl.slice(1).join(vl[0])
}

// Get form data

// for(i in _="freebird",m="Formviewer",k="getElementsByTagName",p="parentElement",w="join",$="",g=document[t="getElementsByClassName"](_+m+"ViewItemList")[0][y="children"],s=_+m+"ComponentsQuestion",[...g])if(c=g[i][y][0],!c.className.includes(_+"MaterialHeaderbannerLabelContainer")){switch(ct="TextShort.TextLong.RadioRadio.CheckboxCheckbox.SelectRoot.FileuploadRoot.ScaleRoot.GridCheckbox.DateLabel.TimeRoot"[z="split"]`.`.map(e=>c[t](s+e).length>0)[j="indexOf"](!0),ct=ct>6?ct+1:ct<0?7:ct,n=JSON.parse("["+c.getAttribute("data-params").slice(4))[0][1],m="",ct){case 0:m=c[k]("input")[0].value;break;case 1:m=c[k]("textarea")[0].value;break;case 3:case 2:_=[...c[t]("isChecked")].filter(e=>"LABEL"==e.tagName.toUpperCase()),m=_.map(e=>[...e[p][p][y]][j](e[p])),m=c[y][0][y][1].innerText[z]`\n`.map((e,t)=>(m.includes(t)?" ":"")+e)[w]`ﬂ`;break;case 4:q=c[t]("isSelected")[0],_=q.classList.contains("isPlaceholder")?-1:[...q[p][y]][j](q)-2,m=q[p].innerText[z]`\n`.slice(1).map((e,t)=>(t==_?" ":"")+e)[w]`ﬂ`;break;case 5:m=c[y][0][y][1].innerText[z]`\n`[0];break;case 6:_=[...c[t]("isChecked")],_=_.length<1?_=-1:[..._[0][p][p][p][p][y]][j](_[0][p][p][p]),m=c[y][0][y][1].innerText[z]`\n`.map((e,t)=>(t==_?" ":"")+e)[w]`ﬂ`}$+=ct+"§"+n+"§"+m}
