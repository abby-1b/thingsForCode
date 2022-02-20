(module
	(import "import_fns" "console_log" (func $FN_console_log (param f32)))
	(func $main
		f32.const 3
		f32.const 5
		call $FN_sum
		f32.const 10
		f32.eq
		(if
			(then
				f32.const 80085
				call $FN_console_log
			)
			(else
				f32.const 12345
				call $FN_console_log
			)
		)
	)
	(func $FN_sum (param $a f32) (param $b f32) (result f32)
		local.get $a
		local.get $b
		f32.add
	)
	(export "main" (func $main))
)