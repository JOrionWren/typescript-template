import { JCPCompliant } from "classes/wrapped/JCPCompliant";

export class UpgradeHomeServerRequest extends JCPCompliant{
    UpgradeJustRam:boolean
    constructor(UpgradeJustRam = false, Priority?: number){
        super()
        this.UpgradeJustRam = UpgradeJustRam
        if(Priority){
            this.Priority = Priority;
        }
    }
    static FromJson(str : string) : UpgradeHomeServerRequest{
        return JSON.parse(str);
    }
}