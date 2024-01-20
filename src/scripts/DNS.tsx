/* eslint-disable no-constant-condition */
import { NS } from "@ns";
import { DNSPayload } from "classes/DnsPayload";
import { CONSTANTS } from "constants/Constants";
import { WriteResponse } from "lib/JCP";
import type React_Type from 'react';
import renderCustomModal from 'models/ReactModels';
import { PortRegistry } from "interfaces/PortRegistry";
declare let React: typeof React_Type;
const portRegistry: PortRegistry = {};

export async function main(ns: NS): Promise<void> {
    const portHandle = ns.getPortHandle(CONSTANTS.DNSPORT);
    ns.tail()
    ns.atExit(()=>ns.closeTail())
    ns.clearLog();
    ns.clearPort(CONSTANTS.DNSPORT);
    while (true) {
        await portHandle.nextWrite();
        const portData = portHandle.read();
        const payload = DNSPayload.FromJson(portData.toString());
        let ResponsePort = 0;
        // Determine the type of request
        if (payload.RegistrationRequest) {
            const assignedPort = assignPort(payload);
            if(!assignedPort){
                continue;
            }
            ResponsePort = assignedPort
        } else {
            const queriedPort = findPortForScript(payload.ScriptName);
            if(!queriedPort){
                continue;
            }
            ResponsePort = queriedPort
            // Send back the queried port to the requesting script
        }
        payload.ResponsePort = ResponsePort
        WriteResponse(ns, payload)
        checkScriptActivity(ns);
        RenderModel(ns);
        ns.sleep(100);
    }
}

function assignPort(payload : DNSPayload): number | null {
    for (let port = 2; port <= 100; port++) {
        if (!portRegistry[port]) {
            payload.ResponsePort = port
            portRegistry[port] = payload;
            return port;
        }
    }
    return null;
}

function findPortForScript(scriptName: string): number | null {
    for (const port in portRegistry) {
        if (portRegistry[port].ScriptName === scriptName) {
            return parseInt(port);
        }
    }
    return null;
}

function checkScriptActivity(ns: NS): void {
    for (const port in portRegistry) {
        const scriptInfo = portRegistry[port];
        if (!ns.isRunning(scriptInfo.PID)) {
            delete portRegistry[port];
        }
    }
}
function getActiveScriptsData(): DNSPayload[] {
    return Object.values(portRegistry);
}

function RenderModel(ns: NS) {
    renderCustomModal(ns,    
        <div style={{
            color: 'limegreen', // Classic green text
            backgroundColor: 'black', // Dark background
            fontFamily: 'monospace', // Monospace font
            padding: '10px', // Some padding around the modal content
            fontSize: '14px', // Standard font size, adjust as needed
            overflowY: 'auto' // Allow scrolling if content overflows
        }}>
            <h2 style={{
                borderBottom: '1px solid limegreen', // Underline for the title
                paddingBottom: '5px' // Spacing below the title
            }}>Registered Scripts</h2>
            <ul style={{
                listStyleType: 'none', // Remove bullet points
                paddingLeft: '0' // Align items to the left
            }}>
                {getActiveScriptsData().map((script: DNSPayload, index: number) => (
                    <li key={index} style={{
                        marginBottom: '5px', // Spacing between list items
                    }}>
                        {script.ScriptName} - Port: {script.ResponsePort}
                    </li>
                ))}
            </ul>
        </div>
    );
}