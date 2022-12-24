
// This is a circular stack!
// Its purpose is to be expanded from the back or front while keeping a fixed size (for efficiency)
// It has no guards to protect against popping/shifting from an empty array, or even writing more
// values than what it can hold. 

// Stopped testing this because of `testGrowBack.ts`

const els = 10
const stack = new Array(els).fill(0) as number[]

let idx = 0, cnt = 0

const mod = (n: number, m: number) => { return ((n % m) + m) % m }

export const push = (v: number) => { idx = mod(idx + 1, els), stack[idx] = v, cnt++ }
export const pop = (): number => { const ret = stack[idx]; cnt--, idx = mod(idx - 1, els); return ret }

export const unshift = (v: number) => { stack[mod(idx - cnt++, els)] = v }
export const shift = (): number => { return stack[mod(idx - --cnt, els)] }
