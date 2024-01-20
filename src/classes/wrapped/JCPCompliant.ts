import { IJCP } from "interfaces/IJCP";
import { generateGUID } from "lib/Helpers";
import { Identifiable } from "classes/wrapped/Identifiable";
import { CONSTANTS } from "constants/Constants";

export class JCPCompliant extends Identifiable implements IJCP{
    GUID: string;
    Priority: number;
    constructor(){
        super()
        this.GUID = generateGUID();
        this.Priority = CONSTANTS.PRIORITY.NORMAL;
    }
}