code = "0 @a (5 6 =) ? (69 ~a) : (34.5 ~a) a 2 * ~a #p(a,a)" --  #p(a,a)
-- code = "0 @a (5 6 =) 1"

out = "stack={}"
indent = 0
controlTree = {}
inParen = 0
i, s, e = 0, 0, ""
l, c, n = "", "", ""

BLOCK_RUN = -1
IF_RUN = 0
ELSE_RUN = 1
CALL_ARGS = 2

keywords = {"SPACE", "COMMENT", "NUMBER", "VAR_INIT", "VAR_SET", "VAR_GET", "STRING_1", "STRING_2", "OPERATOR", "PAREN_S", "PAREN_E", "IF", "ELSE", "CALL"}
for _ = 1, #keywords do load(keywords[_] .. "=" .. _)() end

function makeLS()
	-- lineStr = " "
	lineStr = "\n" .. string.rep("\t", indent) -- .. (#controlTree) .. ": "
end

code = " " .. code .. " "
while 1 do
	if s == -1 then
		-- Reset state
		e = ""
		s = 0
	elseif s == 0 and c ~= "" then
		-- Character not recognized
		print("[?]: `" .. c .. "`")
	end

	-- Setup strings (indentation, last, current, next)
	makeLS()
	i = i + 1
	if i > #code + 1 then
		break
	end
	l = code:sub(i - 1, i - 1)
	c = code:sub(i, i)
	n = code:sub(i + 1, i + 1)
	-- print(l, c, n)

	-- STATES

	-- Sapce
	if s == 0 and c == ' ' then s = -1 end

	-- Comment
	if s == 0 and c == '/' and n == '/' then s = COMMENT end
	if s == COMMENT then
		if c == '\n' then
			s = -1
		end
	end

	-- Number
	if s == 0 and (tonumber(c, 10) ~= nil or (c == '-' and tonumber(n, 10) ~= nil) or c == '.') then s = NUMBER end
	if s == NUMBER then
		e = e .. c
		if string.find("0123456789.", n, 1, true) == nil or (n == '.' and string.find(e, '.', 1, true)) then
			if e == '.' then e = 0 end
			out = out .. lineStr .. "table.insert(stack," .. e .. ")"
			s = -1
		end
	end

	-- Variable Initalization
	if s == 0 and c == '@' then s = VAR_INIT end
	if s == VAR_INIT then
		if c ~= '@' then e = e .. c end
		if string.find("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_", n, 1, true) == nil then
			out = out .. lineStr .. "local " .. e .. "=table.remove(stack)"
			s = -1
		end
	end

	-- Variable setting
	if s == 0 and c == '~' then s = VAR_SET end
	if s == VAR_SET then
		if c ~= '~' then e = e .. c end
		if string.find("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_", n, 1, true) == nil then
			out = out .. lineStr .. e .. "=table.remove(stack)"
			s = -1
		end
	end

	-- String with single quotes
	if s == 0 and c == "'" then s = STRING_1 end
	if s == STRING_1 then
		e = e .. c
		if c == "'" and l ~= '\\' and #e > 1 then
			out = out .. lineStr .. "table.insert(stack, " .. e .. ")"
			s = -1
		end
	end

	-- String with double quotes
	if s == 0 and c == '"' then s = STRING_2 end
	if s == STRING_2 then
		e = e .. c
		if c == '"' and l ~= '\\' and #e > 1 then
			out = out .. lineStr .. "table.insert(stack, " .. e .. ")"
			s = -1
		end
	end

	-- Variable getting
	if s == 0 and string.find("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_", c, 1, true) then s = VAR_GET end
	if s == VAR_GET then
		e = e .. c
		if string.find("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_", n, 1, true) == nil then
			out = out .. lineStr .. "table.insert(stack, " .. e .. ")"
			s = -1
		end
	end

	-- Operators
	if s == 0 and string.find("+-*/=!&|%", c, 1, true) then s = OPERATOR end
	if s == OPERATOR then
		op = c
		if op == '=' then op = "==" end
		if op == '!' then op = "~=" end
		-- out = out .. lineStr .. "_t=stack[#stack]" .. op .. "stack[#stack-1]table.remove(stack)stack[#stack]=_t"
		out = out .. lineStr .. "_t=table.remove(stack)" .. op .. "stack[#stack]stack[#stack]=_t"
		s = -1
	end

	-- Open parenthesis
	if s == 0 and c == '(' then s = PAREN_S end
	if s == PAREN_S then
		if controlTree[#controlTree] == IF_RUN then
			out = out .. lineStr .. "if table.remove(stack) then"
			indent = indent + 1
		elseif controlTree[#controlTree] == ELSE_RUN then
			out = out:sub(1, #out - (3 + #lineStr))
			out = out .. lineStr .. "else"
			indent = indent + 1
		elseif controlTree[#controlTree] == CALL_ARGS then
			out = out .. "("
			indent = indent + 1
		else
			table.insert(controlTree, BLOCK_RUN)
			out = out .. lineStr .. "if 1 then"
			indent = indent + 1
		end
		s = -1
	end

	-- Close parenthesis
	if s == 0 and c == ')' then s = PAREN_E end
	if s == PAREN_E then
		indent = indent - 1
		makeLS()
		if controlTree[#controlTree] == CALL_ARGS then
			out = out .. lineStr .. ")"
		else
			out = out .. lineStr .. "end"
		end
		table.remove(controlTree)
		s = -1
	end

	-- If statement
	if s == 0 and c == '?' then s = IF end
	if s == IF then
		table.insert(controlTree, IF_RUN)
		s = -1
	end

	-- Else statement
	if s == 0 and c == ':' then s = ELSE end
	if s == ELSE then
		table.insert(controlTree, ELSE_RUN)
		s = -1
	end

	-- Call function
	if s == 0 and c == '#' then s = CALL end
	if s == CALL then
		if c ~= '#' then e = e .. c end
		if string.find("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_", n, 1, true) == nil then
			table.insert(controlTree, CALL_ARGS)
			out = out .. lineStr .. e
			s = -1
		end
	end
end
print(out .. "\n")
load(out)()
