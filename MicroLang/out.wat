(module
  (import "import_fns" "yeet" (func $FN_yeet (param f32)))
  (func $main
    (local $a f32)
    f32.const 5
    local.set $a
    (block (result i32)
      f32.const 5
      local.get $a
      f32.eq
    )
    (if
      (then
        (block (result f32)
          local.get $a
        )
        call $FN_yeet
      )
    )
  )
  (export "main" (func $main))
)