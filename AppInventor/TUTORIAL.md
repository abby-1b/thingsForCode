
###### Sorry for the messed up highlighting, most of it is just JS highlighting :)

# Normal programming things
These are things that any normal programming language has, nothing special here. You could compile any dynamic language to this and it would probably work.

## Variables
```js
global x = 10
local y = 20

x = 11
y = x - 4
```
You can declare variables once, but you can set them as many times as you want.

```js
x += 4
y *= 10
```
This supports `+=`, `-=`, `*=`, `/=`, `^=` (which is _pow_ and not XOR), `&=`, and `|=`.
These little commodities were hell to implement. Enjoy them.

## Macros
```js
macro a = 5 + 2
```
Macros serve as compile-time constants that stay in the text editor. They're lost when pulling text from the blocks, so be careful!

Macros can't be changed after they're declared.

## If
```py
if (10 < 20) { ... }
elif { ... }
else { ... }
```
Runs code inside a given block if a certain condition is met. Simple.

## For loops
```js
for (num = a to b) { ... }
for (num = a to b step s) { ... }
```
Setting step size isn't necessary, but when pulling code from blocks it will be added by default. Time constraints are like that.

## While loops
```js
while (10 < 20) {
	...
}
```
Runs the code inside a given block while a certain condition is met.

## Lists
```js
global a = [4, 2, 0, 6, 9]
```
Simple arrays.

NOTE: lists indexes in AppInventor block language start at 1. This brought me multiple headaches. Keep that in mind.

# Block language things

Things that the block language does that are also possible in this written representation. I won't even try to explain these.

## When
```js
when (Clock1.Timer) {
	...
}
```

## Set
```js
Slider1.ThumbPosition = 0.4
set(Slider.ThumbPosition, Slider1, 0.4) 
```

## Get
```js
global a = get(Slider.ThumbPosition, Slider1)
```
