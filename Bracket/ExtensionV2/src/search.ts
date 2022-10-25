
class Search {
	static box: HTMLDivElement

	static isInitialized = false
	static isShowing = false

	static prepare() {
		window.addEventListener("keydown", (e) => {
			if (e.key != "}" || !e.ctrlKey || !e.shiftKey) return
			this.toggle()
		})
	}

	static initialize() {
		this.box = document.createElement("div")
		this.box.id = "bSearchBox"
		ses(this.box, {
			"display": "grid", "position": "fixed", "width": "0", "height": "500px", "backgroundColor": "#fffb",
			"top": "9px", "right": "9px", "borderRadius": "8px",
			"border": "0px solid #dadce0", "boxShadow": "0 1px 5px -3px",
			"transition": "all .2s", "overflow": "hidden", "zIndex": "999999",
			"fontSize": "14px", "backdropFilter": "blur(8px)", "color": "#222",
			"grid-template-rows": "30px 1fr"
		})

		window.addEventListener("mousemove", e => {
			let w = parseInt(getComputedStyle(this.box).width.slice(0, -2))
			this.box.style.opacity = e.clientX > (window.innerWidth - w) ? "1" : "0"
		})

		const searchBar = document.createElement("input")
		searchBar.type = "text"
		ses(searchBar, { "padding-left": "8px" })
		searchBar.onkeydown = e => {
			if (e.key == "Enter") {
				iFrame.src = "https://www.google.com/search?q=" + encodeURIComponent(searchBar.value) + "&igu=1"
			}
		}
		this.box.appendChild(searchBar)

		const iFrame = document.createElement("iframe")
		this.box.appendChild(iFrame)

		ses(iFrame, {
			"width": "200%", "height": "200%", "transform": "scale(0.5) translate(-50%,-50%)"
		})

		document.body.appendChild(this.box)
	}

	static show() { ses(this.box, {"opacity": "1", "width": "300px", "border": "1px solid #dadce0"}) }
	static hide() { ses(this.box, {"width": "0", "border": "0px solid #dadce0"}) }
	static toggle() {
		console.log("Toggling search...")
		if (!this.isInitialized) { this.isShowing = true, this.initialize(), this.show(), this.isInitialized = true; return }
		this.isShowing = !this.isShowing
		this.isShowing ? this.show() : this.hide()
	}
}
