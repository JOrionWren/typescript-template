/* eslint-disable no-constant-condition */
import { NS } from "@ns";
import { registerWithDNS } from "lib/DNSHelpers";
import { ServerManagerConfig } from "config/ServerManagerConfig";
import { Identifiable } from "classes/wrapped/Identifiable";
import { BuyServerRequest } from "classes/BuyServerRequest";
import { UpgradeHomeServerRequest } from "classes/UpgradeHomeServerRequest";
import { MoneyRequest } from "classes/MoneyRequest";

const ActiveRequests: string[] = []
const ActiveRequestServer: BuyServerRequest[] = []
export async function main(ns: NS): Promise<void> {
  const response = await registerWithDNS(ns, ServerManagerConfig.Name)
  if(!response){
    ns.tprint(`${ServerManagerConfig.Name}: Failed to start.`);
    return;
  }
  if(!response.ResponsePort){
    ns.tprint(`${ServerManagerConfig.Name}: Failed to bind to a DNS port.`);
    return;
  }
  const PH = ns.getPortHandle(response.ResponsePort);
  while(true){
    while(!PH.empty()){
        const json = PH.read().toString();
        const Preliminary = JSON.parse(json) as Identifiable;
        if(Preliminary.IsType == typeof(BuyServerRequest)){
            const request = BuyServerRequest.FromJson(json);
            if(ns.getPurchasedServers().length == ns.getPurchasedServerLimit()){
                const ServerToUpgrade = await GetServerToUpgrade(ns);
                const Ratio = Math.log2(ns.getServer(ServerToUpgrade).maxRam)
                const CurrentTier = ServerManagerConfig.Tiers.findIndex(o => o == Ratio.toString())
                const NextTier = ServerManagerConfig.Tiers.length >= (CurrentTier + 1) ? ServerManagerConfig.Tiers[CurrentTier + 1] : "0";
                if(NextTier == "0"){
                    ns.tprint(`ServerManager was asked to purchase a server with request ${request}. All servers are at max. Bug?`);
                }
                const GB = Math.pow(2,Number.parseInt(NextTier));
                const BuyRequst = new MoneyRequest(ServerManagerConfig.Name,`Upgrading -  ${ServerToUpgrade} to ${GB}GB`,ns.getPurchasedServerUpgradeCost(ServerToUpgrade,GB),request.Priority)
                if(await BuyRequst.SendRequest(ns)){
                    ActiveRequests.push(BuyRequst.GUID);
                    ActiveRequestServer.push(BuyRequst)
                }
            }else{
                const BuyRequst = new MoneyRequest(ServerManagerConfig.Name,`Purchasing - ${ServerManagerConfig.DefaultServerNaming}${GetUnusedServerName(ns)}`,ns.getPurchasedServerCost(2),request.Priority)
                const resp = await BuyRequst.SendRequest(ns);
                if(resp){
                    ActiveRequests.push(BuyRequst.GUID);
                    ActiveRequestServer.push(BuyRequst);
                }
            }
        }else if(Preliminary.IsType == typeof(UpgradeHomeServerRequest)){
            const request = UpgradeHomeServerRequest.FromJson(json);
            const CoreRequest = new MoneyRequest(ServerManagerConfig.Name,"Home Server Upgrade",ns.singularity.getUpgradeHomeCoresCost() + ns.singularity.getUpgradeHomeRamCost(),request.Priority)
            if(await CoreRequest.SendRequest(ns)){
                ActiveRequests.push(CoreRequest.GUID)
            }
        }
    }
  }
}

async function GetServerToUpgrade(ns: NS) : Promise<string>{
    const ServerNames = ns.getPurchasedServers()
    let ServerToUpgrade = ""
    let LowestRam = Number.MAX_SAFE_INTEGER;
    for(const server in ServerNames){
        const maxRam = ns.getServer(server).maxRam;
        if(maxRam < LowestRam){
            LowestRam = maxRam;
            ServerToUpgrade = server;
        }
    }
    return ServerToUpgrade;
}

function GetUnusedServerName(ns: NS) {
    const numArray: number[] = [];
    for (const server of ns.getPurchasedServers()) {
        numArray.push(Number.parseInt(server.split("-")[1]));
    }
    numArray.sort((a, b) => a - b);

    const HighestNumberAllowed = ns.getPurchasedServerLimit();
    let missingNumber = 1;

    for (let i = 0; i < numArray.length; i++) {
        if (numArray[i] > missingNumber) {
            break;
        }
        if (numArray[i] === missingNumber) {
            missingNumber++;
        }
    }

    if (missingNumber > HighestNumberAllowed) {
        throw new Error("No available numbers within the limit");
    }

    return padNumber(missingNumber);
}

function padNumber(num: number) {
    return num.toString().padStart(2, '0');
}