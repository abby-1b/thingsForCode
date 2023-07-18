
Comments use `#` because it's shorter than the standard `//`, however both
work exactly the same, so it's up to the developer to choose.
```
# This is a comment!
// So is this!
```

(Note: `/* ... */` is also supported)
```
# This is *also* a comment!
```

Spaces in [LANGUAGE NAME] are used for line separation, but also (rarely) for
code cleanliness, as you'll see in the following examples...


# Variables

The following sets up a variable
```
i32 varName=123
```

If the type can be inferred, use `$`
```
$varName=123
```

Integers use i32 by default, while floats use f32

Note that you can't do something like `$varName = 123`, as that would spread
the declaration across three lines, making is unusable.

When a variable is already declared, you can do the following to change its
value, just like in any other language
```
varName=456
```

We also allow `+=`, `-=`, and all the other operator-equals pairs
```
varName*=123
```

Though keep in mind that after any operator-equals operation, the result is
cast to the variable's type. This means that multiplying an i32 by an f32 will
work, but the result will be cast back to i32 before setting the variable

# If statements

This one's pretty nice, it just takes a condition, then a code block. Simple!
```
?condition{ ... }
```

Keep in mind that the ellipsis (`...`), when used alone is used as a no-op, and
adds no code to the result

# Loops

Similar to if statements, while loops take a condition and a code block, but
are started by the `@` symbol.
```
@condition{ ... }
```

In for loops, the same `@` symbol is used, however three tokens are passed
instead of two. The first is the looping variable's name, then its range,
and finally a code block
```
@a 10{ ... }
```

Sometimes, you don't want a variable, and just want to repeat something a
certain amount of times. For that, just define the for loop as the following
```
@..10{ ... }
```

Note that the above example requires that two dots be added to make this an
iterator, as otherwise it would be interpreted as a while loop.

Although this takes two tokens, just like the while loop, the token proceeding
the `@` is an iterator (or a range), it's assumed to be a for loop

# Logging

To print, use a single `.`
```
.("Hello, World!")
```

To log a warning, use `!`
```
!("Too much language compactness!")
```

# Finally!

Now that we have a decent understanding of the basic language features, let's
make something fun... like the fibonacci sequence
```
$a=0
$b=1
@[10]{
	.(a)
	$i=a+b
	a=b
	b=i
}
```

However, there's something we can do to make this even smaller! To start, we
can group up both sets of variable assignments...
```
$a,b=0,1
@[10]{
	.(a)
	a,b=b,a+b
}
```

Ok! Finally, we can put everything in a single line!
```
$a,b=0,1 @[10]{.(a) a,b=b,a+b}
```

Shaving characters off isn't just a novelty, it can make navigating your code
a bit faster! Trust me, it's worth it in the long run.

