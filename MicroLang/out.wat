(module
  (func $main (result f32)
    (local $a f32)
    f32.const 5
    local.set $a
    f32.const 5
    local.get $a
    f32.eq
    (if (result f32)
      (then
        f32.const 69
      )
      (else
        f32.const 69
      )
    )
  )
  (export "main" (func $main))
)