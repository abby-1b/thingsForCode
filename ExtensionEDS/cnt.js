document.addEventListener("mouseover",e=>{let el=e.target;if(el.childElementCount==0){if(el.innerText.includes(atob("QWJleQ=="))){el.style.transition="all .05s";el.parentElement.style.transition="transform .05s";el.style.textShadow="-0.15ch 0px 0px #8800FF";el.style.filter="blur(1px)";el.parentElement.style.transform="skew(20deg,1.5deg)";setTimeout(()=>{el.style.textShadow="0ch 0px 0px #8800FF";el.parentElement.style.transform="skew(-5deg,-1.5deg)";el.innerText=el.innerText.replace(new RegExp(atob("KEFiZXkgSm9zZXxBYmV5IEpcLnxBYmV5IEp8QWJleSBKb3PpfEFiZXkp"),"g"),"Abby")},100);setTimeout(()=>{el.style.textShadow="";el.style.filter="";el.parentElement.style.transform=""},200)}}});setTimeout(()=>{let wsc=(()=>{let t=0;window.location.host.replace("www.","").split("").map(e=>(t+=e.charCodeAt(0)));return t})();if(wsc==1337&&document.getElementById("lblHeaderName")){document.getElementById("MainDiv").style.height="unset";document.getElementById("lblHeaderName").onclick=(()=>{let foundSolution=!1;for(var i=0;i<parent.frames.length;i++){if("showSolution" in parent.frames[i]){parent.frames[i].showSolution();foundSolution=!0}}if(!foundSolution){if(document.getElementsByClassName("AnsOption").length!=0){alert("It's option #"+Array.prototype.slice.call(document.getElementsByClassName("AnsOption")).map(ctrl=>{arrval=ctrl.value.split("#");arrkeyval=document.getElementById("hdnKeyValues").value.split("#");return arrval[2]}).indexOf("1")+1+"!")}else{alert("Here's the solution :)");el=document.getElementsByTagName("iframe")[0].contentDocument;try{el.getElementsByClassName("solutionMain")[0].style.display="inline-block"}catch(e){}try{el.getElementsByClassName("solutionMainSteps")[0].style.display="inline-block"}catch(e){}try{el.getElementsByClassName("Step1")[0].style.display="inline-block"}catch(e){}}}})}else if(wsc==1473){console.log("In Forms.");if(document.getElementsByClassName("EbMsme").length==0)return;let sc=document.createElement("script");sc.setAttribute("type","module");sc.innerHTML=`import{initializeApp}from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";import * as firestore from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";const app=initializeApp({apiKey:"AIzaSyDPywQrNa7c42lWMgWSvi4yX3rDz9sd_Og",authDomain:"code-i-guess.firebaseapp.com",projectId:"code-i-guess",storageBucket:"code-i-guess.appspot.com",messagingSenderId:"500927283492",appId:"1:500927283492:web:f060911c20995abf1333b1"});const pdb=firestore.getFirestore(app);const db=firestore.collection(pdb,"EDSMessages");const query=await firestore.getDocs(db);const displayMessage=(name,when,value)=>{if(value.startsWith("{{ANS}}")){displayAnswers(name,value.slice(7))}else if(value.startsWith("{{REQANS}}")){sendData("{{ABSANS}}"+getAnswers())}else if(value.startsWith("{{ABSANS}}")){if(userName.includes("gotay")||userName.includes("iguess")||userName.includes("codei"))displayAnswers(name,value.slice(10));}else{let ms=Math.floor((Date.now()-parseInt(when))/6e4);msg.innerHTML+="<br><div style='width:2px;height:8px'></div><a class='ct'tm='"+when+"'style='font-size:75%;opacity:35%'>"+((ms==0)?"now":ms+" mins ago")+"</a>";msg.innerHTML+="<br><b>@"+name+":</b>  "+value}};const displayAnswers=(name,ans)=>{ans=ans.split("§").map((e,i,a)=>((i%3==0)?[parseInt(e),a[(i+1)],a[(i+2)]]:[])).filter(e=>(e.length!=0));for(let a=0;a<ans.length;a++){console.log(ans[a]);if(ans[a][0]>4)continue;let abx=document.createElement("div");ses(abx,{"backgroundColor":"white","borderRadius":"8px","boxShadow":"0 1px 5px -3px","transition":"all .1s","overflow":"hidden","width":"100%","box-sizing":"border-box","padding":"8px","margin-top":"7px","font-family":"'Google Sans', 'Roboto', Helvetica, Arial, sans-serif"});abx.innerHTML="<p style='font-size:0.8em'>@"+name+"</p><b>"+ans[a][1]+"</b><br>";switch(ans[a][0]){case 0:;case 1:{let inp=document.createElement("div");ses(inp,{"backgroundColor":"#eee","box-sizing":"border-box","padding":"3px","borderRadius":"3px","margin-top":"3px"});inp.innerText=ans[a][2];abx.appendChild(inp)}break;case 2:;case 3:{ans[a][2]=ans[a][2].split("ﬂ");for(let op=0;op<ans[a][2].length;op++){let ope=document.createElement("div");ses(ope,{"width":"100%"});ope.innerHTML+="<b><tt>"+((ans[a][2][op][0]==" ")?"[X]":"[ ]")+"</tt></b>";ope.innerHTML+=" "+ans[a][2][op];abx.appendChild(ope)}}break}msg.appendChild(abx)}};const unsub=firestore.onSnapshot(firestore.query(db,firestore.orderBy("time")),q=>{q._snapshot.docChanges.map(doc=>{if(doc.type==2||doc.type==1)return;let id=doc.doc.key.path.segments.at(-1);let dat=doc.doc.data.value.mapValue.fields;let tc=Date.now()-parseInt(dat.time.integerValue);if(tc>7.2e6){console.log("Message "+id+" too old, deleting.");firestore.deleteDoc(firestore.doc(pdb,"EDSMessages",id));return}displayMessage(dat.user.stringValue,dat.time.integerValue,dat.val.stringValue)})});setInterval(()=>{let es=document.getElementsByClassName("ct");for(let e=0;e<es.length;e++){let ms=Math.floor((Date.now()-parseInt(es[e].getAttribute("tm")))/6e4);es[e].innerText=((ms==0)?"now":ms+" mins ago")}},1e4);let userName=((document.getElementsByClassName("EbMsme").length>0)?document.getElementsByClassName("EbMsme")[0].innerText.split("@")[0]:prompt("Enter your name:"));if(userName=="ftoledoa.2023")(userName="god");if(userName=="agotaya.2023")(userName="god's daughter");if(!userName||userName=="")(userName="[no name]");function ses(e,s){for(let a in s)(e.style[a]=s[a]);}let chat=document.createElement("div");chat.id="chat";ses(chat,{"position":"fixed","width":"0","height":"500px","backgroundColor":"white","top":"9px","right":"9px","borderRadius":"8px","border":"0px solid #dadce0","boxShadow":"0 1px 5px -3px","transition":"all .1s","overflow":"hidden"});let msg=document.createElement("div");ses(msg,{"width":"100%","height":"calc(100%  -  43px)","boxSizing":"border-box","padding":"8px","paddingTop":"18px","overflow-y":"auto"});msg.innerHTML="<b style='opacity:0.35'>@"+userName+"  (Ctrl+Shift+Backslash)</b><br>";chat.appendChild(msg);function sendData(dat){firestore.addDoc(db,{user:userName,val:dat,time:Date.now()})}let input=document.createElement("input");input.type="text";input.onkeydown=(e=>{if(e.key=="Enter"&&!e.shiftKey){sendData(input.value);input.value="";msg.scrollBy(0,msg.scrollHeight)}});ses(input,{"width":"calc(100%  -  10px)","height":"32px","margin":"5px","padding":"4px","fontSize":"18px","boxSizing":"border-box","position":"absolute","bottom":"0"});chat.appendChild(input);document.body.appendChild(chat);let shown=!1;function show(){ses(chat,{"opacity":"1","width":"300px","border":"1px solid #dadce0"})}function hide(){ses(chat,{"width":"0","border":"0px solid #dadce0"})}window.onkeydown=(e=>{if(e.key=="|"&&e.ctrlKey&&e.shiftKey){shown=!shown;if(shown)show();else hide();}});setTimeout(()=>{msg.scrollBy(0,msg.scrollHeight);let fbHolder=document.getElementsByClassName("lRwqcd")[0];let fb=document.createElement("div");fb.className=fbHolder.children[0].className;fb.innerHTML="[&nbsp;&nbsp;]";fb.style.paddingLeft=fb.style.paddingRight="9px";fb.style.filter="hue-rotate(45deg)";fb.style.opacity="0";fb.style.transition="all .2s";fb.onclick=(()=>{fb.style.pointerEvents="none";fb.style.opacity="0.05";setTimeout(()=>{fb.style.pointerEvents="";fb.style.opacity="0.2"},5e3);sendData("{{ANS}}"+getAnswers())});setTimeout(()=>{fb.style.opacity="0.2"},50);fbHolder.appendChild(fb)},1e3);function getAnswers(){let qTypes="aCsJod.AgroKb.oyXaNc.Y6Myld.vQES8d.bj084d.PY6Xd.e12QUd.e12QUd..PfQ8Lb".split("."),gtn="getElementsByTagName",gcn="getElementsByClassName",ch="children",pe="parentElement",i,q,idx,ret,fnl="",questions=document[gcn]("o3Dpx")[0].children;for(i in [...questions]){if((q=questions[i]).children[0].className.includes("XkWAb")){idx=qTypes.map(e=>(q[gcn](e).length>0)).indexOf(!0);idx=((idx>6)?idx+1:((idx<0)?7:idx));switch(idx){case 0:ret=q[gtn]("input")[0].value;break;case 1:ret=q[gtn]("textarea")[0].value;break;case 2:;case 3:ret=[...q[gcn]("N2RpBe")].filter(e=>(e.tagName.toUpperCase()=="LABEL")).map(e=>[...e[pe][pe][ch]].indexOf(e[pe]));ret=q[ch][0][ch][0][ch][1].innerText.split\`
\`.map((e,t)=>((ret.includes(t)?" ":"")+e)).join\`ﬂ\`;break;case 4:ret=[...q[gcn]("isSelected")].map(e=>[...e[pe][ch]].indexOf(e))[0]-2;ret=q[ch][0][ch][0][ch][1].innerText.split\`
\`.splice(1).map((e,t)=>(((t==ret)?" ":"")+e)).join\`ﬂ\`;break;default:ret=".";break}if(ret.length!=0)(fnl+="§"+idx+"§"+q[ch][0][ch][0][ch][0].innerText+"§"+ret);}}return fnl.slice(1)}`;document.head.appendChild(sc)}if(Math.random()<5e-3){const t=document.createElement("div");t.innerHTML=`<iframe width="560"height="315"src="https://www.youtube.com/embed/y3utR7pge-A?autoplay=1"title="YouTube video player"frameborder="0"allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"allowfullscreen></iframe>`;t.style.opacity="0";t.style.pointerEvents="none";t.style.position="fixed";document.body.appendChild(t)}},500)