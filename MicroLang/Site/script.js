var memory = new WebAssembly.Memory({initial:1})
let wasm = null

function yeet(...args) {
    console.log(args)
}

function logStr(n) {
    let ret = "", intArr = [], o = -1
    n -= 16
    while (intArr[++o] != 0) {
        if (o == intArr.length) {
            o = 0
            n += 16
            intArr = new Int8Array(memory.buffer, n, 16)
        }
        ret += String.fromCharCode(intArr[o])
    }
    console.log(ret)
}
WebAssembly.instantiateStreaming(fetch('simple.wasm'), {
    import_fns: new Proxy({}, { get(target, name) {
        return (...args) => { (1, eval)(name.split("_").join(".") + "(" + args + ")") }
    } })
}).then(ret => {
    console.log(ret)
    wasm = ret.instance.exports
    console.log(wasm.main())
})