(module
  (func $main
    (local $a f32)
    f32.const 5
    local.set $a
    f32.const 5
    local.get $a
    f32.eq
    (if
      (then
        local.get $a
      )
    )
  )
  (export "main" (func $main))
)