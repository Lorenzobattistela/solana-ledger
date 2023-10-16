import { Connection, PublicKey, Signer, Transaction } from "@solana/web3.js"
import Solana from "@ledgerhq/hw-app-solana";


export declare class LedgerSigner implements Signer {
    public publicKey: PublicKey;
    public secretKey: Uint8Array;

    readonly path: string;
    readonly _solana: Promise<Solana>;
    provider: Connection;

    constructor(provider?: Connection, path?: string);
    _retry<T = any>(callback: (solana: Solana) => Promise<T>, timeout?: number): Promise<T>;
    getAddress(): Promise<PublicKey>;
    signMessage(message: Uint8Array | string): Promise<string>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    connect(provider: Connection): Signer;
}