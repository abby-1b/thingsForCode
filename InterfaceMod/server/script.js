const socket = new WebSocket('ws://' + window.location.hostname + ':8081');
let wr = document.getElementById("worldContainer")
let pl = document.getElementById("player")
let icons = document.getElementsByClassName("icon")
pl.pos = {}
let rot = 0;

let lastDimension = ""

socket.addEventListener('message', function (event) {
    dat = JSON.parse("{\"" + event.data + "\"}")
    console.log(dat)
    if ((rot > 180 && dat.yw < 180) || (rot < 180 && dat.yw > 180)) {
        wr.style.transition = "none"
        pl.style.transition = "none"
    } else {
        wr.style.transition = "transform .25s"
        pl.style.transition = "transform .2s"
    }
    rot = dat.yw

    dat = dat.ls.split(",")
    let dimension = dat.splice(1, 1)[0]
    dat = dat.map(e => e.split(":"))
    pl.pos.x = parseFloat(dat[0][0])
    pl.pos.y = parseFloat(dat[0][1])

    wr.style.transform = `rotate(${-rot}deg) translate(-25%, -25%)`
    pl.style.transform = `translate(-50%,-50%) rotate(${rot}deg)`

    if (lastDimension != dimension) {
        lastDimension = dimension
        if (dimension == "ov") { document.getElementById("icons").innerHTML = `<img class="icon village"/><img class="icon temple"/><img class="icon portal"/><img class="icon stronghold"/>` }
        if (dimension == "nt") { document.getElementById("icons").innerHTML = `<img class="icon fortress"/><img class="icon bastion"/><img class="icon portal"/><img class="icon stronghold"/>` }
    }
    for (let i = 1; i < dat.length; i++) {
        let cee = document.getElementsByClassName(dat[i][0].toLowerCase())[0]
        let x = (pl.pos.x - parseFloat(dat[i][1])) * 0.8
        let y = (pl.pos.y - parseFloat(dat[i][2])) * 0.8
        let d = Math.sqrt(x*x + y*y)
        cee.style.left = x + "px"
        cee.style.top = y + "px"
        let b = cee.getBoundingClientRect()
        let f = 0
        while (b.x < 0 || b.y < 0 || b.x > (window.innerWidth) - b.width || b.y > (window.innerHeight) - b.width) {
            x *= 0.92
            y *= 0.92
            f++
            cee.style.left = x + "px"
            cee.style.top = y + "px"
            b = cee.getBoundingClientRect()
        }
        if (d == 0) {
            cee.style.display = "hidden"
        } else {
            d = Math.max(Math.min(d, 500), 180)
            cee.style.transform = `translate(-50%,-50%) rotate(${rot}deg) scale(${200 / d})`
            cee.style.display = ""
        }
    }
})
