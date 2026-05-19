import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Transform, GetFileResponse, GetFileNodesResponse } from '@figma/rest-api-spec';
import { Server } from 'http';

type ImageProcessingResult = {
    filePath: string;
    originalDimensions: {
        width: number;
        height: number;
    };
    finalDimensions: {
        width: number;
        height: number;
    };
    wasCropped: boolean;
    cropRegion?: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    cssVariables?: string;
    processingLog: string[];
};

type FigmaAuthOptions = {
    figmaApiKey: string;
    figmaOAuthToken: string;
    useOAuth: boolean;
};
type SvgOptions = {
    outlineText: boolean;
    includeId: boolean;
    simplifyStroke: boolean;
};
declare class FigmaService {
    private readonly apiKey;
    private readonly oauthToken;
    private readonly useOAuth;
    private readonly baseUrl;
    constructor({ figmaApiKey, figmaOAuthToken, useOAuth }: FigmaAuthOptions);
    private getAuthHeaders;
    private filterValidImages;
    private request;
    private requestWithSize;
    private buildSvgQueryParams;
    getImageFillUrls(fileKey: string): Promise<Record<string, string>>;
    getNodeRenderUrls(fileKey: string, nodeIds: string[], format: "png" | "svg", options?: {
        pngScale?: number;
        svgOptions?: SvgOptions;
    }): Promise<Record<string, string>>;
    downloadImages(fileKey: string, localPath: string, items: Array<{
        imageRef?: string;
        gifRef?: string;
        nodeId?: string;
        fileName: string;
        needsCropping?: boolean;
        cropTransform?: Transform;
        requiresImageDimensions?: boolean;
    }>, options?: {
        pngScale?: number;
        svgOptions?: SvgOptions;
    }): Promise<ImageProcessingResult[]>;
    getRawFile(fileKey: string, depth?: number | null): Promise<{
        data: GetFileResponse;
        rawSize: number;
    }>;
    getRawNode(fileKey: string, nodeId: string, depth?: number | null): Promise<{
        data: GetFileNodesResponse;
        rawSize: number;
    }>;
    getComments(fileKey: string): Promise<any[]>;
}

type Transport = "stdio" | "http" | "cli";

type ServerTransport = Extract<Transport, "stdio" | "http">;
type CreateServerOptions = {
    transport: ServerTransport;
    outputFormat?: "yaml" | "json";
    skipImageDownloads?: boolean;
    imageDir?: string;
};
declare function createServer(authOptions: FigmaAuthOptions, { transport, outputFormat, skipImageDownloads, imageDir }: CreateServerOptions): McpServer;

type Source = "cli" | "env" | "default";
interface ServerFlags {
    figmaApiKey?: string;
    figmaOauthToken?: string;
    env?: string;
    port?: number;
    host?: string;
    json?: boolean;
    skipImageDownloads?: boolean;
    imageDir?: string;
    proxy?: string;
    stdio?: boolean;
    noTelemetry?: boolean;
}
interface ServerConfig {
    auth: FigmaAuthOptions;
    port: number;
    host: string;
    proxy: string | undefined;
    outputFormat: "yaml" | "json";
    skipImageDownloads: boolean;
    imageDir: string;
    isStdioMode: boolean;
    noTelemetry: boolean;
    configSources: Record<string, Source>;
}
declare class UsageError extends Error {
    constructor(message: string);
}
declare function getServerConfig(flags: ServerFlags): ServerConfig;

declare function startServer(config: ServerConfig): Promise<void>;
declare function startHttpServer(host: string, port: number, baseAuth: FigmaAuthOptions, serverOptions: Omit<CreateServerOptions, "transport">): Promise<Server>;
declare function stopHttpServer(): Promise<void>;

export { FigmaService, type ServerConfig, UsageError, createServer, getServerConfig, startHttpServer, startServer, stopHttpServer };
