
/*
# Why?

As with creating any new programming language, a fundamental question must be
asked: why? What's the need for another new programming language?

The point of this is to have a language that isn't fast on its own, but is very
fast to _write_. This implies many typing optimizations (like shortening `if`s
and `let`s to single characters with no spaces.)

# Quirks

Think of this as something like TypeScript or Rust (yes, I just angered
3/4 of the programming community by comparing these two languages.)

Spaces are very important in this language. A space after a special operator
signifies an opening bracket, while a space after a non-special operator
signifies a closing bracket. 

`let a = 0` => `#a:0`
`if (a == b) { ... }` => `?a=b ...`
`print(a)` => `.a`

*/




const program = "#i=0 .?i=0 i  :i=1 i+1  : i"
/*
Compiles to:
	let i = 0
	if (i == 0) {
		console.log(i)
	} else if (i == 1) {
		console.log(i + 1)
	}
*/
