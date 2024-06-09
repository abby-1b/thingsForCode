import { BlocklyBlock } from './types';

/** Indents a string */
function indent(str: string) {
  return str.split('\n').map((e) => '\t' + e).join('\n');
}

/** Converts a block to text */
export function toText(b: BlocklyBlock) {
  if (!b) return '';
  const ch = b.childBlocks_;
  switch (b.type) {
  case 'math_number':
    return b.inputList[0].fieldRow[0].value_;
  case 'local_declaration_expression':
  case 'local_declaration_statement':
    return `local ${b.localNames_[0]} = ${toText(ch[0])}` +
        (ch.length == 1 ? '' : '\n' + toText(ch[1]));
  case 'global_declaration':
    return `global ${b.getVars()[0]} = ${toText(ch[0])}`;
  case 'controls_while':
  case 'controls_if':
    {
      let ret = `${b.type.split('_')[1]} (${toText(ch[0])}) {\n${
        indent(toText(ch[1]))
      }\n}`;
      let on = 2;
      for (let i = 0; i < b.elseifCount_; i++) {
        ret += ` elif (${toText(ch[on++])}) {\n${
          indent(toText(ch[on++]))
        }\n}`;
      }
      if (b.elseCount_) ret += ` else {\n${indent(toText(ch[on++]))}\n}`;
      console.log(on, ch.length);
      return ret + (ch.length == on ? '' : '\n' + toText(ch[on]));
    }
    break;
  case 'controls_forRange':
    return `for (${b.getVars()[0]} = ${toText(ch[0])} to ${
      toText(ch[1])
    } step ${toText(ch[2])}) {\n${indent(toText(ch[3]))}\n}` +
        (ch.length == 4 ? '' : '\n' + toText(ch[4]));
  case 'controls_eval_but_ignore':
    return '';

  case 'controls_do_then_return':
    return toText(ch[0]) + '\nreturn ' + toText(ch[1]);

  case 'logic_operation':
    return `${toText(ch[0])} ${
      { 'AND': '&&', 'OR': '||' }[b.inputList[1].fieldRow[0].value_]
    } ${toText(ch[1])}`;

  case 'logic_compare':
  case 'math_compare':
    return `${toText(ch[0])} ${
      {
        '=': '==',
        'not=': '!=',
        'lt': '<',
        'lte': '<=',
        'gt': '>',
        'gte': '>=',
      }[b.helpUrl().split('#')[1]]
    } ${toText(ch[1])}`;
  case 'math_add':
  case 'math_subtract':
  case 'math_multiply':
  case 'math_division':
  case 'math_power':
    return '(' + toText(ch[0]) + ' ' +
        {
          'add': '+',
          'subtract': '-',
          'multiply': '*',
          'divide': '%',
          'division': '/',
          'power': '^',
        }[b.type.split('_')[1]] + ' ' + toText(ch[1]) + ')';
  case 'math_random_int':
    return `randi(${toText(ch[0])}, ${toText(ch[1])})`;
  case 'math_random_float':
    return 'rand()';

  case 'lexical_variable_get':
    return b.getVars()[0].split(' ').slice(-1)[0];
  case 'lexical_variable_set':
    if (b.getVars()[0] == '__ret__') {
      return `return ${toText(ch[0])}` +
          (ch.length == 1 ? '' : '\n' + toText(ch[1]));
    }
    return `${b.getVars()[0].split(' ').slice(-1)[0]} = ${toText(ch[0])}` +
        (ch.length == 1 ? '' : '\n' + toText(ch[1]));

  case 'lists_create_with':
    return `[${b.childBlocks_.map((c) => toText(c)).join(', ')}]`;
  case 'lists_select_item':
    return `${toText(ch[0])}[${toText(ch[1])}]`;
  case 'lists_replace_item':
    return `${toText(ch[0])}[${toText(ch[1])}] = ${toText(ch[2])}` +
        (ch.length == 3 ? '' : '\n' + toText(ch[3]));

  case 'logic_boolean':
    return b.inputList[0].fieldRow[0].value_ == 'TRUE' ? 'true' : 'false';

  case 'component_component_block':
    return b.instanceName;
  case 'component_event':
    return `when (${b.instanceName}.${b.eventName}) {\n${
      indent(toText(ch[0]))
    }\n}`;
  case 'component_set_get':
    if (ch.length == 1) {
      return `get(${b.typeName}.${b.propertyName}, ${toText(ch[0])})`;
    }
    return `set(${b.typeName}.${b.propertyName}, ${toText(ch[0])}, ${
      toText(ch[1])
    })` + (ch.length == 2 ? '' : '\n' + toText(ch[2]));
  case 'component_method':
    return `${b.instanceName}.${b.methodName}(${
      b.childBlocks_.map(toText).join(', ')
    })`;

  case 'helpers_dropdown':
    return `${b.key_}${b.inputList[0].fieldRow[1].value_}()`;
  case 'helpers_screen_names':
    return `${b.inputList[0].fieldRow[0].value_}`;

  case 'procedures_defreturn':
    console.log(ch[0].childBlocks_[1]);
    return `fnr ${b.inputList[0].fieldRow[1].value_}(${
      b.inputList[0].fieldRow.slice(3).map((f) => f.value_).filter((e) =>
        e != undefined
      ).join(', ')
    }) {\n${
      indent(toText(
        ch[0].childBlocks_[1].childBlocks_.filter((e) =>
          e.type != 'lexical_variable_get'
        )[0],
      ))
    }\n}`;

  case 'procedures_callreturn':
    return b.inputList[0].fieldRow[1].value_ + '(' + b.childBlocks_.map((c) =>
      toText(c)
    ).join(', ') + ')';

  case 'dictionaries_create_with':
    return '{' + b.childBlocks_.map((e) => toText(e)).join(', ') + '}';
  case 'pair':
    return toText(ch[1]) + ': ' + toText(ch[0]);

  case 'text':
    return '"' + b.inputList[0].fieldRow[1].value_ + '"';

  default:
    {
      if (b.type in bFns) {
        return bFns[b.type] + '(' + b.childBlocks_.map((c) =>
          toText(c)
        ).join(', ') + ')';
      }
    }
    break;
  }
  console.log(b.type, b);
  return '...';
}
