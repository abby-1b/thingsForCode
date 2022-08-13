on_lambda = 0
fns = ["print"]

def one_line(code):
	if not isinstance(code, list): code = [a.split(" ") for a in code.split("\n") if a != ""]
	if len(code) == 0: return "0"
	if code[0][1] == "=":
		return f"(lambda {code[0][0]}: [{code[0][0]} := {' '.join(code[0][2:])}, " + one_line(code[1:]) + f"])(0)"
	return f"[{' '.join(code[0])}, {one_line(code[1:])}]"

code = one_line("""
b = 15 + 15
a = 10 + 10
c = a + b
print(a, b, c)
""")

print(code)
exec(code)