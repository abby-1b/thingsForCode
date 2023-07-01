import { logErrorSimple } from "./errors.ts"
import { DeclType } from "./treeifier.ts";

/** The type sizes, in bytes */
const typeSizes: Record<string, number> = {
    "u8": 1, "i8": 1,
    "u16": 2, "i16": 2,
    "u32": 4, "i32": 4,
    "u64": 8, "i64": 8,
    // TODO: implement more type sizes
}

/** Gets the size of a type, in bytes */
export function getTypeSize(type: DeclType): number {
	if (type.length == 1) {
		// Get the size without arguments
		if (type[0] in typeSizes) {
            return typeSizes[type[0]]
        } else {
            throw logErrorSimple(`Type ${type[0]} not recognized.`)
        }
	} else {
		// Get the size with arguments
		throw logErrorSimple("TODO: implement type arguments!")
	}
}
