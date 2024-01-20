import { JCPCompliant } from "classes/wrapped/JCPCompliant"

export class DNSPayload extends JCPCompliant{
    ScriptName : string
    PID : number
    RegistrationRequest : boolean
    ResponsePort? : number
    constructor(ScriptName : string, PID: number, RegistrationRequest : boolean, ResponsePort?: number){
        super()
        this.ScriptName = ScriptName
        this.PID = PID
        this.RegistrationRequest = RegistrationRequest
        this.ResponsePort = ResponsePort
    }
    
    static FromJson(json : string) : DNSPayload{
        const _obj = JSON.parse(json);
        return _obj
    }
}