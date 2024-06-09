/**
 * @license almond 0.3.3 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, https://github.com/requirejs/almond/blob/master/LICENSE
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
  var main, req, makeMap, handlers,
    defined = {},
    waiting = {},
    config = {},
    defining = {},
    hasOwn = Object.prototype.hasOwnProperty,
    aps = [].slice,
    jsSuffixRegExp = /\.js$/;

  function hasProp(obj, prop) {
    return hasOwn.call(obj, prop);
  }

  /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
  function normalize(name, baseName) {
    var nameParts, nameSegment, mapValue, foundMap, lastIndex,
      foundI, foundStarMap, starI, i, j, part, normalizedBaseParts,
      baseParts = baseName && baseName.split('/'),
      map = config.map,
      starMap = (map && map['*']) || {};

    //Adjust any relative paths.
    if (name) {
      name = name.split('/');
      lastIndex = name.length - 1;

      // If wanting node ID compatibility, strip .js from end
      // of IDs. Have to do this here, and not in nameToUrl
      // because node allows either .js or non .js to map
      // to same file.
      if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
        name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
      }

      // Starts with a '.' so need the baseName
      if (name[0].charAt(0) === '.' && baseParts) {
        //Convert baseName to array, and lop off the last part,
        //so that . matches that 'directory' and not name of the baseName's
        //module. For instance, baseName of 'one/two/three', maps to
        //'one/two/three.js', but we want the directory, 'one/two' for
        //this normalization.
        normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
        name = normalizedBaseParts.concat(name);
      }

      //start trimDots
      for (i = 0; i < name.length; i++) {
        part = name[i];
        if (part === '.') {
          name.splice(i, 1);
          i -= 1;
        } else if (part === '..') {
          // If at the start, or previous value is still ..,
          // keep them so that when converted to a path it may
          // still work when converted to a path, even though
          // as an ID it is less than ideal. In larger point
          // releases, may be better to just kick out an error.
          if (i === 0 || (i === 1 && name[2] === '..') || name[i - 1] === '..') {
            continue;
          } else if (i > 0) {
            name.splice(i - 1, 2);
            i -= 2;
          }
        }
      }
      //end trimDots

      name = name.join('/');
    }

    //Apply map config if available.
    if ((baseParts || starMap) && map) {
      nameParts = name.split('/');

      for (i = nameParts.length; i > 0; i -= 1) {
        nameSegment = nameParts.slice(0, i).join('/');

        if (baseParts) {
          //Find the longest baseName segment match in the config.
          //So, do joins on the biggest to smallest lengths of baseParts.
          for (j = baseParts.length; j > 0; j -= 1) {
            mapValue = map[baseParts.slice(0, j).join('/')];

            //baseName segment has  config, find if it has one for
            //this name.
            if (mapValue) {
              mapValue = mapValue[nameSegment];
              if (mapValue) {
                //Match, update name to the new value.
                foundMap = mapValue;
                foundI = i;
                break;
              }
            }
          }
        }

        if (foundMap) {
          break;
        }

        //Check for a star map match, but just hold on to it,
        //if there is a shorter segment match later in a matching
        //config, then favor over this star map.
        if (!foundStarMap && starMap && starMap[nameSegment]) {
          foundStarMap = starMap[nameSegment];
          starI = i;
        }
      }

      if (!foundMap && foundStarMap) {
        foundMap = foundStarMap;
        foundI = starI;
      }

      if (foundMap) {
        nameParts.splice(0, foundI, foundMap);
        name = nameParts.join('/');
      }
    }

    return name;
  }

  function makeRequire(relName, forceSync) {
    return function () {
      //A version of a require function that passes a moduleName
      //value for items that may need to
      //look up paths relative to the moduleName
      var args = aps.call(arguments, 0);

      //If first arg is not require('string'), and there is only
      //one arg, it is the array form without a callback. Insert
      //a null so that the following concat is correct.
      if (typeof args[0] !== 'string' && args.length === 1) {
        args.push(null);
      }
      return req.apply(undef, args.concat([relName, forceSync]));
    };
  }

  function makeNormalize(relName) {
    return function (name) {
      return normalize(name, relName);
    };
  }

  function makeLoad(depName) {
    return function (value) {
      defined[depName] = value;
    };
  }

  function callDep(name) {
    if (hasProp(waiting, name)) {
      var args = waiting[name];
      delete waiting[name];
      defining[name] = true;
      main.apply(undef, args);
    }

    if (!hasProp(defined, name) && !hasProp(defining, name)) {
      throw new Error('No ' + name);
    }
    return defined[name];
  }

  //Turns a plugin!resource to [plugin, resource]
  //with the plugin being undefined if the name
  //did not have a plugin prefix.
  function splitPrefix(name) {
    var prefix,
      index = name ? name.indexOf('!') : -1;
    if (index > -1) {
      prefix = name.substring(0, index);
      name = name.substring(index + 1, name.length);
    }
    return [prefix, name];
  }

  //Creates a parts array for a relName where first part is plugin ID,
  //second part is resource ID. Assumes relName has already been normalized.
  function makeRelParts(relName) {
    return relName ? splitPrefix(relName) : [];
  }

  /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
  makeMap = function (name, relParts) {
    var plugin,
      parts = splitPrefix(name),
      prefix = parts[0],
      relResourceName = relParts[1];

    name = parts[1];

    if (prefix) {
      prefix = normalize(prefix, relResourceName);
      plugin = callDep(prefix);
    }

    //Normalize according
    if (prefix) {
      if (plugin && plugin.normalize) {
        name = plugin.normalize(name, makeNormalize(relResourceName));
      } else {
        name = normalize(name, relResourceName);
      }
    } else {
      name = normalize(name, relResourceName);
      parts = splitPrefix(name);
      prefix = parts[0];
      name = parts[1];
      if (prefix) {
        plugin = callDep(prefix);
      }
    }

    //Using ridiculous property names for space reasons
    return {
      f: prefix ? prefix + '!' + name : name, //fullName
      n: name,
      pr: prefix,
      p: plugin
    };
  };

  function makeConfig(name) {
    return function () {
      return (config && config.config && config.config[name]) || {};
    };
  }

  handlers = {
    require: function (name) {
      return makeRequire(name);
    },
    exports: function (name) {
      var e = defined[name];
      if (typeof e !== 'undefined') {
        return e;
      } else {
        return (defined[name] = {});
      }
    },
    module: function (name) {
      return {
        id: name,
        uri: '',
        exports: defined[name],
        config: makeConfig(name)
      };
    }
  };

  main = function (name, deps, callback, relName) {
    var cjsModule, depName, ret, map, i, relParts,
      args = [],
      callbackType = typeof callback,
      usingExports;

    //Use name if no relName
    relName = relName || name;
    relParts = makeRelParts(relName);

    //Call the callback to define the module, if necessary.
    if (callbackType === 'undefined' || callbackType === 'function') {
      //Pull out the defined dependencies and pass the ordered
      //values to the callback.
      //Default to [require, exports, module] if no deps
      deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
      for (i = 0; i < deps.length; i += 1) {
        map = makeMap(deps[i], relParts);
        depName = map.f;

        //Fast path CommonJS standard dependencies.
        if (depName === 'require') {
          args[i] = handlers.require(name);
        } else if (depName === 'exports') {
          //CommonJS module spec 1.1
          args[i] = handlers.exports(name);
          usingExports = true;
        } else if (depName === 'module') {
          //CommonJS module spec 1.1
          cjsModule = args[i] = handlers.module(name);
        } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
          args[i] = callDep(depName);
        } else if (map.p) {
          map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
          args[i] = defined[depName];
        } else {
          throw new Error(name + ' missing ' + depName);
        }
      }

      ret = callback ? callback.apply(defined[name], args) : undefined;

      if (name) {
        //If setting exports via "module" is in play,
        //favor that over return value and exports. After that,
        //favor a non-undefined return value over exports use.
        if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
          defined[name] = cjsModule.exports;
        } else if (ret !== undef || !usingExports) {
          //Use the return value from the function.
          defined[name] = ret;
        }
      }
    } else if (name) {
      //May just be an object definition for the module. Only
      //worry about defining if have a module name.
      defined[name] = callback;
    }
  };

  requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
    if (typeof deps === 'string') {
      if (handlers[deps]) {
        //callback in this case is really relName
        return handlers[deps](callback);
      }
      //Just return the module wanted. In this scenario, the
      //deps arg is the module name, and second arg (if passed)
      //is just the relName.
      //Normalize module name, if it contains . or ..
      return callDep(makeMap(deps, makeRelParts(callback)).f);
    } else if (!deps.splice) {
      //deps is a config object, not an array.
      config = deps;
      if (config.deps) {
        req(config.deps, config.callback);
      }
      if (!callback) {
        return;
      }

      if (callback.splice) {
        //callback is an array, which means it is a dependency list.
        //Adjust args if there are dependencies
        deps = callback;
        callback = relName;
        relName = null;
      } else {
        deps = undef;
      }
    }

    //Support require(['a'])
    callback = callback || function () {};

    //If relName is a function, it is an errback handler,
    //so remove it.
    if (typeof relName === 'function') {
      relName = forceSync;
      forceSync = alt;
    }

    //Simulate async callback;
    if (forceSync) {
      main(undef, deps, callback, relName);
    } else {
      //Using a non-zero value because of concern for what old browsers
      //do, and latest browsers "upgrade" to 4 if lower value is used:
      //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
      //If want a value immediately, use require('id') instead -- something
      //that works in almond on the global level, but not guaranteed and
      //unlikely to work in other AMD implementations.
      setTimeout(function () {
        main(undef, deps, callback, relName);
      }, 4);
    }

    return req;
  };

  /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
  req.config = function (cfg) {
    return req(cfg);
  };

  /**
     * Expose module registry for debugging and tooling
     */
  requirejs._defined = defined;

  define = function (name, deps, callback) {
    if (typeof name !== 'string') {
      throw new Error('See almond README: incorrect module build, no module name');
    }

    //This module may not have dependencies
    if (!deps.splice) {
      //deps is not an array, so probably means
      //an object literal or factory function for
      //the value. Adjust args.
      callback = deps;
      deps = [];
    }

    if (!hasProp(defined, name) && !hasProp(waiting, name)) {
      waiting[name] = [name, deps, callback];
    }
  };

  define.amd = {
    jQuery: true
  };
}());
const ai_import_meta_url = "somebuiltfile"

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
define("to_app_inventor/pkg/to_app_inventor", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initSync = exports.greet = void 0;
    let wasm;
    const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available'); } });
    if (typeof TextDecoder !== 'undefined') {
        cachedTextDecoder.decode();
    }
    ;
    let cachedUint8Memory0 = null;
    function getUint8Memory0() {
        if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
            cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
        }
        return cachedUint8Memory0;
    }
    function getStringFromWasm0(ptr, len) {
        ptr = ptr >>> 0;
        return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
    }
    let WASM_VECTOR_LEN = 0;
    const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available'); } });
    const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
        ? function (arg, view) {
            return cachedTextEncoder.encodeInto(arg, view);
        }
        : function (arg, view) {
            const buf = cachedTextEncoder.encode(arg);
            view.set(buf);
            return {
                read: arg.length,
                written: buf.length
            };
        });
    function passStringToWasm0(arg, malloc, realloc) {
        if (realloc === undefined) {
            const buf = cachedTextEncoder.encode(arg);
            const ptr = malloc(buf.length, 1) >>> 0;
            getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
            WASM_VECTOR_LEN = buf.length;
            return ptr;
        }
        let len = arg.length;
        let ptr = malloc(len, 1) >>> 0;
        const mem = getUint8Memory0();
        let offset = 0;
        for (; offset < len; offset++) {
            const code = arg.charCodeAt(offset);
            if (code > 0x7F)
                break;
            mem[ptr + offset] = code;
        }
        if (offset !== len) {
            if (offset !== 0) {
                arg = arg.slice(offset);
            }
            ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
            const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
            const ret = encodeString(arg, view);
            offset += ret.written;
            ptr = realloc(ptr, len, offset, 1) >>> 0;
        }
        WASM_VECTOR_LEN = offset;
        return ptr;
    }
    /**
    * @param {string} name
    */
    function greet(name) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.greet(ptr0, len0);
    }
    exports.greet = greet;
    function __wbg_load(module, imports) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof Response === 'function' && module instanceof Response) {
                if (typeof WebAssembly.instantiateStreaming === 'function') {
                    try {
                        return yield WebAssembly.instantiateStreaming(module, imports);
                    }
                    catch (e) {
                        if (module.headers.get('Content-Type') != 'application/wasm') {
                            console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
                        }
                        else {
                            throw e;
                        }
                    }
                }
                const bytes = yield module.arrayBuffer();
                return yield WebAssembly.instantiate(bytes, imports);
            }
            else {
                const instance = yield WebAssembly.instantiate(module, imports);
                if (instance instanceof WebAssembly.Instance) {
                    return { instance, module };
                }
                else {
                    return instance;
                }
            }
        });
    }
    function __wbg_get_imports() {
        const imports = {};
        imports.wbg = {};
        imports.wbg.__wbg_alert_f587cdfdebe32555 = function (arg0, arg1) {
            alert(getStringFromWasm0(arg0, arg1));
        };
        return imports;
    }
    function __wbg_init_memory(imports, maybe_memory) {
    }
    function __wbg_finalize_init(instance, module) {
        wasm = instance.exports;
        __wbg_init.__wbindgen_wasm_module = module;
        cachedUint8Memory0 = null;
        return wasm;
    }
    function initSync(module) {
        if (wasm !== undefined)
            return wasm;
        const imports = __wbg_get_imports();
        __wbg_init_memory(imports);
        if (!(module instanceof WebAssembly.Module)) {
            module = new WebAssembly.Module(module);
        }
        const instance = new WebAssembly.Instance(module, imports);
        return __wbg_finalize_init(instance, module);
    }
    exports.initSync = initSync;
    function __wbg_init(input) {
        return __awaiter(this, void 0, void 0, function* () {
            if (wasm !== undefined)
                return wasm;
            if (typeof input === 'undefined') {
                input = new URL('to_app_inventor_bg.wasm', ai_import_meta_url);
            }
            const imports = __wbg_get_imports();
            if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
                input = fetch(input);
            }
            __wbg_init_memory(imports);
            const { instance, module } = yield __wbg_load(yield input, imports);
            return __wbg_finalize_init(instance, module);
        });
    }
    exports.default = __wbg_init;
});
define("editor", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Editor = void 0;
    class Editor {
        static show() {
        }
        static hide() {
        }
        static setText(newText) {
        }
    }
    exports.Editor = Editor;
});
define("startup", ["require", "exports", "editor", "./to_app_inventor/pkg/to_app_inventor"], function (require, exports, editor_1, tsCompile) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    tsCompile = __importStar(tsCompile);
    tsCompile.default();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window['greet'] = tsCompile.greet;
    // Make sure we only load this once
    if (!window['alreadyLoaded']) {
        setInterval(() => {
            mainLoader();
        }, 100);
    }
    window.alreadyLoaded = true;
    console.log('Loading!');
    // Ignore some textboxes...
    runOnSelector('.destructive-action', (e) => {
        e.click();
        return true;
    });
    runOnSelector('.gwt-Button', (e) => {
        if (e.innerText == 'Save the empty screen now.') {
            e.click();
            return false;
        }
        else {
            return true;
        }
    });
    // Get the workspace!
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let workspace = Blockly.allWorkspaces[Object.keys(Blockly.allWorkspaces)[0]];
    /**
     * Runs a function on an element. If the function returns true,
     * that will be the last time the function is ran on that element.
     * @param selector an element selector
     * @param fn the function to run
     */
    function runOnSelector(selector, fn) {
        for (const e of document.querySelectorAll(selector)) {
            const el = e;
            if (!el.alreadyRan) {
                el.alreadyRan = fn(el);
            }
        }
    }
    ;
    /** Keeps track of the last AI screen */
    let lastScreen = '';
    /** Loads the editor */
    function mainLoader() {
        if (currScreen() != lastScreen) {
            workspace = Blockly.allWorkspaces[Object.keys(Blockly.allWorkspaces).filter((e) => e.split('_').slice(1).join('_') == currScreen())[0]];
            loadBlocks();
            lastScreen = currScreen();
            console.log(lastScreen);
        }
        if (currEditor() == 'Designer')
            editor_1.Editor.hide();
    }
    /** Loads new blocks onto the text editor */
    function loadBlocks() {
        // const newText = w.getTopBlocks().map((b) => toText(b)).join('\n');
        // Editor.setText(newText);
    }
    document.onkeydown = (k) => {
        // Incrementing & decrementing number fields with arrows
        const activeElement = document.activeElement;
        const value = activeElement.value;
        if (activeElement.tagName == 'INPUT' && isNumber(value)) {
            let nudge = (k.key == 'ArrowUp' ? 1 : k.key == 'ArrowDown' ? -1 : 0);
            if (k.ctrlKey)
                nudge *= 5;
            const decimal = (value.match(/\..*/) || [''])[0];
            activeElement.value = Math.trunc(parseFloat(value) + nudge) + decimal;
        }
        // Enable building!
        // if ('sr'.includes(k.key) && k.ctrlKey) build(sec.value), k.preventDefault();
        if (k.key == 'k' && k.ctrlKey)
            loadBlocks();
    };
    /** Checks is a value is a valid number */
    function isNumber(n) {
        if (typeof n === 'string') {
            return !isNaN(parseFloat(n));
        }
        else {
            return !isNaN(n);
        }
    }
    /** Gets the currently selected editor */
    function currEditor() {
        const element = document.querySelector('.right > .ode-TextButton.ode-TextButton-up-disabled');
        return element.innerText;
    }
    /** Gets the currently selected screen */
    function currScreen() {
        const element = document.querySelector('.ya-Toolbar > .center > .ode-TextButton:nth-child(2)');
        return element.innerText.slice(0, -2);
    }
});
// Canvas1.SetBackgroundPixelColor(0, 0, rgb([randi(0, 255), randi(0, 255), randi(0, 255)]))
require(['startup']);
