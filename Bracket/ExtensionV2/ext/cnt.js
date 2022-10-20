var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function ses(e, s) {
    for (const a in s)
        e.style[a] = s[a];
}
let firestore;
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => setTimeout(resolve, ms));
    });
}
class Chat {
    static prepare(pageNum) {
        if (pageNum == 1473)
            this.getFormsData();
        window.addEventListener("keydown", (e) => {
            if (e.key != "|" || !e.ctrlKey || !e.shiftKey)
                return;
            this.toggle();
        });
    }
    static getFormsData() {
        if (document.getElementsByClassName("EbMsme").length > 0)
            this.setUsername(document.getElementsByClassName("EbMsme")[0].innerText.split('@')[0]);
    }
    static setUsername(un) {
        this.username = un.replace(/[^a-zA-Z0-9]/g, "_");
        if (this.loadState == 1)
            document.getElementById("chatTopMessage").innerText = "@" + this.username + this.topMessageText;
    }
    static initialize() {
        const firebaseApp = document.createElement("script");
        firebaseApp.src = "https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js";
        document.body.appendChild(firebaseApp);
        const firebaseFirestore = document.createElement("script");
        this.loadState = 0;
        firebaseFirestore.onload = () => { this.didLoad(); };
        firebaseFirestore.src = "https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js";
        document.body.appendChild(firebaseFirestore);
        this.chatbox = document.createElement("div");
        this.chatbox.id = "chat";
        ses(this.chatbox, {
            "position": "fixed", "width": "0", "height": "500px", "backgroundColor": "#fffb",
            "top": "9px", "right": "9px", "borderRadius": "8px",
            "border": "0px solid #dadce0", "boxShadow": "0 1px 5px -3px",
            "transition": "all .1s", "overflow": "hidden", "zIndex": "999999",
            "fontSize": "14px", "backdropFilter": "blur(8px)", "color": "#222"
        });
        this.messages = document.createElement("div");
        ses(this.messages, {
            "width": "100%", "height": "calc(100%  -  43px)", "boxSizing": "border-box", "padding": "8px",
            "paddingTop": "10px", "overflow-y": "auto", "font-family": "sans-serif"
        });
        this.messages.innerHTML = "<b id='chatTopMessage' style='opacity:0.4'>Loading..." + this.topMessageText + "</b><br>";
        this.chatbox.appendChild(this.messages);
        this.textbox = document.createElement("input");
        this.textbox.type = "text";
        this.textbox.onkeydown = (e) => {
            if (e.key != "Enter" || e.shiftKey)
                return;
            this.sendData(this.textbox.value);
            this.textbox.value = "";
            this.messages.scrollBy(0, this.messages.scrollHeight);
        };
        ses(this.textbox, {
            "width": "calc(100%  -  10px)", "height": "32px", "margin": "5px",
            "padding": "4px", "fontSize": "18px", "boxSizing": "border-box",
            "position": "absolute", "bottom": "0", "borderRadius": "4px", "border": "1px solid #888"
        });
        this.chatbox.appendChild(this.textbox);
        document.body.appendChild(this.chatbox);
    }
    static didLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            document.getElementById("chatTopMessage").innerText = "@" + this.username + this.topMessageText;
            this.loadState = 1;
            while (window.firebase === undefined) {
                yield sleep(100);
            }
            const app = firebase.initializeApp({
                apiKey: "AIzaSyDPywQrNa7c42lWMgWSvi4yX3rDz9sd_Og",
                authDomain: "code-i-guess.firebaseapp.com",
                projectId: "code-i-guess",
                storageBucket: "code-i-guess.appspot.com",
                messagingSenderId: "500927283492",
                appId: "1:500927283492:web:f060911c20995abf1333b1"
            });
            const pdb = firebase.firestore();
            this.db = pdb.collection("EDSMessages");
            this.db.orderBy("time").onSnapshot((q) => {
                q.docChanges().map((doc) => {
                    console.log("Doc changed:", doc.type);
                    if (doc.type == 'removed')
                        return;
                    let dat = doc.doc.data();
                    let tc = (Date.now() - parseInt(dat.time));
                    if (tc > 864e5) {
                        console.log("Message '" + dat.val + "' too old, deleting.");
                        return;
                    }
                    this.displayMessage(dat.user, dat.time, dat.val);
                });
            });
            setInterval(function () {
                let es = document.querySelectorAll(".ct");
                for (let e = 0; e < es.length; e++) {
                    let ms = Math.floor((Date.now() - parseInt(es[e].getAttribute('tm'))) / 6e4);
                    es[e].innerText = (ms == 0 ? "now" : ms + " mins ago");
                }
            }, 1e4);
        });
    }
    static show() { ses(this.chatbox, { "opacity": "1", "width": "300px", "border": "1px solid #dadce0" }); }
    static hide() { ses(this.chatbox, { "width": "0", "border": "0px solid #dadce0" }); }
    static toggle() {
        if (!this.isInitialized) {
            this.isShowing = true, this.initialize(), this.show(), this.isInitialized = true;
            return;
        }
        this.isShowing = !this.isShowing;
        this.isShowing ? this.show() : this.hide();
    }
    static sendData(dat) {
        this.db.add({
            user: this.username,
            val: dat,
            time: Date.now()
        });
    }
    static displayMessage(name, when, value) {
        if (value.startsWith("{{"))
            return;
        if (value.startsWith("{{ANS}}")) {
        }
        else if (value.startsWith("{{REQANS}}")) {
        }
        else if (value.startsWith("{{ABSANS}}")) {
        }
        else {
            let ms = Math.floor((Date.now() - parseInt(when)) / 6e4);
            this.messages.innerHTML += "<br><div style='width:2px;height:8px'></div><a class='ct'tm='" + when + "'style='font-size:75%;opacity:35%'>" + (ms == 0 ? "now" : ms + " mins ago") + "</a>";
            this.messages.innerHTML += "<br><b>@" + name + ":</b>  " + value;
        }
    }
}
Chat.topMessageText = " (Ctrl+Shift+Backslash)";
Chat.isInitialized = false;
Chat.isShowing = false;
Chat.loadState = -1;
Chat.username = "no_username";
document.addEventListener("mouseover", (e) => {
    let el = e.target;
    if (el.childElementCount == 0) {
        if (el.innerText.includes(atob('QWJleQ=='))) {
            el.style.transition = "all .05s";
            el.parentElement.style.transition = "transform .05s";
            el.style.textShadow = "-0.15ch 0px 0px #8800FF";
            el.style.filter = "blur(1px)";
            el.parentElement.style.transform = "skew(20deg,1.5deg)";
            setTimeout(() => {
                el.style.textShadow = "0ch 0px 0px #8800FF";
                el.parentElement.style.transform = "skew(-5deg,-1.5deg)";
                el.innerText = el.innerText.replace(new RegExp(atob('KEFiZXkgSm9zZXxBYmV5IEpcLnxBYmV5IEp8QWJleSBKb3PpfEFiZXkp'), 'g'), "Abby");
            }, 100);
            setTimeout(() => { el.style.textShadow = ""; el.style.filter = ""; el.parentElement.style.transform = ""; }, 200);
        }
    }
});
setTimeout(() => {
    let wsc = 0;
    window.location.host.replace("www.", "").split('').map(e => wsc += e.charCodeAt(0));
    if (wsc == 1337 && document.getElementById("lblHeaderName")) {
        document.getElementById("MainDiv").style.height = "unset";
        document.getElementById("lblHeaderName").onclick = () => {
            let foundSolution = false;
            for (var i = 0; i < parent.frames.length; i++) {
                if ("showSolution" in parent.frames[i]) {
                    parent.frames[i].showSolution();
                    foundSolution = true;
                }
            }
            if (!foundSolution) {
                if (document.getElementsByClassName("AnsOption").length != 0) {
                    alert("It's option #" + (Array.prototype.slice.call(document.getElementsByClassName("AnsOption")).map(function getAnswer(ctrl) {
                        arrval = ctrl.value.split("#"), arrkeyval = document.getElementById("hdnKeyValues").value.split("#");
                        return arrval[2];
                    }).indexOf('1') + 1) + '!');
                }
                else {
                    alert("Here's the solution :)");
                    const el = document.getElementsByTagName("iframe")[0].contentDocument;
                    try {
                        el.getElementsByClassName("solutionMain")[0].style.display = "inline-block";
                    }
                    catch (e) { }
                    try {
                        el.getElementsByClassName("solutionMainSteps")[0].style.display = "inline-block";
                    }
                    catch (e) { }
                    try {
                        el.getElementsByClassName("Step1")[0].style.display = "inline-block";
                    }
                    catch (e) { }
                }
            }
        };
    }
    else if (wsc == 1473) {
    }
    Chat.prepare(wsc);
}, 500);
function convert(str) {
}
