(module
	(import "import_fns" "console_log" (func $FN_console_log (param f32 f32)))
	(func $main
		(local $a f32)
		(local $b f32)
		(local $c f32)
		(local $i f32)
		f32.const 0
		local.set $a
		f32.const 1
		local.set $b
		(block
			local.get $a
			local.get $b
			f32.add
			local.set $c
			local.get $b
			local.set $a
			local.get $c
			local.set $b
			(block (result f32)
				local.get $i
			)
			(block (result f32)
				local.get $c
			)
			call $FN_console_log
		)
		f32.const 10
		local.set $i
	)
	(export "main" (func $main))
)