export type ChunkData = {
    type: "agent";
    nodeId: string;
    agentId: string;
    token: string;
};
export type ContentData<T = any> = {
    type: "content";
    data: T;
};
export type StreamData = ChunkData | ContentData;
export declare class ChunkParser {
    private buffer;
    constructor();
    read(text: string): StreamData[];
    private parse;
}
