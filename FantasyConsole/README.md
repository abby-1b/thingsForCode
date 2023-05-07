# What

While in my never-ending search for software that 'runs on everything', I realized that PICO-8 is a very good example of re-usable software. Games can be written on it using any platform that it runs on... which, since it runs in the browser, is _a lot of them_.

Point is, having a layer of abstraction between the code that you run and the code that's running it makes it so that you just need to rewrite this small abstraction anywhere you want your code to run, and everything that's built on top of that _will run_!

# How

<!-- I'm basically bootstrapping It's a simple process:

1. Make a bytecode standard. This is what everything will be built on top of.
2. Make a simple language that compiles to this bytecode.
3. Write a compiler from the simple language  -->
