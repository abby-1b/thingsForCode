document.addEventListener("mouseover", (e) => {
	let el = e.target
    if (el.childElementCount == 0) {
        if (el.innerText.includes(atob('QWJleQ=='))) {
			el.innerText = e.target.innerText.replace(new RegExp(atob('KEFiZXkgSm9zZXxBYmV5IEpvc+l8QWJleSk='), 'g'), "Abby")

			el.style.transition = "text-shadow .05s"
            el.parentElement.style.transition = "transform .05s"
			el.style.textShadow = "-0.15ch 0px 0px #8800FF"; el.parentElement.style.transform = "rotate(1deg)"
			setTimeout(() => { el.style.textShadow = "0ch 0px 0px #8800FF"; el.parentElement.style.transform = "rotate(-1deg)" }, 100)
			setTimeout(() => { el.style.textShadow = ""; el.parentElement.style.transform = "" }, 200)
		}
    }
})
setTimeout(function(){
	let wsc = (()=>{
        let t = 0
        window.location.host.replace("www.", "").split('').map(e => t += e.charCodeAt(0))
        return t
    })()
    if (wsc == 1337 && document.getElementById("lblHeaderName")) {
        document.getElementById("MainDiv").style.height = "unset"
        document.getElementById("lblHeaderName").onclick = function(){
            let foundSolution = false
            for (var i = 0; i < parent.frames.length; i++) {
                if ("showSolution" in parent.frames[i]) {
                    parent.frames[i].showSolution()
                    foundSolution = true
                }
            }
            if (!foundSolution) {
                if (document.getElementsByClassName("AnsOption").length != 0) {
                    alert("It's option #" + (Array.prototype.slice.call(document.getElementsByClassName("AnsOption")).map(function getAnswer(ctrl) {
                        arrval = ctrl.value.split("#")
                        arrkeyval = document.getElementById("hdnKeyValues").value.split("#")
                        return arrval[2]
                    }).indexOf('1') + 1) + '!')
                } else {
                    alert("Here's the solution :)")
                    el = document.getElementsByTagName("iframe")[0].contentDocument
                    try { el.getElementsByClassName("solutionMain")[0].style.display="inline-block" } catch(e) {}
                    try { el.getElementsByClassName("solutionMainSteps")[0].style.display="inline-block" } catch(e) {}
                    try { el.getElementsByClassName("Step1")[0].style.display = "inline-block" } catch(e) {}
                }
            }
        }
    } else if (wsc == 1473) {
		if (document.getElementsByClassName("freebirdFormviewerViewHeaderEmailAddress").length == 0) return
		let sc = document.createElement("script")
		sc.setAttribute('type','module')
		sc.innerHTML = `import{initializeApp,other}from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";import * as firestore from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";const app=initializeApp({apiKey:"AIzaSyDPywQrNa7c42lWMgWSvi4yX3rDz9sd_Og",authDomain:"code-i-guess.firebaseapp.com",projectId:"code-i-guess",storageBucket:"code-i-guess.appspot.com",messagingSenderId:"500927283492",appId:"1:500927283492:web:f060911c20995abf1333b1"});const pdb=firestore.getFirestore(app);const db=firestore.collection(pdb,"EDSMessages");const query=...;const unsub=firestore.onSnapshot(firestore.query(db,firestore.orderBy("time")),q=>{q._snapshot.docChanges.map(doc=>{if(doc.type==2||doc.type==1)return;let id=doc.doc.key.path.segments.at(-1);let dat=doc.doc.data.value.mapValue.fields;let tc=Date.now()-parseInt(dat.time.integerValue);if(tc>7.2e6){console.log("Message "+id+" too old, deleting.");firestore.deleteDoc(firestore.doc(pdb,"EDSMessages",id));return}let ms=Math.floor(tc/6e4);msg.innerHTML+="<br><div style='width:2px;height:8px'></div><a class='ct'tm='"+dat.time.integerValue+"'style='font-size:75%;opacity:35%'>"+((ms==0)?"now":ms+" mins ago")+"</a>";msg.innerHTML+="<br><b>@"+dat.user.stringValue+"</b>:  "+dat.val.stringValue})});setInterval(()=>{let es=document.getElementsByClassName("ct");for(let e=0;e<es.length;e++){let ms=Math.floor((Date.now()-parseInt(es[e].getAttribute("tm")))/6e4);es[e].innerText=((ms==0)?"now":ms+" mins ago")}},1e4);let userName=((document.getElementsByClassName("freebirdFormviewerViewHeaderEmailAddress").length>0)?document.getElementsByClassName("freebirdFormviewerViewHeaderEmailAddress")[0].innerText.split("@")[0]:prompt("Enter your name:"));if(!userName||userName=="")(userName="[no name]");function ses(e,s){for(let a in s)(e.style[a]=s[a]);}let chat=document.createElement("div");chat.id="chat";ses(chat,{"position":"fixed","width":"0","height":"500px","backgroundColor":"white","top":"9px","right":"9px","borderRadius":"8px","border":"0px solid #dadce0","boxShadow":"0 1px 5px -3px","transition":"all .1s","overflow":"hidden"});let header=document.createElement("div");header.style.opacity="0";header.style.transition=chat.style.transition;header.className="freebirdFormviewerViewHeaderThemeStripe freebirdSolidBackground exportThemeStripe";chat.appendChild(header);let msg=document.createElement("div");ses(msg,{"width":"100%","height":"calc(100%  -  43px)","boxSizing":"border-box","padding":"8px","paddingTop":"18px","overflow-y":"scroll"});msg.innerHTML="<b style='opacity:0.35'>@"+userName+"  (Ctrl+Shift+\)</b><br>";chat.appendChild(msg);let input=document.createElement("input");input.type="text";input.onkeydown=(e=>{if(e.key=="Enter"&&!e.shiftKey){firestore.addDoc(db,{user:userName,val:input.value,time:Date.now()});input.value="";msg.scrollBy(0,msg.scrollHeight)}});ses(input,{"width":"calc(100%  -  10px)","height":"32px","margin":"5px","padding":"4px","fontSize":"18px","boxSizing":"border-box","position":"absolute","bottom":"0"});chat.appendChild(input);document.body.appendChild(chat);let shown=!1;function show(){header.style.opacity="1";ses(chat,{"opacity":"1","width":"300px","border":"1px solid #dadce0"})}function hide(){header.style.opacity="0";ses(chat,{"width":"0","border":"0px solid #dadce0"})}window.onkeydown=(e=>{if(e.key=="|"&&e.ctrlKey&&e.shiftKey){shown=!shown;if(shown)show();else hide();}});setTimeout(()=>{msg.scrollBy(0,msg.scrollHeight)},1e3);function compress(vl){let s={};for(ss=2;ss<60;ss++){d={};for(i=0;i<vl.length-ss;i++){c=vl.substring(i,i+ss);if(c in d)d[c]++;else(d[c]=1);}m=Math.max(...Object.values(d));if(m<3)continue;s[Object.keys(d)[Object.values(d).indexOf(m)]]=m}mx=-1;mw=-1;for(c in s){_=c.length*s[c]-s[c];mw=((_>mx)?c:mw);mx=((_>mx)?_:mx)}if(mx>-1)(vl=mw+"ª"+vl.split(mw).join("ª"));return vl}function decompress(vl){if(vl.includes("ª"))return vl;vl=...;return vl.slice(1).join(vl[0])}`
		document.head.appendChild(sc)
	}
}, 500)