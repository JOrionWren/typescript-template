import { NS } from "@ns";
import { JCPCompliant } from "classes/wrapped/JCPCompliant";
import { getPortForScript } from "lib/DNSHelpers";
import { MoneyManagerCfg } from "config/MoneyManagerConfig";

export class MoneyRequest extends JCPCompliant {
    From: string;
    Amount: number;
    Cancel: boolean;
    For: string;
    constructor(From : string,For: string, Amount : number, Priority: number,Cancel = false){
        super()
        this.From = From;
        this.For = For;
        this.Amount = Amount;
        this.Priority = Priority;
        this.Cancel = Cancel;
    }
    async SendRequest(ns:NS) : Promise<boolean>{
        const response = await getPortForScript(ns,MoneyManagerCfg.Name);
        if(!response){
            return false;
        }
        if(!response.ResponsePort){
            return false;
        }
        const ph = ns.getPortHandle(response.ResponsePort)
        return ph.write(JSON.stringify(this)) != null;
    }
    static FromJson(str : string) : MoneyRequest{
        return JSON.parse(str)
    }
}
