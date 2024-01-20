import { ScriptConfig } from "/interfaces/ScriptConfig";
export interface WatchDogConfig {
    Scripts: Map<string, ScriptConfig>;
    WaitTimeSeconds: number;
}