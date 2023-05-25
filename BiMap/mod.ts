
/** A bi-directional map object */
export class BiMap<F, T> {
    private arrFrom: Array<F> = []
    private arrTo: Array<T> = []

    constructor(
        startingObject?:
            F extends string | number | symbol
                ? Record<F, T>
                : never
    ) {
        if (!startingObject) return

        // Copy the entries from the starting object into `arrFrom` and `arrTo`
        const entries = Object.entries(startingObject)
        for (const e of entries) {
            this.set(e[0] as F, e[1] as T)
        }
    }

    /**
     * Sets a value in the map
     * @param from The "key"
     * @param to The "value"
     * @returns [0] nothing was overwritten, [1] the value was overwritten, [2] the key was overwritten
     */
    set(from: F, to: T): number {
        // If the key already exists, set its value
        const indexFrom = this.arrFrom.indexOf(from)
        if (indexFrom != -1) {
            this.arrTo[indexFrom] = to
            return 1
        }

        // If the value already exists, set its key
        const indexTo = this.arrTo.indexOf(to)
        if (indexTo != -1) {
            this.arrFrom[indexTo] = from
            return 2
        }

        // If both are new, add both to their respective arrays
        this.arrFrom.push(from)
        this.arrTo.push(to)
        return 0
    }

    get(obj: T | F): F | T | undefined {
        // If the object is in `arrFrom`, get its opposite in `arrTo`
        const indexFrom = this.arrFrom.indexOf(obj as F)
        if (indexFrom != -1) {
            return this.arrTo[indexFrom]
        }

        // If the object is in `arrTo`, get its opposite in `arrFrom`
        const indexTo = this.arrTo.indexOf(obj as T)
        if (indexTo != -1) {
            return this.arrFrom[indexTo]
        }

        // This object doesn't exist (within our arrays)
    }
}
