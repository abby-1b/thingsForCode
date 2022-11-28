
function fib(n) {
	let a = 0, b = 1
	for (let i = 0; i < n; i++) {
		let tmp = a + b
		a = b, b = tmp
		console.log(a)
	}
	return b
}
function fib(n) { let a = 0, b = 1; for (let i = 0; i < n; i++) { let tmp = a + b; a = b, b = tmp; console.log(a) } return b }
function fib(n){let a=0,b=1;for(let i=0;i<n;i++){let tmp=a+b;a=b,b=tmp;console.log(a)}return b}
console.log(fib(10))
