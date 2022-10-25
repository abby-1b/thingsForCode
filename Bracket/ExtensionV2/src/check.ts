// Ab replacement
document.addEventListener("mouseover", (e) => {
	let el = e.target as HTMLElement
	if (el.childElementCount == 0) {
		if (el.innerText.includes(atob('QWJleQ=='))) {
			el.style.transition = "all .05s"
			el.parentElement.style.transition = "transform .05s"
			el.style.textShadow = "-0.15ch 0px 0px #8800FF"; el.style.filter = "blur(1px)"; el.parentElement.style.transform = "skew(20deg,1.5deg)"
			setTimeout(() => {
				el.style.textShadow = "0ch 0px 0px #8800FF";el.parentElement.style.transform = "skew(-5deg,-1.5deg)"
				el.innerText = el.innerText.replace(new RegExp(atob('KEFiZXkgSm9zZXxBYmV5IEpcLnxBYmV5IEp8QWJleSBKb3PpfEFiZXkp'), 'g'), "Abby")
			}, 100)
			setTimeout(() => { el.style.textShadow = ""; el.style.filter = ""; el.parentElement.style.transform = "" }, 200)
		}
	}
})

setTimeout(() => {
	let wsc = 0
	window.location.host.replace("www.", "").split('').map(e => wsc += e.charCodeAt(0))

	if (wsc == 1337 && document.getElementById("lblHeaderName")) {
		// Educosoft Fix
		document.getElementById("MainDiv").style.height = "unset"
		document.getElementById("lblHeaderName").onclick = () => {
			let foundSolution = false
			for (var i = 0; i < parent.frames.length; i++) {
				if ("showSolution" in parent.frames[i]) {
					(parent.frames[i] as unknown as any).showSolution()
					foundSolution = true
				}
			}
			if (!foundSolution) {
				if (document.getElementsByClassName("AnsOption").length != 0) {
					alert("It's option #" + (Array.prototype.slice.call(document.getElementsByClassName("AnsOption")).map(function getAnswer(ctrl: HTMLInputElement) {
						arrval = ctrl.value.split("#"), arrkeyval = (document.getElementById("hdnKeyValues") as HTMLInputElement).value.split("#")
						return arrval[2]
					}).indexOf('1') + 1) + '!')
				} else {
					alert("Here's the solution :)")
					const el = document.getElementsByTagName("iframe")[0].contentDocument
					try { (el.getElementsByClassName("solutionMain")[0] as HTMLElement).style.display = "inline-block" } catch(e) {}
					try { (el.getElementsByClassName("solutionMainSteps")[0] as HTMLElement).style.display = "inline-block" } catch(e) {}
					try { (el.getElementsByClassName("Step1")[0] as HTMLElement).style.display = "inline-block" } catch(e) {}
				}
			}
		}
	} else if (wsc == 1473) {
		// Forms Fix
		// console.log("In Forms.")
		// if (document.getElementsByClassName("EbMsme").length == 0) return
		// let sc = document.createElement("script")
		// sc.setAttribute('type', 'module')
		// sc.innerHTML = "@[chat.max.js]@"
		// document.head.appendChild(sc)
	}
	Chat.prepare(wsc)
	Search.prepare()
	Physics.prepare()
}, 500)
