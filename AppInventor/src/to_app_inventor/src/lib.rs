use wasm_bindgen::prelude::*;

// /// Compiles a TypeScript source to AppInventor "bytecode"
// #[wasm_bindgen]
// pub fn compile_to_blocks() -> String {
//     "Hello, World! It works!".to_string()
// }

#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}
