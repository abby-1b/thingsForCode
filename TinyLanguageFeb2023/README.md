
# The Stack™
This language uses a stack for all its operations. This stack holds values with their corresponding type as objects.

# Numbers
Writing out a number adds it to the stack.
```
123
```

# Chars and Strings

### Chars
The `'` operator pushes a `CHR` (proceeding it) to the stack.
```
'H
```

### Strings
The `"` operator pushes a `STR` to the stack.
```
"Hello, World!"
```

# Arrays
I'll be honest, arrays are handled weirdly. They're completely dynamic, can grow and shrink, and can be left open without any errors.

The `[` operator starts an array, while the `]` operator closes it. When an array is closed, every value on the stackfrom when it was started to when it was ended is put into this array. Right after the closing operator, a single token (of type `ARR`) was added to the stack, which holds all of the array's elements.

# Math
An operator is ran immediately after its placed, taking the two values atop the stack and adding a single value back.

The `+` operator takes two values off the stack and adds them together. Here is a table of the resulting type of the operation after adding together two different types.

|     |`NUM`|`STR`|`CHR`|
|-----|-----|-----|-----|
|`NUM`| NUM | STR | CHR |
|`STR`| STR | STR | STR |
|`CHR`| CHR | STR | STR |

The `-` operator subtracts two values. Here's a table of the resulting types, with the top row being the first operand (A), and the left column being the second (B).

|     |`NUM`|`STR`|`CHR`|
|-----|-----|-----|-----|
|`NUM`| NUM | STR | CHR |
|`STR`| ERR | STR | ERR |
|`CHR`| NUM | STR | CHR |

And here are their special operations:
|     |`NUM`|`STR`|`CHR`|
|-----|-----|-----|-----|
|`NUM`| A - B | Takes off B characters from the end of the string A | Returns the character A offset by the number B |
|`STR`| [None] | Removes every character present in the B string from the A string | [None] |
|`CHR`| Takes off the character's value B from the number A | Removes every occurrance of character B from string A | Takes off the character's value B from the character's value A |

The `*` operator multiplies two values.

|     |`NUM`|`STR`|`CHR`|
|-----|-----|-----|-----|
|`NUM`| NUM | STR | STR |
|`STR`| STR | ERR | ERR |
|`CHR`| STR | ERR | NUM |

_<sup>[TODO: add special table]</sup>_

The `/` operator divides two values.

|     |`NUM`|`STR`|`CHR`|
|-----|-----|-----|-----|
|`NUM`| NUM | ERR | NUM |
|`STR`| ERR | ERR | ERR |
|`CHR`| NUM | ERR | NUM |

_<sup>[TODO: add special table]</sup>_

# Miscellaneous operators
 - `:` duplicates the value atop the stack

