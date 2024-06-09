
/** A workspace */
export interface BlocklyWorkspace {
  /** The type block */
  typeBlock_: TypeBlock

  /** Gets the top blocks from the workspace */
  getTopBlocks(): BlocklyBlock[]
}

type Coordinate = { x: number, y: number }

/** A single block */
export interface BlocklyBlock {
  parentBlock_: BlocklyBlock | undefined
  
  /** Selects this block */
  select: () => void

  /** Unselects this block */
  unselect: () => void

  /** Gets this block's parent (if any) */
  getParent: () => BlocklyBlock | undefined

  /** Moves this block */
  moveBy: (x: number, y: number) => void

  /** Updates the block's display (SVG) */
  updateShape_: () => void

  /** Appends an input to this block */
  appendValueInput: (inputName: string) => void

  /** How many inputs this block has. Used along with `appendValueInput` */
  itemCount_: number

  /** Gets the bounding rectangle of this block's display node */
  getBoundingRectangle: () => {
    topLeft: Coordinate
    bottomRight: Coordinate
  }

  /** Sets a value in a field */
  setFieldValue: (value: string, fieldName: string) => void

  arguments_ 
}


/** The block that you type into. */
export interface TypeBlock {
  /** Shows the type block (and activates it) */
  show: () => void

  /** The text currently inside the type block */
  inputText_: HTMLInputElement

  currentListener_: {
    /** Makes the type block acknowledge its new `inputText_` */
    listener: () => void
  }
}

declare global {
  interface Window { alreadyLoaded: boolean; }
  const Blockly: {
    selected: BlocklyBlock;
    allWorkspaces: Record<string, BlocklyWorkspace>;
  };
}
