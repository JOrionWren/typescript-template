import { NS } from "@ns";
import { getPortForScript, registerWithDNS } from "lib/DNSHelpers";

export async function main(ns: NS): Promise<void> {
    ns.tail()
    await ArePortsAligned(ns)
}

async function ArePortsAligned(ns : NS){
    const response = await registerWithDNS(ns);
    ns.print(JSON.stringify(response))
    if(response == null){
        ns.print("ArePortsAligned: Failed no response from DNS.")
        return;
    }
    const ts = ns.getRunningScript();
    if(!ts){
        return;
    }
    const GetMyPortNumber = await getPortForScript(ns,ts.filename)
    if(GetMyPortNumber?.ResponsePort != response?.ResponsePort){
        throw new Error("DNSTest failed: Dns ports do not align between Register / Query");
    }
    ns.print("ArePortsAligned: Passed")
}
