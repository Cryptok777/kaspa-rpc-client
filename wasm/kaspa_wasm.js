let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;
let wasm;
const { TextEncoder, TextDecoder, inspect } = require(`util`);

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedBigInt64Memory0 = null;

function getBigInt64Memory0() {
    if (cachedBigInt64Memory0 === null || cachedBigInt64Memory0.byteLength === 0) {
        cachedBigInt64Memory0 = new BigInt64Array(wasm.memory.buffer);
    }
    return cachedBigInt64Memory0;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

let WASM_VECTOR_LEN = 0;

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

let cachedTextEncoder = new TextEncoder('utf-8');

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
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedFloat64Memory0 = null;

function getFloat64Memory0() {
    if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_54(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h0e33a75d7a1e43ec(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_57(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__he87520860a471314(arg0, arg1);
}

function __wbg_adapter_60(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h675495322a5729be(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_65(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h8000d0182d9660ab(arg0, arg1);
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
function __wbg_adapter_114(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__h5f1c96a181010bab(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
* Present panic logs to the user
*/
module.exports.show_panic_hook_logs = function() {
    wasm.show_panic_hook_logs();
};

/**
* Initialize panic hook in browser mode
*/
module.exports.init_popup_panic_hook = function() {
    wasm.init_popup_panic_hook();
};

/**
* Initialize panic hook in console mode
*/
module.exports.init_console_panic_hook = function() {
    wasm.init_console_panic_hook();
};

/**
* Deferred promise - an object that has `resolve()` and `reject()`
* functions that can be called outside of the promise body.
* @returns {Promise<any>}
*/
module.exports.defer = function() {
    const ret = wasm.defer();
    return takeObject(ret);
};

let stack_pointer = 128;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}
/**
* @param {any} workflow
* @param {any} modules
*/
module.exports.init_workflow = function(workflow, modules) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.init_workflow(retptr, addBorrowedObject(workflow), addBorrowedObject(modules));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        if (r1) {
            throw takeObject(r0);
        }
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        heap[stack_pointer++] = undefined;
        heap[stack_pointer++] = undefined;
    }
};

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
/**
* @param {SelectionContext} utxo_selection
* @param {PaymentOutputs} outputs
* @param {Address} change_address
* @param {number | undefined} priority_fee
* @param {Uint8Array | undefined} payload
* @returns {MutableTransaction}
*/
module.exports.createTransaction = function(utxo_selection, outputs, change_address, priority_fee, payload) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        _assertClass(utxo_selection, SelectionContext);
        var ptr0 = utxo_selection.__destroy_into_raw();
        _assertClass(outputs, PaymentOutputs);
        var ptr1 = outputs.__destroy_into_raw();
        _assertClass(change_address, Address);
        var ptr2 = change_address.__destroy_into_raw();
        var ptr3 = isLikeNone(payload) ? 0 : passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
        var len3 = WASM_VECTOR_LEN;
        wasm.createTransaction(retptr, ptr0, ptr1, ptr2, !isLikeNone(priority_fee), isLikeNone(priority_fee) ? 0 : priority_fee, ptr3, len3);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return MutableTransaction.__wrap(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
};

/**
* @param {MutableTransaction} mtx
* @param {Address} change_address
* @param {bigint | undefined} priority_fee
* @returns {boolean}
*/
module.exports.adjustTransactionForFee = function(mtx, change_address, priority_fee) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        _assertClass(mtx, MutableTransaction);
        _assertClass(change_address, Address);
        var ptr0 = change_address.__destroy_into_raw();
        wasm.adjustTransactionForFee(retptr, mtx.ptr, ptr0, !isLikeNone(priority_fee), isLikeNone(priority_fee) ? BigInt(0) : priority_fee);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return r0 !== 0;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
};

/**
* Calculate the minimum transaction fee. Transaction fee is derived from the
* @param {Transaction} tx
* @param {number} network_type
* @returns {bigint}
*/
module.exports.minimumTransactionFee = function(tx, network_type) {
    _assertClass(tx, Transaction);
    const ret = wasm.minimumTransactionFee(tx.ptr, network_type);
    return BigInt.asUintN(64, ret);
};

/**
* Calculate transaction mass. Transaction mass is used in the fee calculation.
* @param {Transaction} tx
* @param {number} network_type
* @param {boolean} estimate_signature_mass
* @returns {bigint}
*/
module.exports.calculateTransactionMass = function(tx, network_type, estimate_signature_mass) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        _assertClass(tx, Transaction);
        wasm.calculateTransactionMass(retptr, tx.ptr, network_type, estimate_signature_mass);
        var r0 = getBigInt64Memory0()[retptr / 8 + 0];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];
        if (r3) {
            throw takeObject(r2);
        }
        return BigInt.asUintN(64, r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
};

/**
* @returns {Keypair}
*/
module.exports.generate_random_keypair_not_secure = function() {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.generate_random_keypair_not_secure(retptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return Keypair.__wrap(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
};

/**
* `signTransaction()` is a helper function to sign a transaction using a private key array or a signer array.
* @param {MutableTransaction} mtx
* @param {PrivateKey[] | Signer} signer
* @param {boolean} verify_sig
* @returns {MutableTransaction}
*/
module.exports.signTransaction = function(mtx, signer, verify_sig) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        _assertClass(mtx, MutableTransaction);
        var ptr0 = mtx.__destroy_into_raw();
        wasm.signTransaction(retptr, ptr0, addHeapObject(signer), verify_sig);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return MutableTransaction.__wrap(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
};

/**
* @param {any} script_hash
* @param {PrivateKey} privkey
* @returns {string}
*/
module.exports.signScriptHash = function(script_hash, privkey) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        _assertClass(privkey, PrivateKey);
        wasm.signScriptHash(retptr, addHeapObject(script_hash), privkey.ptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];
        var ptr0 = r0;
        var len0 = r1;
        if (r3) {
            ptr0 = 0; len0 = 0;
            throw takeObject(r2);
        }
        return getStringFromWasm0(ptr0, len0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(ptr0, len0);
    }
};

/**
* is_transaction_output_dust returns whether or not the passed transaction output
* amount is considered dust or not based on the configured minimum transaction
* relay fee.
*
* Dust is defined in terms of the minimum transaction relay fee. In particular,
* if the cost to the network to spend coins is more than 1/3 of the minimum
* transaction relay fee, it is considered dust.
*
* It is exposed by [MiningManager] for use by transaction generators and wallets.
* @param {TransactionOutput} transaction_output
* @returns {boolean}
*/
module.exports.isTransactionOutputDust = function(transaction_output) {
    _assertClass(transaction_output, TransactionOutput);
    const ret = wasm.isTransactionOutputDust(transaction_output.ptr);
    return ret !== 0;
};

/**
* @param {string} text
* @param {string} password
* @returns {string}
*/
module.exports.encrypt = function(text, password) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        wasm.encrypt(retptr, ptr0, len0, ptr1, len1);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];
        var ptr2 = r0;
        var len2 = r1;
        if (r3) {
            ptr2 = 0; len2 = 0;
            throw takeObject(r2);
        }
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(ptr2, len2);
    }
};

/**
* @param {string} text
* @param {string} password
* @returns {string}
*/
module.exports.decrypt = function(text, password) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        wasm.decrypt(retptr, ptr0, len0, ptr1, len1);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];
        var ptr2 = r0;
        var len2 = r1;
        if (r3) {
            ptr2 = 0; len2 = 0;
            throw takeObject(r2);
        }
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(ptr2, len2);
    }
};

/**
* Supported languages.
*
* Presently only English is specified by the BIP39 standard
*/
module.exports.Language = Object.freeze({
/**
* English is presently the only supported language
*/
English:0,"0":"English", });
/**
*
*  Kaspa `Address` version (`PubKey`, `PubKey ECDSA`, `ScriptHash`)
*/
module.exports.AddressVersion = Object.freeze({
/**
* PubKey addresses always have the version byte set to 0
*/
PubKey:0,"0":"PubKey",
/**
* PubKey ECDSA addresses always have the version byte set to 1
*/
PubKeyECDSA:1,"1":"PubKeyECDSA",
/**
* ScriptHash addresses always have the version byte set to 8
*/
ScriptHash:8,"8":"ScriptHash", });
/**
* RPC protocol encoding: `Borsh` or `SerdeJson`
*/
module.exports.Encoding = Object.freeze({ Borsh:0,"0":"Borsh",SerdeJson:1,"1":"SerdeJson", });
/**
* UtxoOrdering enum denotes UTXO sort order (`Unordered`, `AscendingAmount`, `AscendingDaaScore`)
*/
module.exports.UtxoOrdering = Object.freeze({ Unordered:0,"0":"Unordered",AscendingAmount:1,"1":"AscendingAmount",AscendingDaaScore:2,"2":"AscendingDaaScore", });
/**
*/
module.exports.AccountKind = Object.freeze({ V0:0,"0":"V0",Bip32:1,"1":"Bip32",MultiSig:2,"2":"MultiSig", });
/**
*/
module.exports.NetworkType = Object.freeze({ Mainnet:0,"0":"Mainnet",Testnet:1,"1":"Testnet", });
/**
* Wallet `Account` data structure. An account is typically a single
* HD-key derivation (derived from a wallet or from an an external secret)
*/
class Account {

    toJSON() {
        return {
            accountKind: this.accountKind,
            balance: this.balance,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    [inspect.custom]() {
        return Object.assign(Object.create({constructor: this.constructor}), this.toJSON());
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_account_free(ptr);
    }
    /**
    * @returns {number}
    */
    get accountKind() {
        const ret = wasm.__wbg_get_account_accountKind(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set accountKind(arg0) {
        wasm.__wbg_set_account_accountKind(this.ptr, arg0);
    }
    /**
    * @returns {bigint}
    */
    get balance() {
        const ret = wasm.account_balance(this.ptr);
        return BigInt.asUintN(64, ret);
    }
}
module.exports.Account = Account;
/**
* Kaspa `Address` struct that serializes to and from an address format string: `kaspa:qz0s...t8cv`.
*/
class Address {

    static __wrap(ptr) {
        const obj = Object.create(Address.prototype);
        obj.ptr = ptr;

        return obj;
    }

    toJSON() {
        return {
            version: this.version,
            prefix: this.prefix,
            payload: this.payload,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    [inspect.custom]() {
        return Object.assign(Object.create({constructor: this.constructor}), this.toJSON());
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_address_free(ptr);
    }
    /**
    * @param {string} address
    */
    constructor(address) {
        const ptr0 = passStringToWasm0(address, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.address_constructor(ptr0, len0);
        return Address.__wrap(ret);
    }
    /**
    * Convert an address to a string.
    * @returns {string}
    */
    toString() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_toString(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {string}
    */
    get version() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_version(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {string}
    */
    get prefix() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_prefix(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} prefix
    */
    set prefix(prefix) {
        const ptr0 = passStringToWasm0(prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.address_set_prefix(this.ptr, ptr0, len0);
    }
    /**
    * @returns {string}
    */
    get payload() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_payload(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.Address = Address;
/**
*/
class AddressGenerator {

    toJSON() {
        return {
            publicKey: this.publicKey,
            currentAddress: this.currentAddress,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    [inspect.custom]() {
        return Object.assign(Object.create({constructor: this.constructor}), this.toJSON());
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_addressgenerator_free(ptr);
    }
    /**
    * @returns {string}
    */
    get publicKey() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.addressgenerator_publicKey(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Promise<Address>}
    */
    get currentAddress() {
        const ret = wasm.addressgenerator_currentAddress(this.ptr);
        return takeObject(ret);
    }
}
module.exports.AddressGenerator = AddressGenerator;
/**
*/
class AddressGeneratorV0 {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_addressgeneratorv0_free(ptr);
    }
}
module.exports.AddressGeneratorV0 = AddressGeneratorV0;
/**
*/
class DerivationPath {

    static __wrap(ptr) {
        const obj = Object.create(DerivationPath.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_derivationpath_free(ptr);
    }
    /**
    * @param {string} path
    */
    constructor(path) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.derivationpath_new(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return DerivationPath.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Is this derivation path empty? (i.e. the root)
    * @returns {boolean}
    */
    isEmpty() {
        const ret = wasm.derivationpath_isEmpty(this.ptr);
        return ret !== 0;
    }
    /**
    * Get the count of [`ChildNumber`] values in this derivation path.
    * @returns {number}
    */
    length() {
        const ret = wasm.derivationpath_length(this.ptr);
        return ret >>> 0;
    }
    /**
    * Get the parent [`DerivationPath`] for the current one.
    *
    * Returns `Undefined` if this is already the root path.
    * @returns {DerivationPath | undefined}
    */
    parent() {
        const ret = wasm.derivationpath_parent(this.ptr);
        return ret === 0 ? undefined : DerivationPath.__wrap(ret);
    }
    /**
    * Push a [`ChildNumber`] onto an existing derivation path.
    * @param {number} child_number
    * @param {boolean | undefined} hardened
    */
    push(child_number, hardened) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.derivationpath_push(retptr, this.ptr, child_number, isLikeNone(hardened) ? 0xFFFFFF : hardened ? 1 : 0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {string}
    */
    toString() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.derivationpath_toString(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.DerivationPath = DerivationPath;
/**
*/
class Hash {

    static __wrap(ptr) {
        const obj = Object.create(Hash.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_hash_free(ptr);
    }
    /**
    * @param {string} hex_str
    */
    constructor(hex_str) {
        const ptr0 = passStringToWasm0(hex_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.hash_constructor(ptr0, len0);
        return Hash.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    toString() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.hash_toString(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.Hash = Hash;
/**
*/
class Header {

    static __wrap(ptr) {
        const obj = Object.create(Header.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_header_free(ptr);
    }
    /**
    * @param {number} version
    * @param {Array<any>} parents_by_level_array
    * @param {string} hash_merkle_root
    * @param {string} accepted_id_merkle_root
    * @param {string} utxo_commitment
    * @param {bigint} timestamp
    * @param {number} bits
    * @param {bigint} nonce
    * @param {bigint} daa_score
    * @param {bigint} blue_work
    * @param {bigint} blue_score
    * @param {string} pruning_point
    */
    constructor(version, parents_by_level_array, hash_merkle_root, accepted_id_merkle_root, utxo_commitment, timestamp, bits, nonce, daa_score, blue_work, blue_score, pruning_point) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(hash_merkle_root, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(accepted_id_merkle_root, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(utxo_commitment, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passStringToWasm0(pruning_point, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len3 = WASM_VECTOR_LEN;
            wasm.header_new(retptr, version, addHeapObject(parents_by_level_array), ptr0, len0, ptr1, len1, ptr2, len2, timestamp, bits, nonce, daa_score, blue_work, blue_score, ptr3, len3);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Header.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {string}
    */
    calculateHash() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.header_calculateHash(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.Header = Header;
/**
* Data structure that contains a secret and public keys.
*/
class Keypair {

    static __wrap(ptr) {
        const obj = Object.create(Keypair.prototype);
        obj.ptr = ptr;

        return obj;
    }

    toJSON() {
        return {
            publicKey: this.publicKey,
            privateKey: this.privateKey,
            xOnlyPublicKey: this.xOnlyPublicKey,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    [inspect.custom]() {
        return Object.assign(Object.create({constructor: this.constructor}), this.toJSON());
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_keypair_free(ptr);
    }
    /**
    * @returns {any}
    */
    get publicKey() {
        const ret = wasm.keypair_get_public_key(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {PrivateKey}
    */
    get privateKey() {
        const ret = wasm.keypair_get_private_key(this.ptr);
        return PrivateKey.__wrap(ret);
    }
    /**
    * @returns {any}
    */
    get xOnlyPublicKey() {
        const ret = wasm.keypair_get_xonly_public_key(this.ptr);
        return takeObject(ret);
    }
}
module.exports.Keypair = Keypair;
/**
* BIP39 mnemonic phrases: sequences of words representing cryptographic keys.
*/
class Mnemonic {

    static __wrap(ptr) {
        const obj = Object.create(Mnemonic.prototype);
        obj.ptr = ptr;

        return obj;
    }

    toJSON() {
        return {
            entropy: this.entropy,
            phrase: this.phrase,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    [inspect.custom]() {
        return Object.assign(Object.create({constructor: this.constructor}), this.toJSON());
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_mnemonic_free(ptr);
    }
    /**
    * @param {string} phrase
    * @param {number | undefined} language
    */
    constructor(phrase, language) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(phrase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.mnemonic_constructor(retptr, ptr0, len0, isLikeNone(language) ? 1 : language);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Mnemonic.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {string}
    */
    get entropy() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mnemonic_entropy(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} entropy
    */
    set entropy(entropy) {
        const ptr0 = passStringToWasm0(entropy, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.mnemonic_set_entropy(this.ptr, ptr0, len0);
    }
    /**
    * @returns {Mnemonic}
    */
    static random() {
        const ret = wasm.mnemonic_random();
        return Mnemonic.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get phrase() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mnemonic_phrase(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} phrase
    */
    set phrase(phrase) {
        const ptr0 = passStringToWasm0(phrase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.mnemonic_set_phrase(this.ptr, ptr0, len0);
    }
    /**
    * @param {string} password
    * @returns {string}
    */
    toSeed(password) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.mnemonic_toSeed(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.Mnemonic = Mnemonic;
/**
*
* [`MultiplexerClient`] is an object meant to be used in WASM environment to
* process channel events.
*/
class MultiplexerClient {

    static __wrap(ptr) {
        const obj = Object.create(MultiplexerClient.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_multiplexerclient_free(ptr);
    }
    /**
    */
    constructor() {
        const ret = wasm.multiplexerclient_new();
        return MultiplexerClient.__wrap(ret);
    }
    /**
    * @param {any} callback
    */
    setHandler(callback) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.multiplexerclient_setHandler(retptr, this.ptr, addHeapObject(callback));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * `removeHandler` must be called when releasing ReflectorClient
    * to stop the background event processing task
    */
    removeHandler() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.multiplexerclient_removeHandler(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Promise<void>}
    */
    stop() {
        const ret = wasm.multiplexerclient_stop(this.ptr);
        return takeObject(ret);
    }
}
module.exports.MultiplexerClient = MultiplexerClient;
/**
* Represents a generic mutable transaction
*/
class MutableTransaction {

    static __wrap(ptr) {
        const obj = Object.create(MutableTransaction.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_mutabletransaction_free(ptr);
    }
    /**
    * UTXO entry data
    * @returns {UtxoEntries}
    */
    get entries() {
        const ret = wasm.__wbg_get_mutabletransaction_entries(this.ptr);
        return UtxoEntries.__wrap(ret);
    }
    /**
    * UTXO entry data
    * @param {UtxoEntries} arg0
    */
    set entries(arg0) {
        _assertClass(arg0, UtxoEntries);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_mutabletransaction_entries(this.ptr, ptr0);
    }
    /**
    * @param {Transaction} tx
    * @param {UtxoEntries} entries
    */
    constructor(tx, entries) {
        _assertClass(tx, Transaction);
        _assertClass(entries, UtxoEntries);
        const ret = wasm.mutabletransaction_new(tx.ptr, entries.ptr);
        return MutableTransaction.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get id() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mutabletransaction_id(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr0 = r0;
            var len0 = r1;
            if (r3) {
                ptr0 = 0; len0 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr0, len0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr0, len0);
        }
    }
    /**
    * @returns {string}
    */
    toJSON() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mutabletransaction_toJSON(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr0 = r0;
            var len0 = r1;
            if (r3) {
                ptr0 = 0; len0 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr0, len0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr0, len0);
        }
    }
    /**
    * @param {string} json
    * @returns {MutableTransaction}
    */
    static fromJSON(json) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.mutabletransaction_fromJSON(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MutableTransaction.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {any}
    */
    getScriptHashes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mutabletransaction_getScriptHashes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Array<any>} signatures
    * @returns {any}
    */
    setSignatures(signatures) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mutabletransaction_setSignatures(retptr, this.ptr, addHeapObject(signatures));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {any}
    */
    toRpcTransaction() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mutabletransaction_toRpcTransaction(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Array<any>}
    */
    get inputs() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mutabletransaction_get_inputs(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Array<any>}
    */
    get outputs() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mutabletransaction_get_outputs(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.MutableTransaction = MutableTransaction;
/**
*/
class PaymentOutput {

    static __wrap(ptr) {
        const obj = Object.create(PaymentOutput.prototype);
        obj.ptr = ptr;

        return obj;
    }

    toJSON() {
        return {
            address: this.address,
            amount: this.amount,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    [inspect.custom]() {
        return Object.assign(Object.create({constructor: this.constructor}), this.toJSON());
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_paymentoutput_free(ptr);
    }
    /**
    * @returns {Address}
    */
    get address() {
        const ret = wasm.__wbg_get_paymentoutput_address(this.ptr);
        return Address.__wrap(ret);
    }
    /**
    * @param {Address} arg0
    */
    set address(arg0) {
        _assertClass(arg0, Address);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_paymentoutput_address(this.ptr, ptr0);
    }
    /**
    * @returns {bigint}
    */
    get amount() {
        const ret = wasm.__wbg_get_paymentoutput_amount(this.ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} arg0
    */
    set amount(arg0) {
        wasm.__wbg_set_paymentoutput_amount(this.ptr, arg0);
    }
    /**
    * @param {Address} address
    * @param {bigint} amount
    * @param {UtxoEntry | undefined} utxo_entry
    */
    constructor(address, amount, utxo_entry) {
        _assertClass(address, Address);
        var ptr0 = address.__destroy_into_raw();
        let ptr1 = 0;
        if (!isLikeNone(utxo_entry)) {
            _assertClass(utxo_entry, UtxoEntry);
            ptr1 = utxo_entry.__destroy_into_raw();
        }
        const ret = wasm.paymentoutput_new(ptr0, amount, ptr1);
        return PaymentOutput.__wrap(ret);
    }
}
module.exports.PaymentOutput = PaymentOutput;
/**
*/
class PaymentOutputs {

    static __wrap(ptr) {
        const obj = Object.create(PaymentOutputs.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_paymentoutputs_free(ptr);
    }
    /**
    * @param {any} output_array
    */
    constructor(output_array) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.paymentoutputs_js_ctor(retptr, addHeapObject(output_array));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return PaymentOutputs.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.PaymentOutputs = PaymentOutputs;
/**
* Data structure that envelops a Private Key
*/
class PrivateKey {

    static __wrap(ptr) {
        const obj = Object.create(PrivateKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_privatekey_free(ptr);
    }
    /**
    * @returns {string}
    */
    __getClassname() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.privatekey___getClassname(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} key
    */
    constructor(key) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.privatekey_new(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return PrivateKey.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.PrivateKey = PrivateKey;
/**
* Kaspa RPC client
*/
class RpcClient {

    static __wrap(ptr) {
        const obj = Object.create(RpcClient.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rpcclient_free(ptr);
    }
    /**
    * Create a new RPC client with [`Encoding`] and a `url`.
    * @param {number} encoding
    * @param {string} url
    */
    constructor(encoding, url) {
        const ptr0 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rpcclient_new(encoding, ptr0, len0);
        return RpcClient.__wrap(ret);
    }
    /**
    * Connect to the Kaspa RPC server. This function starts a background
    * task that connects and reconnects to the server if the connection
    * is terminated.  Use [`disconnect()`] to terminate the connection.
    * @returns {Promise<void>}
    */
    connect() {
        const ret = wasm.rpcclient_connect(this.ptr);
        return takeObject(ret);
    }
    /**
    * Disconnect from the Kaspa RPC server.
    * @returns {Promise<void>}
    */
    disconnect() {
        const ret = wasm.rpcclient_disconnect(this.ptr);
        return takeObject(ret);
    }
    /**
    * Register a notification callback.
    * @param {any} callback
    * @returns {Promise<void>}
    */
    notify(callback) {
        const ret = wasm.rpcclient_notify(this.ptr, addHeapObject(callback));
        return takeObject(ret);
    }
    /**
    * Subscription to DAA Score (test)
    * @returns {Promise<void>}
    */
    subscribeDaaScore() {
        const ret = wasm.rpcclient_subscribeDaaScore(this.ptr);
        return takeObject(ret);
    }
    /**
    * Unsubscribe from DAA Score (test)
    * @returns {Promise<void>}
    */
    unsubscribeDaaScore() {
        const ret = wasm.rpcclient_unsubscribeDaaScore(this.ptr);
        return takeObject(ret);
    }
    /**
    * Subscription to UTXOs Changed notifications
    * @param {any} addresses
    * @returns {Promise<void>}
    */
    subscribeUtxosChanged(addresses) {
        const ret = wasm.rpcclient_subscribeUtxosChanged(this.ptr, addHeapObject(addresses));
        return takeObject(ret);
    }
    /**
    * Unsubscribe from DAA Score (test)
    * @param {any} addresses
    * @returns {Promise<void>}
    */
    unsubscribeUtxosChanged(addresses) {
        const ret = wasm.rpcclient_unsubscribeUtxosChanged(this.ptr, addHeapObject(addresses));
        return takeObject(ret);
    }
    /**
    * @param {boolean} include_accepted_transaction_ids
    * @returns {Promise<void>}
    */
    subscribeVirtualChainChanged(include_accepted_transaction_ids) {
        const ret = wasm.rpcclient_subscribeVirtualChainChanged(this.ptr, include_accepted_transaction_ids);
        return takeObject(ret);
    }
    /**
    * @param {boolean} include_accepted_transaction_ids
    * @returns {Promise<void>}
    */
    unsubscribeVirtualChainChanged(include_accepted_transaction_ids) {
        const ret = wasm.rpcclient_unsubscribeVirtualChainChanged(this.ptr, include_accepted_transaction_ids);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<void>}
    */
    subscribeBlockAdded() {
        const ret = wasm.rpcclient_subscribeBlockAdded(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<void>}
    */
    unsubscribeBlockAdded() {
        const ret = wasm.rpcclient_unsubscribeBlockAdded(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<void>}
    */
    subscribeFinalityConflict() {
        const ret = wasm.rpcclient_subscribeFinalityConflict(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<void>}
    */
    unsubscribeFinalityConflict() {
        const ret = wasm.rpcclient_unsubscribeFinalityConflict(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<void>}
    */
    subscribeFinalityConflictResolved() {
        const ret = wasm.rpcclient_subscribeFinalityConflictResolved(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<void>}
    */
    unsubscribeFinalityConflictResolved() {
        const ret = wasm.rpcclient_unsubscribeFinalityConflictResolved(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<void>}
    */
    subscribeSinkBlueScoreChanged() {
        const ret = wasm.rpcclient_subscribeSinkBlueScoreChanged(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<void>}
    */
    unsubscribeSinkBlueScoreChanged() {
        const ret = wasm.rpcclient_unsubscribeSinkBlueScoreChanged(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<void>}
    */
    subscribeVirtualDaaScoreChanged() {
        const ret = wasm.rpcclient_subscribeVirtualDaaScoreChanged(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<void>}
    */
    unsubscribeVirtualDaaScoreChanged() {
        const ret = wasm.rpcclient_unsubscribeVirtualDaaScoreChanged(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<void>}
    */
    subscribePruningPointUtxoSetOverride() {
        const ret = wasm.rpcclient_subscribePruningPointUtxoSetOverride(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<void>}
    */
    unsubscribePruningPointUtxoSetOverride() {
        const ret = wasm.rpcclient_unsubscribePruningPointUtxoSetOverride(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<void>}
    */
    subscribeNewBlockTemplate() {
        const ret = wasm.rpcclient_subscribeNewBlockTemplate(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<void>}
    */
    unsubscribeNewBlockTemplate() {
        const ret = wasm.rpcclient_unsubscribeNewBlockTemplate(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<any>}
    */
    getBlockCount() {
        const ret = wasm.rpcclient_getBlockCount(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<any>}
    */
    getBlockDagInfo() {
        const ret = wasm.rpcclient_getBlockDagInfo(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<any>}
    */
    getCoinSupply() {
        const ret = wasm.rpcclient_getCoinSupply(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<any>}
    */
    getConnectedPeerInfo() {
        const ret = wasm.rpcclient_getConnectedPeerInfo(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<any>}
    */
    getInfo() {
        const ret = wasm.rpcclient_getInfo(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<any>}
    */
    getPeerAddresses() {
        const ret = wasm.rpcclient_getPeerAddresses(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<any>}
    */
    getProcessMetrics() {
        const ret = wasm.rpcclient_getProcessMetrics(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<any>}
    */
    getSelectedTipHash() {
        const ret = wasm.rpcclient_getSelectedTipHash(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<any>}
    */
    getSinkBlueScore() {
        const ret = wasm.rpcclient_getSinkBlueScore(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<any>}
    */
    ping() {
        const ret = wasm.rpcclient_ping(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<any>}
    */
    shutdown() {
        const ret = wasm.rpcclient_shutdown(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {any} request
    * @returns {Promise<any>}
    */
    addPeer(request) {
        const ret = wasm.rpcclient_addPeer(this.ptr, addHeapObject(request));
        return takeObject(ret);
    }
    /**
    * @param {any} request
    * @returns {Promise<any>}
    */
    ban(request) {
        const ret = wasm.rpcclient_ban(this.ptr, addHeapObject(request));
        return takeObject(ret);
    }
    /**
    * @param {any} request
    * @returns {Promise<any>}
    */
    estimateNetworkHashesPerSecond(request) {
        const ret = wasm.rpcclient_estimateNetworkHashesPerSecond(this.ptr, addHeapObject(request));
        return takeObject(ret);
    }
    /**
    * @param {any} request
    * @returns {Promise<any>}
    */
    getBalanceByAddress(request) {
        const ret = wasm.rpcclient_getBalanceByAddress(this.ptr, addHeapObject(request));
        return takeObject(ret);
    }
    /**
    * @param {any} request
    * @returns {Promise<any>}
    */
    getBalancesByAddresses(request) {
        const ret = wasm.rpcclient_getBalancesByAddresses(this.ptr, addHeapObject(request));
        return takeObject(ret);
    }
    /**
    * @param {any} request
    * @returns {Promise<any>}
    */
    getBlock(request) {
        const ret = wasm.rpcclient_getBlock(this.ptr, addHeapObject(request));
        return takeObject(ret);
    }
    /**
    * @param {any} request
    * @returns {Promise<any>}
    */
    getBlocks(request) {
        const ret = wasm.rpcclient_getBlocks(this.ptr, addHeapObject(request));
        return takeObject(ret);
    }
    /**
    * @param {any} request
    * @returns {Promise<any>}
    */
    getBlockTemplate(request) {
        const ret = wasm.rpcclient_getBlockTemplate(this.ptr, addHeapObject(request));
        return takeObject(ret);
    }
    /**
    * @param {any} request
    * @returns {Promise<any>}
    */
    getCurrentNetwork(request) {
        const ret = wasm.rpcclient_getCurrentNetwork(this.ptr, addHeapObject(request));
        return takeObject(ret);
    }
    /**
    * @param {any} request
    * @returns {Promise<any>}
    */
    getHeaders(request) {
        const ret = wasm.rpcclient_getHeaders(this.ptr, addHeapObject(request));
        return takeObject(ret);
    }
    /**
    * @param {any} request
    * @returns {Promise<any>}
    */
    getMempoolEntries(request) {
        const ret = wasm.rpcclient_getMempoolEntries(this.ptr, addHeapObject(request));
        return takeObject(ret);
    }
    /**
    * @param {any} request
    * @returns {Promise<any>}
    */
    getMempoolEntriesByAddresses(request) {
        const ret = wasm.rpcclient_getMempoolEntriesByAddresses(this.ptr, addHeapObject(request));
        return takeObject(ret);
    }
    /**
    * @param {any} request
    * @returns {Promise<any>}
    */
    getMempoolEntry(request) {
        const ret = wasm.rpcclient_getMempoolEntry(this.ptr, addHeapObject(request));
        return takeObject(ret);
    }
    /**
    * @param {any} request
    * @returns {Promise<any>}
    */
    getSubnetwork(request) {
        const ret = wasm.rpcclient_getSubnetwork(this.ptr, addHeapObject(request));
        return takeObject(ret);
    }
    /**
    * @param {any} request
    * @returns {Promise<any>}
    */
    getVirtualChainFromBlock(request) {
        const ret = wasm.rpcclient_getVirtualChainFromBlock(this.ptr, addHeapObject(request));
        return takeObject(ret);
    }
    /**
    * @param {any} request
    * @returns {Promise<any>}
    */
    resolveFinalityConflict(request) {
        const ret = wasm.rpcclient_resolveFinalityConflict(this.ptr, addHeapObject(request));
        return takeObject(ret);
    }
    /**
    * @param {any} request
    * @returns {Promise<any>}
    */
    submitBlock(request) {
        const ret = wasm.rpcclient_submitBlock(this.ptr, addHeapObject(request));
        return takeObject(ret);
    }
    /**
    * @param {any} request
    * @returns {Promise<any>}
    */
    unban(request) {
        const ret = wasm.rpcclient_unban(this.ptr, addHeapObject(request));
        return takeObject(ret);
    }
    /**
    * @param {any} request
    * @returns {Promise<any>}
    */
    submitTransaction(request) {
        const ret = wasm.rpcclient_submitTransaction(this.ptr, addHeapObject(request));
        return takeObject(ret);
    }
    /**
    * @param {any} request
    * @returns {Promise<any>}
    */
    getUtxosByAddresses(request) {
        const ret = wasm.rpcclient_getUtxosByAddresses(this.ptr, addHeapObject(request));
        return takeObject(ret);
    }
}
module.exports.RpcClient = RpcClient;
/**
*
*  ScriptBuilder provides a facility for building custom scripts. It allows
* you to push opcodes, ints, and data while respecting canonical encoding. In
* general it does not ensure the script will execute correctly, however any
* data pushes which would exceed the maximum allowed script engine limits and
* are therefore guaranteed not to execute will not be pushed and will result in
* the Script function returning an error.
*/
class ScriptBuilder {

    static __wrap(ptr) {
        const obj = Object.create(ScriptBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_scriptbuilder_free(ptr);
    }
    /**
    * Get script bytes represented by a hex string.
    * @returns {string}
    */
    script() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptbuilder_script(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Drains (empties) the script builder, returning the
    * script bytes represented by a hex string.
    * @returns {string}
    */
    drain() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptbuilder_drain(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Pushes the passed opcode to the end of the script. The script will not
    * be modified if pushing the opcode would cause the script to exceed the
    * maximum allowed script engine size.
    * @param {number} opcode
    * @returns {ScriptBuilder}
    */
    addOp(opcode) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptbuilder_addOp(retptr, this.ptr, opcode);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ScriptBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {any} opcodes
    * @returns {ScriptBuilder}
    */
    addOps(opcodes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptbuilder_addOps(retptr, this.ptr, addHeapObject(opcodes));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ScriptBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * AddData pushes the passed data to the end of the script. It automatically
    * chooses canonical opcodes depending on the length of the data.
    *
    * A zero length buffer will lead to a push of empty data onto the stack (Op0 = OpFalse)
    * and any push of data greater than [`MAX_SCRIPT_ELEMENT_SIZE`] will not modify
    * the script since that is not allowed by the script engine.
    *
    * Also, the script will not be modified if pushing the data would cause the script to
    * exceed the maximum allowed script engine size [`MAX_SCRIPTS_SIZE`].
    * @param {any} data
    * @returns {ScriptBuilder}
    */
    addData(data) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptbuilder_addData(retptr, this.ptr, addHeapObject(data));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ScriptBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {bigint} val
    * @returns {ScriptBuilder}
    */
    addI64(val) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptbuilder_addI64(retptr, this.ptr, val);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ScriptBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {bigint} lock_time
    * @returns {ScriptBuilder}
    */
    addLockTime(lock_time) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptbuilder_addLockTime(retptr, this.ptr, lock_time);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ScriptBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {bigint} sequence
    * @returns {ScriptBuilder}
    */
    addSequence(sequence) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptbuilder_addSequence(retptr, this.ptr, sequence);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ScriptBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.ScriptBuilder = ScriptBuilder;
/**
* Represents a Kaspad ScriptPublicKey
*/
class ScriptPublicKey {

    static __wrap(ptr) {
        const obj = Object.create(ScriptPublicKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    toJSON() {
        return {
            version: this.version,
            script: this.script,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    [inspect.custom]() {
        return Object.assign(Object.create({constructor: this.constructor}), this.toJSON());
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_scriptpublickey_free(ptr);
    }
    /**
    * @returns {number}
    */
    get version() {
        const ret = wasm.__wbg_get_scriptpublickey_version(this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set version(arg0) {
        wasm.__wbg_set_scriptpublickey_version(this.ptr, arg0);
    }
    /**
    * @param {number} version
    * @param {any} script
    */
    constructor(version, script) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptpublickey_constructor(retptr, version, addHeapObject(script));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ScriptPublicKey.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {string}
    */
    get script() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptpublickey_script_as_hex(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.ScriptPublicKey = ScriptPublicKey;
/**
* Result containing data produced by the `UtxoSet::select()` function
*/
class SelectionContext {

    static __wrap(ptr) {
        const obj = Object.create(SelectionContext.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_selectioncontext_free(ptr);
    }
    /**
    * @returns {bigint}
    */
    get amount() {
        const ret = wasm.__wbg_get_selectioncontext_amount(this.ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} arg0
    */
    set amount(arg0) {
        wasm.__wbg_set_selectioncontext_amount(this.ptr, arg0);
    }
    /**
    * @returns {bigint}
    */
    get totalAmount() {
        const ret = wasm.__wbg_get_selectioncontext_totalAmount(this.ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} arg0
    */
    set totalAmount(arg0) {
        wasm.__wbg_set_selectioncontext_totalAmount(this.ptr, arg0);
    }
    /**
    * @returns {Array<any>}
    */
    get utxos() {
        const ret = wasm.selectioncontext_selected_entries(this.ptr);
        return takeObject(ret);
    }
}
module.exports.SelectionContext = SelectionContext;
/**
* `Signer` is a type capable of signing transactions.
*/
class Signer {

    static __wrap(ptr) {
        const obj = Object.create(Signer.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_signer_free(ptr);
    }
    /**
    * @returns {string}
    */
    __getClassname() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.signer___getClassname(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {boolean}
    */
    get verify() {
        const ret = wasm.__wbg_get_signer_verify(this.ptr);
        return ret !== 0;
    }
    /**
    * @param {boolean} arg0
    */
    set verify(arg0) {
        wasm.__wbg_set_signer_verify(this.ptr, arg0);
    }
    /**
    * @param {PrivateKey[]} private_keys
    */
    constructor(private_keys) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.signer_js_ctor(retptr, addHeapObject(private_keys));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Signer.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {MutableTransaction} mtx
    * @param {boolean} verify_sig
    * @returns {MutableTransaction}
    */
    signTransaction(mtx, verify_sig) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(mtx, MutableTransaction);
            var ptr0 = mtx.__destroy_into_raw();
            wasm.signer_signTransaction(retptr, this.ptr, ptr0, verify_sig);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MutableTransaction.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.Signer = Signer;
/**
*/
class State {

    static __wrap(ptr) {
        const obj = Object.create(State.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_state_free(ptr);
    }
    /**
    * @param {Header} header
    */
    constructor(header) {
        _assertClass(header, Header);
        const ret = wasm.state_new(header.ptr);
        return State.__wrap(ret);
    }
    /**
    * @param {bigint} nonce
    * @returns {Array<any>}
    */
    checkPow(nonce) {
        const ret = wasm.state_checkPow(this.ptr, nonce);
        return takeObject(ret);
    }
}
module.exports.State = State;
/**
* Wallet file storage interface
*/
class Store {

    toJSON() {
        return {
            filename: this.filename,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    [inspect.custom]() {
        return Object.assign(Object.create({constructor: this.constructor}), this.toJSON());
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_store_free(ptr);
    }
    /**
    * @returns {string}
    */
    get filename() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.store_filename(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.Store = Store;
/**
* Represents a Kaspa transaction
*/
class Transaction {

    static __wrap(ptr) {
        const obj = Object.create(Transaction.prototype);
        obj.ptr = ptr;

        return obj;
    }

    toJSON() {
        return {
            id: this.id,
            inputs: this.inputs,
            outputs: this.outputs,
            version: this.version,
            lock_time: this.lock_time,
            gas: this.gas,
            subnetworkId: this.subnetworkId,
            payload: this.payload,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    [inspect.custom]() {
        return Object.assign(Object.create({constructor: this.constructor}), this.toJSON());
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transaction_free(ptr);
    }
    /**
    * Determines whether or not a transaction is a coinbase transaction. A coinbase
    * transaction is a special transaction created by miners that distributes fees and block subsidy
    * to the previous blocks' miners, and specifies the script_pub_key that will be used to pay the current
    * miner in future blocks.
    * @returns {boolean}
    */
    is_coinbase() {
        const ret = wasm.transaction_is_coinbase(this.ptr);
        return ret !== 0;
    }
    /**
    * Recompute and finalize the tx id based on updated tx fields
    */
    finalize() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transaction_finalize(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Returns the transaction ID
    * @returns {string}
    */
    get id() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transaction_id(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {any} js_value
    */
    constructor(js_value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transaction_constructor(retptr, addHeapObject(js_value));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Transaction.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Array<any>}
    */
    get inputs() {
        const ret = wasm.transaction_get_inputs_as_js_array(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {any} js_value
    */
    set inputs(js_value) {
        try {
            wasm.transaction_set_inputs_from_js_array(this.ptr, addBorrowedObject(js_value));
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
    * @returns {Array<any>}
    */
    get outputs() {
        const ret = wasm.transaction_get_outputs_as_js_array(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {any} js_value
    */
    set outputs(js_value) {
        try {
            wasm.transaction_set_outputs_from_js_array(this.ptr, addBorrowedObject(js_value));
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
    * @returns {number}
    */
    get version() {
        const ret = wasm.transaction_version(this.ptr);
        return ret;
    }
    /**
    * @param {number} v
    */
    set version(v) {
        wasm.transaction_set_version(this.ptr, v);
    }
    /**
    * @returns {bigint}
    */
    get lock_time() {
        const ret = wasm.transaction_gas(this.ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} v
    */
    set lock_time(v) {
        wasm.transaction_set_gas(this.ptr, v);
    }
    /**
    * @returns {bigint}
    */
    get gas() {
        const ret = wasm.transaction_gas(this.ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} v
    */
    set gas(v) {
        wasm.transaction_set_gas(this.ptr, v);
    }
    /**
    * @returns {string}
    */
    get subnetworkId() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transaction_get_subnetwork_id_as_hex(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {any} js_value
    */
    set subnetworkId(js_value) {
        wasm.transaction_set_subnetwork_id_from_js_value(this.ptr, addHeapObject(js_value));
    }
    /**
    * @returns {string}
    */
    get payload() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transaction_get_payload_as_hex_string(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {any} js_value
    */
    set payload(js_value) {
        wasm.transaction_set_payload_from_js_value(this.ptr, addHeapObject(js_value));
    }
}
module.exports.Transaction = Transaction;
/**
* Represents a Kaspa transaction input
*/
class TransactionInput {

    static __wrap(ptr) {
        const obj = Object.create(TransactionInput.prototype);
        obj.ptr = ptr;

        return obj;
    }

    toJSON() {
        return {
            previousOutpoint: this.previousOutpoint,
            signatureScript: this.signatureScript,
            sequence: this.sequence,
            sigOpCount: this.sigOpCount,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    [inspect.custom]() {
        return Object.assign(Object.create({constructor: this.constructor}), this.toJSON());
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactioninput_free(ptr);
    }
    /**
    * @param {any} js_value
    */
    constructor(js_value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactioninput_constructor(retptr, addHeapObject(js_value));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return TransactionInput.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {TransactionOutpoint}
    */
    get previousOutpoint() {
        const ret = wasm.transactioninput_get_previous_outpoint(this.ptr);
        return TransactionOutpoint.__wrap(ret);
    }
    /**
    * @param {any} js_value
    */
    set previousOutpoint(js_value) {
        wasm.transactioninput_set_previous_outpoint(this.ptr, addHeapObject(js_value));
    }
    /**
    * @returns {string}
    */
    get signatureScript() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactioninput_get_signature_script_as_hex(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {any} js_value
    */
    set signatureScript(js_value) {
        wasm.transactioninput_set_signature_script_from_js_value(this.ptr, addHeapObject(js_value));
    }
    /**
    * @returns {bigint}
    */
    get sequence() {
        const ret = wasm.transactioninput_get_sequence(this.ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} sequence
    */
    set sequence(sequence) {
        wasm.transactioninput_set_sequence(this.ptr, sequence);
    }
    /**
    * @returns {number}
    */
    get sigOpCount() {
        const ret = wasm.transactioninput_get_sig_op_count(this.ptr);
        return ret;
    }
    /**
    * @param {number} sig_op_count
    */
    set sigOpCount(sig_op_count) {
        wasm.transactioninput_set_sig_op_count(this.ptr, sig_op_count);
    }
}
module.exports.TransactionInput = TransactionInput;
/**
* Represents a Kaspa transaction outpoint
*/
class TransactionOutpoint {

    static __wrap(ptr) {
        const obj = Object.create(TransactionOutpoint.prototype);
        obj.ptr = ptr;

        return obj;
    }

    toJSON() {
        return {
            transactionId: this.transactionId,
            index: this.index,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    [inspect.custom]() {
        return Object.assign(Object.create({constructor: this.constructor}), this.toJSON());
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionoutpoint_free(ptr);
    }
    /**
    * @param {string} transaction_id
    * @param {number} index
    */
    constructor(transaction_id, index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(transaction_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.transactionoutpoint_new(retptr, ptr0, len0, index);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return TransactionOutpoint.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {string}
    */
    get transactionId() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionoutpoint_transactionId(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} transaction_id
    */
    set transactionId(transaction_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(transaction_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.transactionoutpoint_set_transactionId(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {number}
    */
    get index() {
        const ret = wasm.transactionoutpoint_index(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    */
    set index(index) {
        wasm.transactionoutpoint_set_index(this.ptr, index);
    }
}
module.exports.TransactionOutpoint = TransactionOutpoint;
/**
* Represents a Kaspad transaction output
*/
class TransactionOutput {

    static __wrap(ptr) {
        const obj = Object.create(TransactionOutput.prototype);
        obj.ptr = ptr;

        return obj;
    }

    toJSON() {
        return {
            value: this.value,
            scriptPublicKey: this.scriptPublicKey,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    [inspect.custom]() {
        return Object.assign(Object.create({constructor: this.constructor}), this.toJSON());
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionoutput_free(ptr);
    }
    /**
    * TransactionOutput constructor
    * @param {bigint} value
    * @param {ScriptPublicKey} script_public_key
    */
    constructor(value, script_public_key) {
        _assertClass(script_public_key, ScriptPublicKey);
        const ret = wasm.transactionoutput_new(value, script_public_key.ptr);
        return TransactionOutput.__wrap(ret);
    }
    /**
    * @returns {bigint}
    */
    get value() {
        const ret = wasm.transactionoutput_value(this.ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} v
    */
    set value(v) {
        wasm.transactionoutput_set_value(this.ptr, v);
    }
    /**
    * @returns {ScriptPublicKey}
    */
    get scriptPublicKey() {
        const ret = wasm.transactionoutput_scriptPublicKey(this.ptr);
        return ScriptPublicKey.__wrap(ret);
    }
    /**
    * @param {ScriptPublicKey} v
    */
    set scriptPublicKey(v) {
        _assertClass(v, ScriptPublicKey);
        wasm.transactionoutput_set_scriptPublicKey(this.ptr, v.ptr);
    }
    /**
    * @returns {boolean}
    */
    isDust() {
        const ret = wasm.transactionoutput_isDust(this.ptr);
        return ret !== 0;
    }
}
module.exports.TransactionOutput = TransactionOutput;
/**
*/
class TransactionOutputInner {

    toJSON() {
        return {
            value: this.value,
            scriptPublicKey: this.scriptPublicKey,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    [inspect.custom]() {
        return Object.assign(Object.create({constructor: this.constructor}), this.toJSON());
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionoutputinner_free(ptr);
    }
    /**
    * @returns {bigint}
    */
    get value() {
        const ret = wasm.__wbg_get_transactionoutputinner_value(this.ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} arg0
    */
    set value(arg0) {
        wasm.__wbg_set_transactionoutputinner_value(this.ptr, arg0);
    }
    /**
    * @returns {ScriptPublicKey}
    */
    get scriptPublicKey() {
        const ret = wasm.__wbg_get_transactionoutputinner_scriptPublicKey(this.ptr);
        return ScriptPublicKey.__wrap(ret);
    }
    /**
    * @param {ScriptPublicKey} arg0
    */
    set scriptPublicKey(arg0) {
        _assertClass(arg0, ScriptPublicKey);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_transactionoutputinner_scriptPublicKey(this.ptr, ptr0);
    }
}
module.exports.TransactionOutputInner = TransactionOutputInner;
/**
* Holds details about an individual transaction output in a utxo
* set such as whether or not it was contained in a coinbase tx, the daa
* score of the block that accepts the tx, its public key script, and how
* much it pays.
*/
class TxUtxoEntry {

    static __wrap(ptr) {
        const obj = Object.create(TxUtxoEntry.prototype);
        obj.ptr = ptr;

        return obj;
    }

    toJSON() {
        return {
            amount: this.amount,
            scriptPublicKey: this.scriptPublicKey,
            blockDaaScore: this.blockDaaScore,
            isCoinbase: this.isCoinbase,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    [inspect.custom]() {
        return Object.assign(Object.create({constructor: this.constructor}), this.toJSON());
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_txutxoentry_free(ptr);
    }
    /**
    * @returns {bigint}
    */
    get amount() {
        const ret = wasm.__wbg_get_txutxoentry_amount(this.ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} arg0
    */
    set amount(arg0) {
        wasm.__wbg_set_txutxoentry_amount(this.ptr, arg0);
    }
    /**
    * @returns {ScriptPublicKey}
    */
    get scriptPublicKey() {
        const ret = wasm.__wbg_get_txutxoentry_scriptPublicKey(this.ptr);
        return ScriptPublicKey.__wrap(ret);
    }
    /**
    * @param {ScriptPublicKey} arg0
    */
    set scriptPublicKey(arg0) {
        _assertClass(arg0, ScriptPublicKey);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_txutxoentry_scriptPublicKey(this.ptr, ptr0);
    }
    /**
    * @returns {bigint}
    */
    get blockDaaScore() {
        const ret = wasm.__wbg_get_txutxoentry_blockDaaScore(this.ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} arg0
    */
    set blockDaaScore(arg0) {
        wasm.__wbg_set_txutxoentry_blockDaaScore(this.ptr, arg0);
    }
    /**
    * @returns {boolean}
    */
    get isCoinbase() {
        const ret = wasm.__wbg_get_txutxoentry_isCoinbase(this.ptr);
        return ret !== 0;
    }
    /**
    * @param {boolean} arg0
    */
    set isCoinbase(arg0) {
        wasm.__wbg_set_txutxoentry_isCoinbase(this.ptr, arg0);
    }
}
module.exports.TxUtxoEntry = TxUtxoEntry;
/**
*/
class TxUtxoEntryList {

    static __wrap(ptr) {
        const obj = Object.create(TxUtxoEntryList.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_txutxoentrylist_free(ptr);
    }
}
module.exports.TxUtxoEntryList = TxUtxoEntryList;
/**
*/
class Uint192 {

    static __wrap(ptr) {
        const obj = Object.create(Uint192.prototype);
        obj.ptr = ptr;

        return obj;
    }

    toJSON() {
        return {
            value: this.value,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    [inspect.custom]() {
        return Object.assign(Object.create({constructor: this.constructor}), this.toJSON());
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_uint192_free(ptr);
    }
    /**
    * @param {bigint} n
    */
    constructor(n) {
        const ret = wasm.uint192_new(n);
        return Uint192.__wrap(ret);
    }
    /**
    * @param {string} hex
    * @returns {Uint192}
    */
    static fromHex(hex) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.uint192_fromHex(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Uint192.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {bigint}
    */
    toBigInt() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.uint192_toBigInt(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {bigint}
    */
    get value() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.uint192_toBigInt(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.Uint192 = Uint192;
/**
*/
class Uint256 {

    static __wrap(ptr) {
        const obj = Object.create(Uint256.prototype);
        obj.ptr = ptr;

        return obj;
    }

    toJSON() {
        return {
            value: this.value,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    [inspect.custom]() {
        return Object.assign(Object.create({constructor: this.constructor}), this.toJSON());
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_uint256_free(ptr);
    }
    /**
    * @param {bigint} n
    */
    constructor(n) {
        const ret = wasm.uint256_new(n);
        return Uint256.__wrap(ret);
    }
    /**
    * @param {string} hex
    * @returns {Uint256}
    */
    static fromHex(hex) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.uint256_fromHex(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Uint256.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {bigint}
    */
    toBigInt() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.uint256_toBigInt(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {bigint}
    */
    get value() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.uint256_toBigInt(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.Uint256 = Uint256;
/**
*/
class UtxoEntries {

    static __wrap(ptr) {
        const obj = Object.create(UtxoEntries.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_utxoentries_free(ptr);
    }
    /**
    * @param {any} js_value
    */
    constructor(js_value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.utxoentries_js_ctor(retptr, addHeapObject(js_value));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return UtxoEntries.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {any}
    */
    get items() {
        const ret = wasm.utxoentries_get_items_as_js_array(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {any} js_value
    */
    set items(js_value) {
        try {
            wasm.utxoentries_set_items_from_js_array(this.ptr, addBorrowedObject(js_value));
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
}
module.exports.UtxoEntries = UtxoEntries;
/**
*/
class UtxoEntry {

    static __wrap(ptr) {
        const obj = Object.create(UtxoEntry.prototype);
        obj.ptr = ptr;

        return obj;
    }

    toJSON() {
        return {
            address: this.address,
            outpoint: this.outpoint,
            entry: this.entry,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    [inspect.custom]() {
        return Object.assign(Object.create({constructor: this.constructor}), this.toJSON());
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_utxoentry_free(ptr);
    }
    /**
    * @returns {Address | undefined}
    */
    get address() {
        const ret = wasm.__wbg_get_utxoentry_address(this.ptr);
        return ret === 0 ? undefined : Address.__wrap(ret);
    }
    /**
    * @param {Address | undefined} arg0
    */
    set address(arg0) {
        let ptr0 = 0;
        if (!isLikeNone(arg0)) {
            _assertClass(arg0, Address);
            ptr0 = arg0.__destroy_into_raw();
        }
        wasm.__wbg_set_utxoentry_address(this.ptr, ptr0);
    }
    /**
    * @returns {TransactionOutpoint}
    */
    get outpoint() {
        const ret = wasm.__wbg_get_utxoentry_outpoint(this.ptr);
        return TransactionOutpoint.__wrap(ret);
    }
    /**
    * @param {TransactionOutpoint} arg0
    */
    set outpoint(arg0) {
        _assertClass(arg0, TransactionOutpoint);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_utxoentry_outpoint(this.ptr, ptr0);
    }
    /**
    * @returns {TxUtxoEntry}
    */
    get entry() {
        const ret = wasm.__wbg_get_utxoentry_entry(this.ptr);
        return TxUtxoEntry.__wrap(ret);
    }
    /**
    * @param {TxUtxoEntry} arg0
    */
    set entry(arg0) {
        _assertClass(arg0, TxUtxoEntry);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_utxoentry_entry(this.ptr, ptr0);
    }
}
module.exports.UtxoEntry = UtxoEntry;

class UtxoEntryList {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_utxoentrylist_free(ptr);
    }
    /**
    * @param {any} js_value
    */
    constructor(js_value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.utxoentrylist_js_ctor(retptr, addHeapObject(js_value));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return TxUtxoEntryList.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {any}
    */
    get items() {
        const ret = wasm.utxoentrylist_get_items_as_js_array(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {any} js_value
    */
    set items(js_value) {
        try {
            wasm.utxoentrylist_set_items_from_js_array(this.ptr, addBorrowedObject(js_value));
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
}
module.exports.UtxoEntryList = UtxoEntryList;
/**
*/
class UtxoEntryReference {

    static __wrap(ptr) {
        const obj = Object.create(UtxoEntryReference.prototype);
        obj.ptr = ptr;

        return obj;
    }

    toJSON() {
        return {
            data: this.data,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    [inspect.custom]() {
        return Object.assign(Object.create({constructor: this.constructor}), this.toJSON());
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_utxoentryreference_free(ptr);
    }
    /**
    * @returns {string}
    */
    __getClassname() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.utxoentryreference___getClassname(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {UtxoEntry}
    */
    get data() {
        const ret = wasm.utxoentryreference_data(this.ptr);
        return UtxoEntry.__wrap(ret);
    }
}
module.exports.UtxoEntryReference = UtxoEntryReference;
/**
* a collection of UTXO entries
*/
class UtxoSet {

    static __wrap(ptr) {
        const obj = Object.create(UtxoSet.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_utxoset_free(ptr);
    }
    /**
    * @param {UtxoEntryReference} utxo_entry
    */
    insert(utxo_entry) {
        _assertClass(utxo_entry, UtxoEntryReference);
        var ptr0 = utxo_entry.__destroy_into_raw();
        wasm.utxoset_insert(this.ptr, ptr0);
    }
    /**
    * @param {bigint} transaction_amount
    * @param {number} order
    * @returns {Promise<SelectionContext>}
    */
    select(transaction_amount, order) {
        const ret = wasm.utxoset_select(this.ptr, transaction_amount, order);
        return takeObject(ret);
    }
    /**
    * @param {any} js_value
    * @returns {UtxoSet}
    */
    static from(js_value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.utxoset_from(retptr, addHeapObject(js_value));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return UtxoSet.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.UtxoSet = UtxoSet;
/**
* `VirtualTransaction` envelops a collection of multiple related `kaspa_wallet_core::MutableTransaction` instances.
*/
class VirtualTransaction {

    static __wrap(ptr) {
        const obj = Object.create(VirtualTransaction.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_virtualtransaction_free(ptr);
    }
    /**
    * @param {SelectionContext} utxo_selection
    * @param {PaymentOutputs} outputs
    * @param {Address} change_address
    * @param {Uint8Array} payload
    */
    constructor(utxo_selection, outputs, change_address, payload) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(utxo_selection, SelectionContext);
            var ptr0 = utxo_selection.__destroy_into_raw();
            _assertClass(outputs, PaymentOutputs);
            var ptr1 = outputs.__destroy_into_raw();
            _assertClass(change_address, Address);
            var ptr2 = change_address.__destroy_into_raw();
            const ptr3 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
            const len3 = WASM_VECTOR_LEN;
            wasm.virtualtransaction_new(retptr, ptr0, ptr1, ptr2, ptr3, len3);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return VirtualTransaction.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.VirtualTransaction = VirtualTransaction;
/**
* `Wallet` data structure
*/
class Wallet {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wallet_free(ptr);
    }
}
module.exports.Wallet = Wallet;
/**
*/
class WalletAccountV0 {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_walletaccountv0_free(ptr);
    }
}
module.exports.WalletAccountV0 = WalletAccountV0;
/**
*/
class XPrivateKey {

    static __wrap(ptr) {
        const obj = Object.create(XPrivateKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_xprivatekey_free(ptr);
    }
    /**
    * @param {string} xprv
    * @param {boolean} is_multisig
    * @param {bigint} account_index
    */
    constructor(xprv, is_multisig, account_index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(xprv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.xprivatekey_new(retptr, ptr0, len0, is_multisig, account_index);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return XPrivateKey.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} index
    * @returns {PrivateKey}
    */
    receiveKey(index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.xprivatekey_receiveKey(retptr, this.ptr, index);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return PrivateKey.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} index
    * @returns {PrivateKey}
    */
    changeKey(index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.xprivatekey_changeKey(retptr, this.ptr, index);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return PrivateKey.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.XPrivateKey = XPrivateKey;
/**
*/
class XPrv {

    static __wrap(ptr) {
        const obj = Object.create(XPrv.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_xprv_free(ptr);
    }
    /**
    * @param {string} seed
    */
    constructor(seed) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.xprv_new(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return XPrv.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} chile_number
    * @param {boolean | undefined} hardened
    * @returns {XPrv}
    */
    deriveChild(chile_number, hardened) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.xprv_deriveChild(retptr, this.ptr, chile_number, isLikeNone(hardened) ? 0xFFFFFF : hardened ? 1 : 0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return XPrv.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {any} path
    * @returns {XPrv}
    */
    derivePath(path) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.xprv_derivePath(retptr, this.ptr, addHeapObject(path));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return XPrv.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} prefix
    * @returns {string}
    */
    intoString(prefix) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.xprv_intoString(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr1, len1);
        }
    }
    /**
    * @returns {XPub}
    */
    publicKey() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.xprv_publicKey(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return XPub.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.XPrv = XPrv;
/**
*/
class XPub {

    static __wrap(ptr) {
        const obj = Object.create(XPub.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_xpub_free(ptr);
    }
    /**
    * @param {string} xpub
    */
    constructor(xpub) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(xpub, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.xpub_new(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return XPub.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} chile_number
    * @param {boolean | undefined} hardened
    * @returns {XPub}
    */
    deriveChild(chile_number, hardened) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.xpub_deriveChild(retptr, this.ptr, chile_number, isLikeNone(hardened) ? 0xFFFFFF : hardened ? 1 : 0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return XPub.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {any} path
    * @returns {XPub}
    */
    derivePath(path) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.xpub_derivePath(retptr, this.ptr, addHeapObject(path));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return XPub.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} prefix
    * @returns {string}
    */
    intoString(prefix) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.xpub_intoString(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr1, len1);
        }
    }
}
module.exports.XPub = XPub;
/**
*/
class XPublicKey {

    static __wrap(ptr) {
        const obj = Object.create(XPublicKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_xpublickey_free(ptr);
    }
    /**
    * @param {string} xprv
    * @param {boolean} is_multisig
    * @param {bigint} account_index
    * @returns {Promise<XPublicKey>}
    */
    static fromXPrv(xprv, is_multisig, account_index) {
        const ptr0 = passStringToWasm0(xprv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.xpublickey_fromXPrv(ptr0, len0, is_multisig, account_index);
        return takeObject(ret);
    }
    /**
    * @param {number} start
    * @param {number} end
    * @returns {Promise<any>}
    */
    receiveAddresses(start, end) {
        const ret = wasm.xpublickey_receiveAddresses(this.ptr, start, end);
        return takeObject(ret);
    }
    /**
    * @param {number} start
    * @param {number} end
    * @returns {Promise<any>}
    */
    changeAddresses(start, end) {
        const ret = wasm.xpublickey_changeAddresses(this.ptr, start, end);
        return takeObject(ret);
    }
}
module.exports.XPublicKey = XPublicKey;

module.exports.__wbindgen_bigint_get_as_i64 = function(arg0, arg1) {
    const v = getObject(arg1);
    const ret = typeof(v) === 'bigint' ? v : undefined;
    getBigInt64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? BigInt(0) : ret;
    getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
};

module.exports.__wbindgen_debug_string = function(arg0, arg1) {
    const ret = debugString(getObject(arg1));
    const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

module.exports.__wbindgen_memory = function() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};

module.exports.__wbg_get_27fe3dac1c4d0224 = function(arg0, arg1) {
    const ret = getObject(arg0)[arg1 >>> 0];
    return addHeapObject(ret);
};

module.exports.__wbg_length_e498fbc24f9c1d4f = function(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

module.exports.__wbg_new_b525de17f44a8943 = function() {
    const ret = new Array();
    return addHeapObject(ret);
};

module.exports.__wbindgen_number_new = function(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
};

module.exports.__wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

module.exports.__wbindgen_is_function = function(arg0) {
    const ret = typeof(getObject(arg0)) === 'function';
    return ret;
};

module.exports.__wbg_newnoargs_2b8b6bd7753c76ba = function(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

module.exports.__wbindgen_is_object = function(arg0) {
    const val = getObject(arg0);
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

module.exports.__wbg_next_b7d530c04fd8b217 = function(arg0) {
    const ret = getObject(arg0).next;
    return addHeapObject(ret);
};

module.exports.__wbg_next_88560ec06a094dea = function() { return handleError(function (arg0) {
    const ret = getObject(arg0).next();
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_done_1ebec03bbd919843 = function(arg0) {
    const ret = getObject(arg0).done;
    return ret;
};

module.exports.__wbg_value_6ac8da5cc5b3efda = function(arg0) {
    const ret = getObject(arg0).value;
    return addHeapObject(ret);
};

module.exports.__wbg_iterator_55f114446221aa5a = function() {
    const ret = Symbol.iterator;
    return addHeapObject(ret);
};

module.exports.__wbg_get_baf4855f9a986186 = function() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_call_95d1ea488d03e4e8 = function() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_new_f9876326328f45ed = function() {
    const ret = new Object();
    return addHeapObject(ret);
};

module.exports.__wbindgen_is_string = function(arg0) {
    const ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

module.exports.__wbindgen_number_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'number' ? obj : undefined;
    getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
    getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
};

module.exports.__wbindgen_string_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbindgen_string_new = function(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

module.exports.__wbindgen_object_clone_ref = function(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_self_e7c1f827057f6584 = function() { return handleError(function () {
    const ret = self.self;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_window_a09ec664e14b1b81 = function() { return handleError(function () {
    const ret = window.window;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_globalThis_87cbb8506fecf3a9 = function() { return handleError(function () {
    const ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_global_c85a9259e621f3db = function() { return handleError(function () {
    const ret = global.global;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbindgen_is_undefined = function(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};

module.exports.__wbg_set_17224bc548dd1d7b = function(arg0, arg1, arg2) {
    getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
};

module.exports.__wbg_from_67ca20fa722467e6 = function(arg0) {
    const ret = Array.from(getObject(arg0));
    return addHeapObject(ret);
};

module.exports.__wbg_isArray_39d28997bf6b96b4 = function(arg0) {
    const ret = Array.isArray(getObject(arg0));
    return ret;
};

module.exports.__wbg_push_49c286f04dd3bf59 = function(arg0, arg1) {
    const ret = getObject(arg0).push(getObject(arg1));
    return ret;
};

module.exports.__wbg_instanceof_ArrayBuffer_a69f02ee4c4f5065 = function(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof ArrayBuffer;
    } catch {
        result = false;
    }
    const ret = result;
    return ret;
};

module.exports.__wbg_BigInt_5584c686fbfa65cf = function() { return handleError(function (arg0) {
    const ret = BigInt(getObject(arg0));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_toString_cec163b212643722 = function(arg0) {
    const ret = getObject(arg0).toString();
    return addHeapObject(ret);
};

module.exports.__wbg_call_9495de66fdbe016b = function() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_call_96878afb7a8201ca = function() { return handleError(function (arg0, arg1, arg2, arg3) {
    const ret = getObject(arg0).call(getObject(arg1), getObject(arg2), getObject(arg3));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_isSafeInteger_8c4789029e885159 = function(arg0) {
    const ret = Number.isSafeInteger(getObject(arg0));
    return ret;
};

module.exports.__wbg_entries_4e1315b774245952 = function(arg0) {
    const ret = Object.entries(getObject(arg0));
    return addHeapObject(ret);
};

module.exports.__wbg_hasOwn_5fa448ea857c8580 = function(arg0, arg1) {
    const ret = Object.hasOwn(getObject(arg0), getObject(arg1));
    return ret;
};

module.exports.__wbg_new_9d3a9ce4282a18a8 = function(arg0, arg1) {
    try {
        var state0 = {a: arg0, b: arg1};
        var cb0 = (arg0, arg1) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return __wbg_adapter_114(a, state0.b, arg0, arg1);
            } finally {
                state0.a = a;
            }
        };
        const ret = new Promise(cb0);
        return addHeapObject(ret);
    } finally {
        state0.a = state0.b = 0;
    }
};

module.exports.__wbg_resolve_fd40f858d9db1a04 = function(arg0) {
    const ret = Promise.resolve(getObject(arg0));
    return addHeapObject(ret);
};

module.exports.__wbg_then_ec5db6d509eb475f = function(arg0, arg1) {
    const ret = getObject(arg0).then(getObject(arg1));
    return addHeapObject(ret);
};

module.exports.__wbg_buffer_cf65c07de34b9a08 = function(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

module.exports.__wbg_newwithbyteoffsetandlength_9fb2f11355ecadf5 = function(arg0, arg1, arg2) {
    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

module.exports.__wbg_new_537b7341ce90bb31 = function(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

module.exports.__wbg_set_17499e8aa4003ebd = function(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

module.exports.__wbg_length_27a2afe8ab42b09f = function(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

module.exports.__wbg_instanceof_Uint8Array_01cebe79ca606cca = function(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Uint8Array;
    } catch {
        result = false;
    }
    const ret = result;
    return ret;
};

module.exports.__wbg_newwithlength_b56c882b57805732 = function(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};

module.exports.__wbg_subarray_7526649b91a252a6 = function(arg0, arg1, arg2) {
    const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

module.exports.__wbg_getRandomValues_3774744e221a22ad = function() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };

module.exports.__wbg_randomFillSync_e950366c42764a07 = function() { return handleError(function (arg0, arg1) {
    getObject(arg0).randomFillSync(takeObject(arg1));
}, arguments) };

module.exports.__wbg_crypto_70a96de3b6b73dac = function(arg0) {
    const ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

module.exports.__wbg_process_dd1577445152112e = function(arg0) {
    const ret = getObject(arg0).process;
    return addHeapObject(ret);
};

module.exports.__wbg_versions_58036bec3add9e6f = function(arg0) {
    const ret = getObject(arg0).versions;
    return addHeapObject(ret);
};

module.exports.__wbg_node_6a9d28205ed5b0d8 = function(arg0) {
    const ret = getObject(arg0).node;
    return addHeapObject(ret);
};

module.exports.__wbg_msCrypto_adbc770ec9eca9c7 = function(arg0) {
    const ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

module.exports.__wbg_require_f05d779769764e82 = function() { return handleError(function () {
    const ret = module.require;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_apply_5435e78b95a524a6 = function() { return handleError(function (arg0, arg1, arg2) {
    const ret = Reflect.apply(getObject(arg0), getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_set_6aa458a4ebdb65cb = function() { return handleError(function (arg0, arg1, arg2) {
    const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
    return ret;
}, arguments) };

module.exports.__wbindgen_is_bigint = function(arg0) {
    const ret = typeof(getObject(arg0)) === 'bigint';
    return ret;
};

module.exports.__wbindgen_bigint_from_u64 = function(arg0) {
    const ret = BigInt.asUintN(64, arg0);
    return addHeapObject(ret);
};

module.exports.__wbindgen_jsval_eq = function(arg0, arg1) {
    const ret = getObject(arg0) === getObject(arg1);
    return ret;
};

module.exports.__wbindgen_cb_drop = function(arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    const ret = false;
    return ret;
};

module.exports.__wbg_innerHTML_7356669f2f5a2c18 = function(arg0, arg1) {
    const ret = getObject(arg1).innerHTML;
    const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbg_setinnerHTML_76167cda24d9b96b = function(arg0, arg1, arg2) {
    getObject(arg0).innerHTML = getStringFromWasm0(arg1, arg2);
};

module.exports.__wbg_removeAttribute_ad7a5bf2eed30373 = function() { return handleError(function (arg0, arg1, arg2) {
    getObject(arg0).removeAttribute(getStringFromWasm0(arg1, arg2));
}, arguments) };

module.exports.__wbg_setAttribute_79c9562d32d05e66 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

module.exports.__wbg_appendChild_b8199dc1655c852d = function() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).appendChild(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_instanceof_Window_e266f02eee43b570 = function(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Window;
    } catch {
        result = false;
    }
    const ret = result;
    return ret;
};

module.exports.__wbg_now_c644db5194be8437 = function(arg0) {
    const ret = getObject(arg0).now();
    return ret;
};

module.exports.__wbg_document_950215a728589a2d = function(arg0) {
    const ret = getObject(arg0).document;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

module.exports.__wbg_body_be46234bb33edd63 = function(arg0) {
    const ret = getObject(arg0).body;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

module.exports.__wbg_createElement_e2a0e21263eb5416 = function() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_error_ca426489ad8f13ff = function(arg0, arg1) {
    try {
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(arg0, arg1);
    }
};

module.exports.__wbg_new_172c2582c7cb7db5 = function() {
    const ret = new Error();
    return addHeapObject(ret);
};

module.exports.__wbg_stack_3cd38b7e2bb55ce3 = function(arg0, arg1) {
    const ret = getObject(arg1).stack;
    const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbg_String_91fba7ded13ba54c = function(arg0, arg1) {
    const ret = String(getObject(arg1));
    const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbindgen_error_new = function(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

module.exports.__wbindgen_boolean_get = function(arg0) {
    const v = getObject(arg0);
    const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
    return ret;
};

module.exports.__wbindgen_is_array = function(arg0) {
    const ret = Array.isArray(getObject(arg0));
    return ret;
};

module.exports.__wbg_address_new = function(arg0) {
    const ret = Address.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbindgen_is_falsy = function(arg0) {
    const ret = !getObject(arg0);
    return ret;
};

module.exports.__wbg_uint256_new = function(arg0) {
    const ret = Uint256.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_txutxoentry_new = function(arg0) {
    const ret = TxUtxoEntry.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_setTimeout_75cb9b6991a4031d = function() { return handleError(function (arg0, arg1) {
    const ret = setTimeout(getObject(arg0), arg1);
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_clearTimeout_76877dbc010e786d = function(arg0) {
    const ret = clearTimeout(takeObject(arg0));
    return addHeapObject(ret);
};

module.exports.__wbg_log_c5e20a54f20cb2d3 = function(arg0, arg1) {
    console.log(getStringFromWasm0(arg0, arg1));
};

module.exports.__wbindgen_bigint_from_i64 = function(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
};

module.exports.__wbindgen_bigint_from_u128 = function(arg0, arg1) {
    const ret = BigInt.asUintN(64, arg0) << BigInt(64) | BigInt.asUintN(64, arg1);
    return addHeapObject(ret);
};

module.exports.__wbg_getwithrefkey_15c62c2b8546208d = function(arg0, arg1) {
    const ret = getObject(arg0)[getObject(arg1)];
    return addHeapObject(ret);
};

module.exports.__wbg_set_20cbc34131e76824 = function(arg0, arg1, arg2) {
    getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
};

module.exports.__wbindgen_jsval_loose_eq = function(arg0, arg1) {
    const ret = getObject(arg0) == getObject(arg1);
    return ret;
};

module.exports.__wbindgen_in = function(arg0, arg1) {
    const ret = getObject(arg0) in getObject(arg1);
    return ret;
};

module.exports.__wbg_setonopen_b91a933a10be7d48 = function(arg0, arg1) {
    getObject(arg0).onopen = getObject(arg1);
};

module.exports.__wbg_setonerror_a6a7413fc33449ef = function(arg0, arg1) {
    getObject(arg0).onerror = getObject(arg1);
};

module.exports.__wbg_setonclose_eab2638c55817c51 = function(arg0, arg1) {
    getObject(arg0).onclose = getObject(arg1);
};

module.exports.__wbg_setonmessage_5ea7e452fd7a5544 = function(arg0, arg1) {
    getObject(arg0).onmessage = getObject(arg1);
};

module.exports.__wbg_setbinaryType_c9b2fa398c277601 = function(arg0, arg1) {
    getObject(arg0).binaryType = takeObject(arg1);
};

module.exports.__wbg_new_8ad026ef33da9ab1 = function() { return handleError(function (arg0, arg1) {
    const ret = new WebSocket(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_close_546591d4b4350b36 = function() { return handleError(function (arg0) {
    getObject(arg0).close();
}, arguments) };

module.exports.__wbg_send_36f8bcb566f8afa0 = function() { return handleError(function (arg0, arg1, arg2) {
    getObject(arg0).send(getStringFromWasm0(arg1, arg2));
}, arguments) };

module.exports.__wbg_send_c1c0838681688262 = function() { return handleError(function (arg0, arg1, arg2) {
    getObject(arg0).send(getArrayU8FromWasm0(arg1, arg2));
}, arguments) };

module.exports.__wbg_log_3c28499e191de9c9 = function(arg0, arg1) {
    console.log(getStringFromWasm0(arg0, arg1));
};

module.exports.__wbg_warn_4c7424f622fc320d = function(arg0, arg1) {
    console.warn(getStringFromWasm0(arg0, arg1));
};

module.exports.__wbg_error_05d0092975a19b61 = function(arg0, arg1) {
    console.error(getStringFromWasm0(arg0, arg1));
};

module.exports.__wbg_isnodejs_fe13f21a8144b4ff = function(arg0) {
    const ret = getObject(arg0).is_node_js;
    return ret;
};

module.exports.__wbg_isnodewebkit_d4324d72606b18f5 = function(arg0) {
    const ret = getObject(arg0).is_node_webkit;
    return ret;
};

module.exports.__wbg_data_af909e5dfe73e68c = function(arg0) {
    const ret = getObject(arg0).data;
    return addHeapObject(ret);
};

module.exports.__wbg_transactionoutput_new = function(arg0) {
    const ret = TransactionOutput.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_utxoentry_new = function(arg0) {
    const ret = UtxoEntry.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_transactioninput_new = function(arg0) {
    const ret = TransactionInput.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_utxoentryreference_new = function(arg0) {
    const ret = UtxoEntryReference.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_selectioncontext_new = function(arg0) {
    const ret = SelectionContext.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_xpublickey_new = function(arg0) {
    const ret = XPublicKey.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbindgen_closure_wrapper1191 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 162, __wbg_adapter_54);
    return addHeapObject(ret);
};

module.exports.__wbindgen_closure_wrapper2185 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 468, __wbg_adapter_57);
    return addHeapObject(ret);
};

module.exports.__wbindgen_closure_wrapper3837 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 955, __wbg_adapter_60);
    return addHeapObject(ret);
};

module.exports.__wbindgen_closure_wrapper3838 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 955, __wbg_adapter_60);
    return addHeapObject(ret);
};

module.exports.__wbindgen_closure_wrapper3839 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 955, __wbg_adapter_65);
    return addHeapObject(ret);
};

module.exports.__wbindgen_closure_wrapper3840 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 955, __wbg_adapter_60);
    return addHeapObject(ret);
};

const path = require('path').join(__dirname, 'kaspa_wasm_bg.wasm');
const bytes = require('fs').readFileSync(path);

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;

