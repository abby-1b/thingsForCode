# Directives

Directives are the way that the language converts tokens into an AST (abstract syntax tree). Basically, they're an object structure that stores pseudo-instructions that are ran at compile time to determine the structure of the AST, and how different sets of tokens are compiled into this more organized form.

Each directive has two required and one optional stage:
 - `start`: Indicates the tokens that will be matched by this directive. The tokens indicated in here aren't full tokens, and can be written using just the token's data `token.t`, just its type `token.type`, or both. The matched tokens are put in an array that is accessible through the ScaffoldingFunctions later on.
 - `do` (optional): States some functions that should be ran before moving on to the output stage. These are called `ScaffoldingFunction`, and are ran by the compiler. The output of these functions is added to the array of matched 'things' specified above.
 - `out`: The actual object that will be outputted. This object is a type of scaffolding, meaning that before it's actually outputted, any `ScaffoldingFunction` inside of it will be ran and replaced with their own output.

Here are the ScaffoldingFunctions:
 - `getTree`: Gets a whole `TreeNode` array
 - `getTreeSingle`: Gets a single `TreeNode` element
 - `getThing`: Gets a 'thing' at arg[0] from the matched list
 - `getThings`: Gets 'things' starting at arg[0], up until arg[1] from the matched list. If arg[1] is not passed, it gets everything starting at arg[0].
 - `getData`: Gets a thing from the matched list at arg[0], then gets the property at arg[1]
 - `ignoreTokens`: Ignores an amount of tokens specified by arg[0] (defaults to 1 if no argument is passed). Returns nothing.
