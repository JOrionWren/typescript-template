/* eslint-disable no-constant-condition */
import { NS } from "@ns";
import { WatchDogcfg } from "config/WatchdogConfig";
import { CONSTANTS } from "constants/Constants";
import { ScriptConfig } from "interfaces/ScriptConfig";
import renderCustomModal from 'models/ReactModels';
import type React_Type from 'react';
declare let React: typeof React_Type;

export async function main(ns: NS): Promise<void> {
  ns.tail();
  ns.atExit(() => ns.closeTail());
  while(true){
    RenderModel(ns)
    const ScriptsInPriority = new Map<number,ScriptConfig[]>();
    const RamCosts = new Map<number, number>();

    //Figure out what the cost of everything is.
    Object.values(CONSTANTS.PRIORITY).forEach(o => ScriptsInPriority.set(o, Array.from(WatchDogcfg.Scripts.values()).filter(p => p.Priority == o && !ns.isRunning(p.ScriptLocation+p.ScriptName+".js"))) )
    ScriptsInPriority.forEach((scripts, Priority) => RamCosts.set(Priority,CalculateRamUsage(ns,scripts)));
    const highest = HandleStartupForPriority(ns,ScriptsInPriority.get(CONSTANTS.PRIORITY.HIGHEST))
    const high = HandleStartupForPriority(ns, ScriptsInPriority.get(CONSTANTS.PRIORITY.HIGH))
    const normal = HandleStartupForPriority(ns,ScriptsInPriority.get(CONSTANTS.PRIORITY.NORMAL))
    const low = HandleStartupForPriority(ns,ScriptsInPriority.get(CONSTANTS.PRIORITY.LOW))
    const lowest = HandleStartupForPriority(ns, ScriptsInPriority.get(CONSTANTS.PRIORITY.LOWEST))

    if(!highest || !high){
      //Request more ram at High Priority
    }
    if(!normal){
      // Request more ram at normal Priority
    }
    if(!low || !lowest){
      // Request more ram at lowest Priority
    }
    await ns.sleep(WatchDogcfg.WaitTimeSeconds * 1000)
  }
}

function CalculateRamUsage(ns: NS,Scripts : ScriptConfig[]) : number {
  return Scripts.reduce((total,o)=>{return total +ns.getScriptRam(o.ScriptLocation + o.ScriptName + ".js")},0)
}

function HandleStartupForPriority(ns : NS,Scripts? : ScriptConfig[]) : boolean{
  let StartedStack = true;
  if(!Scripts){
    return false;
  }
  Scripts.forEach(o => StartedStack = StartedStack && (ns.exec(o.ScriptLocation+o.ScriptName + ".js",ns.getHostname()) != 0));
  return StartedStack;
}

function RenderModel(ns: NS) {
  const scriptsByPriority = getScriptsInPriority(ns);

  renderCustomModal(ns,    
      <div style={modalStyle}>
          <h2 style={titleStyle}>Registered Scripts</h2>
          {Object.entries(CONSTANTS.PRIORITY).map(([priorityName, priorityValue]) => (
              <div key={priorityName}>
                  <h3 style={priorityTitleStyle}>{priorityName}</h3>
                  <ul style={listStyle}>
                      {scriptsByPriority.get(priorityValue)?.map((script, index) => (
                          <li key={index} style={listItemStyle}>
                              {script.ScriptName} - Running
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

function getScriptsInPriority(ns: NS) {
  const scriptsByPriority = new Map<number, ScriptConfig[]>();
  Object.values(CONSTANTS.PRIORITY).forEach(priority => {
      scriptsByPriority.set(priority, Array.from(WatchDogcfg.Scripts.values()).filter(script => script.Priority == priority && ns.isRunning(script.ScriptLocation + script.ScriptName + ".js")));
  });
  return scriptsByPriority;
}