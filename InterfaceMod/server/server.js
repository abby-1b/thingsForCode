const http = require('http')
const fs = require('fs')
const ws = require('ws')

let cli
const wss = new ws.WebSocketServer({ port: 8081 })
wss.on('connection', function connection(ws) { cli = ws })

const hostname = "10.0.0.4"//'localhost'
const port = 100

const server = http.createServer((req, res) => {
    if (req.method == 'POST') {
        var body = ''
        req.on('data', function(data) { body += data })
        req.on('end', function() {
            if (cli) cli.send(body + '')
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end('post received')
        })
    } else {
        res.statusCode = 200
        // res.setHeader('Content-Type', 'text/plain')
        if (req.url == '/') req.url += "index.html"
        if (req.url == '/favicon.ico') req.url = "/icons/portal.png"
        if (req.url.split(".")[1] == "png") {
            res.writeHead(200, {'Content-Type': 'image/png'})
            fs.readFile("server" + req.url, (err, data) => {
                if (err) {
                    console.error(err)
                    return
                }
                res.end(data)
            })
        } else {
            fs.readFile("server" + req.url, 'utf8', (err, data) => {
                if (err) {
                    console.error(err)
                    return
                }
                res.end(data)
            })
        }
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
});
