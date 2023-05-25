import { assertEquals } from "https://deno.land/std@0.188.0/testing/asserts.ts"
import { BiMap } from "./mod.ts"

Deno.test("`set` test", () => {
    const m: BiMap<string, number> = new BiMap()
    m.set("a", 123)

    // Illegally access the private arrays! (just for testing)
    assertEquals((m as any).arrFrom[0], "a")
    assertEquals((m as any).arrTo[0], 123)
})

Deno.test("`get` test", () => {
    const m: BiMap<string, number> = new BiMap()
    m.set("a", 123)

    // Illegally access the private arrays! (just for testing)
    assertEquals(m.get("a"), 123)
})

Deno.test("`get` test (reverse)", () => {
    const m: BiMap<string, number> = new BiMap()
    m.set("a", 123)

    // Illegally access the private arrays! (just for testing)
    assertEquals(m.get(123), "a")
})

Deno.test("`startingObject` test", () => {
    const m: BiMap<string, number> = new BiMap({
        a: 123, b: 456, c: 789
    })
    assertEquals(m.get("a"), 123)
    assertEquals(m.get("b"), 456)
    assertEquals(m.get("c"), 789)
})

Deno.test("`startingObject` test (reverse)", () => {
    const m: BiMap<string, number> = new BiMap({
        a: 123, b: 456, c: 789
    })
    assertEquals(123, m.get("a"))
    assertEquals(456, m.get("b"))
    assertEquals(789, m.get("c"))
})

Deno.test("`startingObject` test (empty)", () => {
    const m: BiMap<string, number> = new BiMap({})
    assertEquals(m.get("a"), undefined)
})
