/* eslint-disable no-constant-condition */
import { NS } from "@ns";
import { registerWithDNS } from "lib/DNSHelpers";
import { Queue } from "classes/Queue";
import { MoneyRequest } from "classes/MoneyRequest";
import { MoneyManagerCfg } from "config/MoneyManagerConfig";
import { CONSTANTS } from "constants/Constants";
import { WriteResponse } from "lib/JCP";
import { Identifiable } from "classes/wrapped/Identifiable";
import { MoneySpent } from "classes/MoneySpent";
import renderCustomModal from 'models/ReactModels';
import type React_Type from 'react';
declare let React: typeof React_Type;

const ApprovedTransactions: string[] = []
let EarmarkedMoney = 0;

export async function main(ns: NS): Promise<void> {
    ns.tail();
    ns.atExit(()=>ns.closeTail())
    const response = await registerWithDNS(ns, MoneyManagerCfg.Name);
    const RequestsByPriority = new Map<number,Queue<MoneyRequest>>();
    if(!response){
        ns.tprint("MoneyManager cant talk to DNS. Is it down?")
        return;
    }
    if(response.ResponsePort == undefined){
        ns.tprint("Money manager didn't recieve a response port. Something broke.")
        return;
    }
    //Open port handle
    const PH = ns.getPortHandle(response.ResponsePort);
    while(true){
         while(!PH.empty()){
            const json = PH.read().toString();
            const Preliminary = JSON.parse(json) as Identifiable;
            if(Preliminary.IsType == typeof(MoneyRequest)){
                const request = MoneyRequest.FromJson(json);
                if(request.Cancel && RequestsByPriority.has(request.Priority)){
                    RequestsByPriority.get(request.Priority)?.removeElement(o => o.GUID == request.GUID);
                }
                if(!RequestsByPriority.has(request.Priority)){
                    RequestsByPriority.set(request.Priority,new Queue<MoneyRequest>())
                }
                RequestsByPriority.get(request.Priority)?.enqueue(request)
                
                if(!HandleMoneyRequest(ns,CONSTANTS.PRIORITY.HIGHEST,RequestsByPriority)){
                    continue;
                }
                if(!HandleMoneyRequest(ns,CONSTANTS.PRIORITY.HIGH,RequestsByPriority)){
                    continue;
                }
                if(!HandleMoneyRequest(ns,CONSTANTS.PRIORITY.NORMAL,RequestsByPriority)){
                    continue;
                }
                if(!HandleMoneyRequest(ns,CONSTANTS.PRIORITY.LOW,RequestsByPriority)){
                    continue;
                }
                if(!HandleMoneyRequest(ns,CONSTANTS.PRIORITY.LOWEST,RequestsByPriority)){
                    continue;
                }
            } else if(Preliminary.IsType == typeof(MoneySpent)){
                const request = MoneySpent.FromJson(json);
                const IsApproved = (ApprovedTransactions.filter(o => request.Request.GUID == o).length == 1)
                if(IsApproved){
                    EarmarkedMoney -= request.Request.Amount;
                }else{
                    ns.tprint("Money spent without asking.. Is there a rogue script?" + JSON.stringify(request))
                }
            }else{
                ns.tprint("Unrecognized json in MoneyManager. Is something conflicting with port?")
            }
        }
        RenderModel(ns,RequestsByPriority);
        await ns.sleep(500);
    }
}

function HandleMoneyRequest(ns: NS, Priority: number,container: Map<number,Queue<MoneyRequest>>) : boolean{
    const PlayerMoney = ns.getPlayer().money;
    const Money = Priority >= MoneyManagerCfg.ReserveMoneyPriorityLimit ? PlayerMoney : (PlayerMoney * (MoneyManagerCfg.ReserveMoney / 100)) - PlayerMoney
    const queue = container.get(Priority)
    if(!queue){
        return true;
    }

    while(!queue.isEmpty()){
        const next =  queue.peek();
        if(!next){
            queue.dequeue();
            continue;
        }
        if(next.Amount <= (Money - EarmarkedMoney)){
            const request = queue.dequeue();
            if(!request){
                continue;
            }
            ApprovedTransactions.push(request.GUID)
            EarmarkedMoney += request.Amount;
            WriteResponse(ns, request,CONSTANTS.MoneyResponseDirectory);
        }else{
            return false;
        }
    }
    return true;
}

function RenderModel(ns: NS,Requests:Map<number,Queue<MoneyRequest>>) {
  
    renderCustomModal(ns,    
        <div style={modalStyle}>
            <h2 style={titleStyle}>Money Requests</h2>
            {Object.entries(CONSTANTS.PRIORITY).map(([priorityName, priorityValue]) => (
                <div key={priorityName}>
                    <h3 style={priorityTitleStyle}>{priorityName}</h3>
                    <ul style={listStyle}>
                        {Requests.get(priorityValue)?.snag().map((request, index) => (
                            <li key={index} style={listItemStyle}>
                                {request.From}: Requesting {request.Amount} (For: {request.For})
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
  }

  const modalStyle: React.CSSProperties = {
    color: 'limegreen',
    backgroundColor: 'black',
    fontFamily: 'monospace',
    padding: '10px',
    fontSize: '14px',
    overflowY: 'auto'
  };
  
  const titleStyle = {
    borderBottom: '1px solid limegreen',
    paddingBottom: '5px'
  };
  
  const priorityTitleStyle = {
    color: 'lightgreen'
  };
  
  const listStyle = {
    listStyleType: 'none',
    paddingLeft: '0'
  };
  
  const listItemStyle = {
    marginBottom: '5px'
  };