import { DNSPayload } from "classes/DnsPayload";
export interface PortRegistry {
    [port: number]: DNSPayload;
}