export interface ScriptConfig {
    Priority: number;
    ScriptName: string;
    ScriptLocation: string;
    ScriptArgs: string[] | null; // Allow ScriptArgs to be string[] or null
    MaxThreadsAllowed: number;
}
