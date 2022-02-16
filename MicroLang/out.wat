(module
  (import "import_fns" "console_log" (func $FN_console_log (param f32)))
  (func $main
    f32.const 5
    call $FN_console_log
    f32.const 10
    call $FN_console_log
  )
  (export "main" (func $main))
)