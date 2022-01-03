
out = ""
code = "5 .a"

i, s, e = 0, 0, ""
l, c, n = "", "", ""

function ist(n) return n == " " or n == "\n" end

code = " " .. code
while 1 do
	i = i + 1
	if i > #code then
		break
	end
	l = code:sub(i - 1, i - 1)
	c = code:sub(i, i)
	n = code:sub(i + 1, i + 1)
	-- print(s, l, c, n)

	-- Change state
	if s == 0 and string.find("0123456789-", c) then s = 1 end

	-- Execute state
	if s == 1 then
		e = e .. c
		if ist(n) then
			out = out .. "-- Push " .. e .. " to stack"
			s = -1
		end
	end

	-- Reset state
	if s == -1 then
		e = ""
		s = 0
	end
end
-- print("Done.")
print(out)
