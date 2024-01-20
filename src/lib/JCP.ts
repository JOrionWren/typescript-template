import { NS } from "@ns";
import { CONSTANTS } from "constants/Constants";
import { IJCP } from "interfaces/IJCP";

export async function WaitForResponse<T extends IJCP>(ns: NS, payload: T): Promise<T | null> {
    const responseFile = `${CONSTANTS.ResponseDirectory}${payload.GUID}.txt`;
    let counter = 0;
    while (!ns.fileExists(responseFile)) {
        ns.print(`Waiting for response in file: ${responseFile}`);
        if (counter >= CONSTANTS.DNSRetryLimit) {
            ns.print(`Exceeded retry limit for file: ${responseFile}`);
            return null;
        }
        await ns.sleep(1000);
        counter++;
    }

    const response = JSON.parse(ns.read(responseFile));
    ns.rm(responseFile);
    return response;
}

export function WriteResponse<T extends IJCP>(ns: NS, payload: T,ResponseDirectory: string = CONSTANTS.ResponseDirectory) {
    const filePath = `${ResponseDirectory}${payload.GUID}.txt`;
    ns.write(filePath, JSON.stringify(payload), "w");
}