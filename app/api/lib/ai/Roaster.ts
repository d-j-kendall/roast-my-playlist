import { AnalysisInputData } from "../music/AnalysisInput";

export interface Roaster{

    generateRoast(taste : AnalysisInputData) : Promise<string>;


    generateCompliment(taste : AnalysisInputData) : Promise<string>;

}