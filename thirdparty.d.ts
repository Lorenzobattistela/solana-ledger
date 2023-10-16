// declare module "@ledgerhq/hw-app-solana" {

// }

declare module "@ledgerhq/hw-transport-node-hid" {
    export class Transport {}
    export function create(): Promise<Transport>;
}

declare module "@ledgerhq/hw-transport-u2f" {
    export class Transport { }

    export function create(): Promise<Transport>;
}