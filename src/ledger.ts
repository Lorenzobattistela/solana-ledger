"use strict";

import solana, { Connection } from "@solana/web3.js"
import Solana from "@ledgerhq/hw-app-solana";

import { transports } from "./lib/ledger-transport";

const defaultPath = "m/44'/60'/0'/0/0";

function waiter(duration: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
}

export class LedgerSigner implements solana.Signer {
    publicKey: solana.PublicKey;
    secretKey: Uint8Array;
    readonly path: string;
    readonly _solana: Promise<Solana>;
    provider: Connection;
    
    constructor(provider?: Connection, path?: string) {
        if(path == null) { path = defaultPath; }
        this.path = path;
        this.provider = provider;

        const transport = transports.hid;
        if(!transport) {
            throw new Error("No transport found");
        }

        this._solana = transport.create().then((transport) => {
            return new Solana(transport);
        }, (err) => {
            return Promise.reject(err);
        });
    }

    _retry<T = any>(callback: (solana: Solana) => Promise<T>, timeout?: number): Promise<T> {
        return new Promise(async (resolve, reject) => {
            if(timeout && timeout > 0) {
                setTimeout(() => {
                    reject(new Error("Timeout"));
                }, timeout);
            }

            const solana = await this._solana;

            for (let i = 0; i < 50; i++) {
                try {
                    const res = await callback(solana);
                    return resolve(res);
                } catch(error) {
                    if(error.id !== "TransportLocked") {
                        return reject(error);
                    }
                }
                await waiter(100);
            }
            return reject(new Error("Timeout"));
        })
    }

    async getAddress(): Promise<solana.PublicKey> {
        const sol = await this._solana;
        let buffer = await sol.getAddress(this.path);
        this.publicKey = new solana.PublicKey(buffer);
        return this.publicKey;
    }

    async signMessage(message: Uint8Array | string): Promise<string> {
        if(typeof(message) == 'string') {
            message = new TextEncoder().encode(message);
        }

        const msgHex : Buffer = Buffer.from(message);

        const sig = await this._retry((solana) => solana.signOffchainMessage(this.path, msgHex));
        const hexSig = sig.signature.toString('hex');
        return hexSig;
    }

    connect(provider: Connection): LedgerSigner{
        return new LedgerSigner(provider, this.path);
    }
}
