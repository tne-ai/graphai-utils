import type { AgentFilterFunction } from "graphai";
import type { FirebaseApp } from "firebase/app";
export declare const buildFirebaseStreamFilter: (firebaseApp: FirebaseApp, region: string, functionName: string) => {
    firebaseStreamFilter: AgentFilterFunction;
};
