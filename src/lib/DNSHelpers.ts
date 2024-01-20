import { NS } from "@ns";
import { DNSPayload } from "classes/DnsPayload";
import { CONSTANTS } from "constants/Constants";
import { WaitForResponse } from "lib/JCP";

export async function registerWithDNS(ns: NS, WhoAreYou?: string): Promise<DNSPayload | null> {
    const thisScript = ns.getRunningScript();
    if (!thisScript) {
        return null;
    }

    const fileName = WhoAreYou || thisScript.filename;
    const payload = new DNSPayload(fileName, thisScript.pid, true);

    return sendPayloadAndGetResponse(ns, payload);
}

export async function getPortForScript(ns: NS, script: string): Promise<DNSPayload | null> {
    const payload = new DNSPayload(script, 0, false);
    return sendPayloadAndGetResponse(ns, payload);
}


async function sendPayloadAndGetResponse(ns: NS, payload: DNSPayload, counter = 0): Promise<DNSPayload | null> {
    const portHandle = ns.getPortHandle(CONSTANTS.DNSPORT);
    portHandle.write(JSON.stringify(payload));

    const resp = await WaitForResponse<DNSPayload>(ns, payload);
    if (resp) {
        return resp;
    }

    if (counter >= CONSTANTS.DNSRetryLimit) {
        return null;
    }

    return sendPayloadAndGetResponse(ns, payload, counter + 1);
}