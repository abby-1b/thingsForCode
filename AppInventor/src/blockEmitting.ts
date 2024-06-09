import { Blockly, BlocklyBlock, BlocklyWorkspace } from './types';

const savedSelect: BlocklyBlock[] = [];
let blockOffset = 0;

/**
 * Runs an instruction through the type block.
 * Think of this as emitting a single `bytecode` instruction.
 */
export function emitInstruction(
  instruction: string,
  workspace: BlocklyWorkspace
) {
  if (instruction[0] == '_') { // Deselect everything
    const r = selectedTop().getBoundingRectangle();
    blockOffset += r.bottomRight.y - r.topLeft.y;
    Blockly.selected.unselect();
  } else if (instruction[0] == '~') {
    // Select parent
    Blockly.selected.getParent()?.select();
  } else if (instruction[0] == '.') {
    // Setting values
    if (instruction[1] == 'v') {
      // Sets a value
      getSelected().setFieldValue(instruction.slice(2), 'NAME');
    } else if (instruction[1] == 'n') {
      // Sets the name field of a block
      getSelected().setFieldValue(instruction.slice(2), 'VAR0');
    } else if (instruction[1] == 'f') {
      // Sets the name field of a for block
      getSelected().setFieldValue(instruction.slice(2), 'VAR');
    } else if (instruction[1] == 's') {
      // Saves the current selected block
      savedSelect.push(getSelected());
    } else if (instruction[1] == 'l' && savedSelect.length > 0) {
      // Loads the last selected block
      savedSelect.pop()?.select();
    } else if (instruction[1] == 'a') {
      // I don't know what this does!
      // getSelected().arguments_.push(t.slice(2));
      // getSelected().updateParams_();
    } else if (instruction[1] == 'e') {
      // Makes an empty list of a certain length
      emitInstruction('create empty list', workspace);
      const to = parseInt(instruction.slice(2));
      for (let i = 0; i < to; i++) {
        getSelected().appendValueInput('ADD' + i);
        getSelected().itemCount_++;
      }
    } else if (instruction[1] == 'k') {
      // Makes an empty dictionary of a length
      emitInstruction('create empty dictionary', workspace);
      const to = parseInt(instruction.slice(2));
      for (let i = 0; i < to; i++) {
        getSelected().appendValueInput('ADD' + i);
        getSelected().itemCount_++;
      }
    } else if (instruction[1] == 'i') {
      // Adds an else or elseif
      getSelected()[instruction[2] == 'e' ? 'elseCount_' : 'elseifCount_']++,
      getSelected().updateShape_();
    }
  } else {
    const wasntSelected = !getSelected();
    workspace.typeBlock_.show();
    workspace.typeBlock_.inputText_.value = instruction;
    workspace.typeBlock_.currentListener_.listener();

    // Hide the type block dropdown
    const dropdown = document.querySelector(
      '.ac-renderer'
    ) as HTMLElement | undefined;
    if (dropdown) {
      dropdown.style.display = 'none';
    }

    // Move the selected block (to avoid overlaps)
    if (wasntSelected) {
      getSelected().moveBy(0, blockOffset);
    }
  }
}

/** Gets the selected block's top parent */
function selectedTop(): BlocklyBlock {
  let k = getSelected();
  while (k.parentBlock_) k = k.parentBlock_;
  return k;
}

/** Gets the currently selected block */
function getSelected(): BlocklyBlock {
  return Blockly.selected;
}
