
/** Splits a string into tokens */
function tokenize(code: string) {
	const pre = code
		.replace(/\/\/.*\n/g, "\n")
		.replace(/\/\*(.|\n)*?\*\//g, "\n")
		.replace(/\s+/g, " ")
	
	const tokens = pre
		.split(/ |(?<=[^0-9])(?=[^a-zA-Z0-9])|(?<=[0-9])(?=[^.])|(?<=[^a-zA-Z])(?=[a-zA-Z])|(?<=[^a-zA-Z.])(?=[a-zA-Z0-9])/g)
		.filter(t => t.length > 0)

	return tokens
}

interface Tree {
	type: "program"
		| "decl" | "declfn" | "declvar"
	children: Tree[]
	dat?: string
	nam?: string
}

const TYPES = new Set(["void", "float", "int", "vec2", "vec3", "vec4"])

function convert(tokens: string[], tree: Tree = {
	type: "program",
	children: []
}): Tree {
	if (tree.type == "decl") {
		if (tokens[0] == "(") {
			tree.type = "declfn"
			tree.children
		}
		else tree.type = "declvar"
	}

	let i = 0
	while (tokens.length > 0) {
		// Force break
		if (++i > 3) {
			// console.log("Had to force break!")
			break
		}

		if (TYPES.has(tokens[0])) {
			tree.children.push(convert(tokens, {
				type: "decl",
				children: [],
				dat: tokens.shift(),
				nam: tokens.shift()
			}))
			continue
		}

		console.log(tokens[0])
	}
	return tree
}

const c = `
void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
	// Normalized pixel coordinates (from 0 to 1)
	vec2 uv = fragCoord/iResolution.xy;

	// Time varying pixel color
	vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

	// Output to screen
	/*
	This shouldn't be included!
	*/
	fragColor = vec4(col,1.0);
}
`

const tokens = tokenize(c)
const tree = convert(tokens)
console.log(tree)

