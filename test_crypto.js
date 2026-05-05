async function test() {
    const keyPair = await crypto.subtle.generateKey(
        { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
        true, ["encrypt", "decrypt"]
    );
    const wrapKey = await crypto.subtle.generateKey(
        { name: "AES-KW", length: 256 }, true, ["wrapKey", "unwrapKey"]
    );
    try {
        const wrapped = await crypto.subtle.wrapKey("pkcs8", keyPair.privateKey, wrapKey, "AES-KW");
        console.log("Wrapped length:", wrapped.byteLength);
    } catch(err) {
        console.error("Wrap error:", err);
    }
}
test();
