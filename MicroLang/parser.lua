
out = [[
stack = {}]]
code = "113 355 / @a"

i, s, e = 0, 0, ""
l, c, n = "", "", ""

function ist(_) return _ == " " or _ == "\n" end

code = " " .. code .. " "
while 1 do
	i = i + 1
	if i > #code + 1 then
		break
	end
	l = code:sub(i - 1, i - 1)
	c = code:sub(i, i)
	n = code:sub(i + 1, i + 1)

	-- Change state
	if s == 0 and c == '/' and n == '/' then s = -2 end
	if s == 0 and (tonumber(c, 10) ~= nil or (c == '-' and tonumber(n, 10) ~= nil) or c == '.') then s = 1 end
	if s == 0 and c == '@' then s = 2 end
	if s == 0 and c == "'" then s = 3 end
	if s == 0 and c == '"' then s = 4 end
	if s == 0 and string.find("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_", c, 1, true) then s = 5 end
	if s == 0 and string.find("+-*/", c, 1, true) then s = 6 end

	print(s, l, c, n)

	-- Execute state
	-- Comments
	if (s == -2) then
		if c == '\n' then
			s = -1
		end
	end

	-- Numbers
	if s == 1 then
		e = e .. c
		if string.find("0123456789.", n, 1, true) == nil or (n == '.' and string.find(e, '.', 1, true)) then
			if e == '.' then e = 0 end
			out = out .. "\ntable.insert(stack, " .. e .. ")"
			s = -1
		end
	end

	-- Initializing Variables
	if s == 2 then
		if c ~= '@' then e = e .. c end
		if ist(n) then
			out = out .. "\n" .. e .. " = stack[#stack] table.remove(stack)"
			s = -1
		end
	end

	-- Strings
	if s == 3 then
		e = e .. c
		if c == "'" and l ~= '\\' and #e > 1 then
			out = out .. "\ntable.insert(stack, " .. e .. ")"
			s = -1
		end
	end
	if s == 4 then
		e = e .. c
		if c == '"' and l ~= '\\' and #e > 1 then
			out = out .. "\ntable.insert(stack, " .. e .. ")"
			s = -1
		end
	end

	-- Getting variables
	if s == 5 then
		e = e .. c
		if string.find("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_", n, 1, true) == nil then
			out = out .. "\ntable.insert(stack, " .. e .. ")"
			s = -1
		end
	end

	-- Math
	if s == 6 then
		out = out .. "\n_t=stack[#stack]" .. c .. "stack[#stack-1]table.remove(stack)stack[#stack] = _t"
		s = -1
	end

	-- Reset state
	if s == -1 then
		e = ""
		s = 0
	end
end
out = out .. "\nprint(a)"
-- print("Done.")
print(out)
load(out)()
