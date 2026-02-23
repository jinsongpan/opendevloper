// package: sandbox
// file: sandbox.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class CreateRequest extends jspb.Message { 
    getImage(): string;
    setImage(value: string): CreateRequest;

    getEnvMap(): jspb.Map<string, string>;
    clearEnvMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CreateRequest): CreateRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateRequest;
    static deserializeBinaryFromReader(message: CreateRequest, reader: jspb.BinaryReader): CreateRequest;
}

export namespace CreateRequest {
    export type AsObject = {
        image: string,

        envMap: Array<[string, string]>,
    }
}

export class CreateResponse extends jspb.Message { 
    getSandboxId(): string;
    setSandboxId(value: string): CreateResponse;
    getWorkDir(): string;
    setWorkDir(value: string): CreateResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateResponse.AsObject;
    static toObject(includeInstance: boolean, msg: CreateResponse): CreateResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateResponse;
    static deserializeBinaryFromReader(message: CreateResponse, reader: jspb.BinaryReader): CreateResponse;
}

export namespace CreateResponse {
    export type AsObject = {
        sandboxId: string,
        workDir: string,
    }
}

export class DestroyRequest extends jspb.Message { 
    getSandboxId(): string;
    setSandboxId(value: string): DestroyRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DestroyRequest.AsObject;
    static toObject(includeInstance: boolean, msg: DestroyRequest): DestroyRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DestroyRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DestroyRequest;
    static deserializeBinaryFromReader(message: DestroyRequest, reader: jspb.BinaryReader): DestroyRequest;
}

export namespace DestroyRequest {
    export type AsObject = {
        sandboxId: string,
    }
}

export class DestroyResponse extends jspb.Message { 
    getSuccess(): boolean;
    setSuccess(value: boolean): DestroyResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DestroyResponse.AsObject;
    static toObject(includeInstance: boolean, msg: DestroyResponse): DestroyResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DestroyResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DestroyResponse;
    static deserializeBinaryFromReader(message: DestroyResponse, reader: jspb.BinaryReader): DestroyResponse;
}

export namespace DestroyResponse {
    export type AsObject = {
        success: boolean,
    }
}

export class CreateFileRequest extends jspb.Message { 
    getSandboxId(): string;
    setSandboxId(value: string): CreateFileRequest;
    getPath(): string;
    setPath(value: string): CreateFileRequest;
    getContent(): string;
    setContent(value: string): CreateFileRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateFileRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CreateFileRequest): CreateFileRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateFileRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateFileRequest;
    static deserializeBinaryFromReader(message: CreateFileRequest, reader: jspb.BinaryReader): CreateFileRequest;
}

export namespace CreateFileRequest {
    export type AsObject = {
        sandboxId: string,
        path: string,
        content: string,
    }
}

export class CreateFileResponse extends jspb.Message { 
    getSuccess(): boolean;
    setSuccess(value: boolean): CreateFileResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateFileResponse.AsObject;
    static toObject(includeInstance: boolean, msg: CreateFileResponse): CreateFileResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateFileResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateFileResponse;
    static deserializeBinaryFromReader(message: CreateFileResponse, reader: jspb.BinaryReader): CreateFileResponse;
}

export namespace CreateFileResponse {
    export type AsObject = {
        success: boolean,
    }
}

export class ReadFileRequest extends jspb.Message { 
    getSandboxId(): string;
    setSandboxId(value: string): ReadFileRequest;
    getPath(): string;
    setPath(value: string): ReadFileRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ReadFileRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ReadFileRequest): ReadFileRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ReadFileRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ReadFileRequest;
    static deserializeBinaryFromReader(message: ReadFileRequest, reader: jspb.BinaryReader): ReadFileRequest;
}

export namespace ReadFileRequest {
    export type AsObject = {
        sandboxId: string,
        path: string,
    }
}

export class ReadFileResponse extends jspb.Message { 
    getContent(): string;
    setContent(value: string): ReadFileResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ReadFileResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ReadFileResponse): ReadFileResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ReadFileResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ReadFileResponse;
    static deserializeBinaryFromReader(message: ReadFileResponse, reader: jspb.BinaryReader): ReadFileResponse;
}

export namespace ReadFileResponse {
    export type AsObject = {
        content: string,
    }
}

export class ListFilesRequest extends jspb.Message { 
    getSandboxId(): string;
    setSandboxId(value: string): ListFilesRequest;
    getDir(): string;
    setDir(value: string): ListFilesRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListFilesRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ListFilesRequest): ListFilesRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListFilesRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListFilesRequest;
    static deserializeBinaryFromReader(message: ListFilesRequest, reader: jspb.BinaryReader): ListFilesRequest;
}

export namespace ListFilesRequest {
    export type AsObject = {
        sandboxId: string,
        dir: string,
    }
}

export class FileNode extends jspb.Message { 
    getName(): string;
    setName(value: string): FileNode;
    getPath(): string;
    setPath(value: string): FileNode;
    getType(): string;
    setType(value: string): FileNode;
    clearChildrenList(): void;
    getChildrenList(): Array<FileNode>;
    setChildrenList(value: Array<FileNode>): FileNode;
    addChildren(value?: FileNode, index?: number): FileNode;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): FileNode.AsObject;
    static toObject(includeInstance: boolean, msg: FileNode): FileNode.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: FileNode, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): FileNode;
    static deserializeBinaryFromReader(message: FileNode, reader: jspb.BinaryReader): FileNode;
}

export namespace FileNode {
    export type AsObject = {
        name: string,
        path: string,
        type: string,
        childrenList: Array<FileNode.AsObject>,
    }
}

export class ListFilesResponse extends jspb.Message { 
    clearFilesList(): void;
    getFilesList(): Array<FileNode>;
    setFilesList(value: Array<FileNode>): ListFilesResponse;
    addFiles(value?: FileNode, index?: number): FileNode;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListFilesResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ListFilesResponse): ListFilesResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListFilesResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListFilesResponse;
    static deserializeBinaryFromReader(message: ListFilesResponse, reader: jspb.BinaryReader): ListFilesResponse;
}

export namespace ListFilesResponse {
    export type AsObject = {
        filesList: Array<FileNode.AsObject>,
    }
}

export class DeleteFileRequest extends jspb.Message { 
    getSandboxId(): string;
    setSandboxId(value: string): DeleteFileRequest;
    getPath(): string;
    setPath(value: string): DeleteFileRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeleteFileRequest.AsObject;
    static toObject(includeInstance: boolean, msg: DeleteFileRequest): DeleteFileRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeleteFileRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeleteFileRequest;
    static deserializeBinaryFromReader(message: DeleteFileRequest, reader: jspb.BinaryReader): DeleteFileRequest;
}

export namespace DeleteFileRequest {
    export type AsObject = {
        sandboxId: string,
        path: string,
    }
}

export class DeleteFileResponse extends jspb.Message { 
    getSuccess(): boolean;
    setSuccess(value: boolean): DeleteFileResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeleteFileResponse.AsObject;
    static toObject(includeInstance: boolean, msg: DeleteFileResponse): DeleteFileResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeleteFileResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeleteFileResponse;
    static deserializeBinaryFromReader(message: DeleteFileResponse, reader: jspb.BinaryReader): DeleteFileResponse;
}

export namespace DeleteFileResponse {
    export type AsObject = {
        success: boolean,
    }
}

export class ExecRequest extends jspb.Message { 
    getSandboxId(): string;
    setSandboxId(value: string): ExecRequest;
    getCommand(): string;
    setCommand(value: string): ExecRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ExecRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ExecRequest): ExecRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ExecRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ExecRequest;
    static deserializeBinaryFromReader(message: ExecRequest, reader: jspb.BinaryReader): ExecRequest;
}

export namespace ExecRequest {
    export type AsObject = {
        sandboxId: string,
        command: string,
    }
}

export class ExecResponse extends jspb.Message { 
    getOutput(): string;
    setOutput(value: string): ExecResponse;
    getExitCode(): number;
    setExitCode(value: number): ExecResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ExecResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ExecResponse): ExecResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ExecResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ExecResponse;
    static deserializeBinaryFromReader(message: ExecResponse, reader: jspb.BinaryReader): ExecResponse;
}

export namespace ExecResponse {
    export type AsObject = {
        output: string,
        exitCode: number,
    }
}

export class ExecStreamResponse extends jspb.Message { 
    getData(): string;
    setData(value: string): ExecStreamResponse;
    getIsError(): boolean;
    setIsError(value: boolean): ExecStreamResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ExecStreamResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ExecStreamResponse): ExecStreamResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ExecStreamResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ExecStreamResponse;
    static deserializeBinaryFromReader(message: ExecStreamResponse, reader: jspb.BinaryReader): ExecStreamResponse;
}

export namespace ExecStreamResponse {
    export type AsObject = {
        data: string,
        isError: boolean,
    }
}

export class RunAppRequest extends jspb.Message { 
    getSandboxId(): string;
    setSandboxId(value: string): RunAppRequest;
    getCommand(): string;
    setCommand(value: string): RunAppRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RunAppRequest.AsObject;
    static toObject(includeInstance: boolean, msg: RunAppRequest): RunAppRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RunAppRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RunAppRequest;
    static deserializeBinaryFromReader(message: RunAppRequest, reader: jspb.BinaryReader): RunAppRequest;
}

export namespace RunAppRequest {
    export type AsObject = {
        sandboxId: string,
        command: string,
    }
}

export class RunAppResponse extends jspb.Message { 
    getOutput(): string;
    setOutput(value: string): RunAppResponse;
    getExitCode(): number;
    setExitCode(value: number): RunAppResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RunAppResponse.AsObject;
    static toObject(includeInstance: boolean, msg: RunAppResponse): RunAppResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RunAppResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RunAppResponse;
    static deserializeBinaryFromReader(message: RunAppResponse, reader: jspb.BinaryReader): RunAppResponse;
}

export namespace RunAppResponse {
    export type AsObject = {
        output: string,
        exitCode: number,
    }
}

export class InstallDepsRequest extends jspb.Message { 
    getSandboxId(): string;
    setSandboxId(value: string): InstallDepsRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): InstallDepsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: InstallDepsRequest): InstallDepsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: InstallDepsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): InstallDepsRequest;
    static deserializeBinaryFromReader(message: InstallDepsRequest, reader: jspb.BinaryReader): InstallDepsRequest;
}

export namespace InstallDepsRequest {
    export type AsObject = {
        sandboxId: string,
    }
}

export class InstallDepsResponse extends jspb.Message { 
    getOutput(): string;
    setOutput(value: string): InstallDepsResponse;
    getExitCode(): number;
    setExitCode(value: number): InstallDepsResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): InstallDepsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: InstallDepsResponse): InstallDepsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: InstallDepsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): InstallDepsResponse;
    static deserializeBinaryFromReader(message: InstallDepsResponse, reader: jspb.BinaryReader): InstallDepsResponse;
}

export namespace InstallDepsResponse {
    export type AsObject = {
        output: string,
        exitCode: number,
    }
}

export class RunServerRequest extends jspb.Message { 
    getSandboxId(): string;
    setSandboxId(value: string): RunServerRequest;
    getCommand(): string;
    setCommand(value: string): RunServerRequest;
    getPort(): string;
    setPort(value: string): RunServerRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RunServerRequest.AsObject;
    static toObject(includeInstance: boolean, msg: RunServerRequest): RunServerRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RunServerRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RunServerRequest;
    static deserializeBinaryFromReader(message: RunServerRequest, reader: jspb.BinaryReader): RunServerRequest;
}

export namespace RunServerRequest {
    export type AsObject = {
        sandboxId: string,
        command: string,
        port: string,
    }
}

export class RunServerResponse extends jspb.Message { 
    getOutput(): string;
    setOutput(value: string): RunServerResponse;
    getUrl(): string;
    setUrl(value: string): RunServerResponse;
    getPort(): number;
    setPort(value: number): RunServerResponse;
    getPid(): number;
    setPid(value: number): RunServerResponse;
    getExitCode(): number;
    setExitCode(value: number): RunServerResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RunServerResponse.AsObject;
    static toObject(includeInstance: boolean, msg: RunServerResponse): RunServerResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RunServerResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RunServerResponse;
    static deserializeBinaryFromReader(message: RunServerResponse, reader: jspb.BinaryReader): RunServerResponse;
}

export namespace RunServerResponse {
    export type AsObject = {
        output: string,
        url: string,
        port: number,
        pid: number,
        exitCode: number,
    }
}

export class RunServerStreamResponse extends jspb.Message { 
    getData(): string;
    setData(value: string): RunServerStreamResponse;
    getPort(): number;
    setPort(value: number): RunServerStreamResponse;
    getUrl(): string;
    setUrl(value: string): RunServerStreamResponse;
    getIsError(): boolean;
    setIsError(value: boolean): RunServerStreamResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RunServerStreamResponse.AsObject;
    static toObject(includeInstance: boolean, msg: RunServerStreamResponse): RunServerStreamResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RunServerStreamResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RunServerStreamResponse;
    static deserializeBinaryFromReader(message: RunServerStreamResponse, reader: jspb.BinaryReader): RunServerStreamResponse;
}

export namespace RunServerStreamResponse {
    export type AsObject = {
        data: string,
        port: number,
        url: string,
        isError: boolean,
    }
}

export class RunStaticServerRequest extends jspb.Message { 
    getSandboxId(): string;
    setSandboxId(value: string): RunStaticServerRequest;
    getPort(): string;
    setPort(value: string): RunStaticServerRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RunStaticServerRequest.AsObject;
    static toObject(includeInstance: boolean, msg: RunStaticServerRequest): RunStaticServerRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RunStaticServerRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RunStaticServerRequest;
    static deserializeBinaryFromReader(message: RunStaticServerRequest, reader: jspb.BinaryReader): RunStaticServerRequest;
}

export namespace RunStaticServerRequest {
    export type AsObject = {
        sandboxId: string,
        port: string,
    }
}

export class RunStaticServerResponse extends jspb.Message { 
    getUrl(): string;
    setUrl(value: string): RunStaticServerResponse;
    getPort(): number;
    setPort(value: number): RunStaticServerResponse;
    getPid(): number;
    setPid(value: number): RunStaticServerResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RunStaticServerResponse.AsObject;
    static toObject(includeInstance: boolean, msg: RunStaticServerResponse): RunStaticServerResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RunStaticServerResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RunStaticServerResponse;
    static deserializeBinaryFromReader(message: RunStaticServerResponse, reader: jspb.BinaryReader): RunStaticServerResponse;
}

export namespace RunStaticServerResponse {
    export type AsObject = {
        url: string,
        port: number,
        pid: number,
    }
}

export class GetServersRequest extends jspb.Message { 
    getSandboxId(): string;
    setSandboxId(value: string): GetServersRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetServersRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetServersRequest): GetServersRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetServersRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetServersRequest;
    static deserializeBinaryFromReader(message: GetServersRequest, reader: jspb.BinaryReader): GetServersRequest;
}

export namespace GetServersRequest {
    export type AsObject = {
        sandboxId: string,
    }
}

export class ServerInfo extends jspb.Message { 
    getSandboxId(): string;
    setSandboxId(value: string): ServerInfo;
    getPort(): number;
    setPort(value: number): ServerInfo;
    getUrl(): string;
    setUrl(value: string): ServerInfo;
    getPid(): number;
    setPid(value: number): ServerInfo;
    getStartTime(): number;
    setStartTime(value: number): ServerInfo;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ServerInfo.AsObject;
    static toObject(includeInstance: boolean, msg: ServerInfo): ServerInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ServerInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ServerInfo;
    static deserializeBinaryFromReader(message: ServerInfo, reader: jspb.BinaryReader): ServerInfo;
}

export namespace ServerInfo {
    export type AsObject = {
        sandboxId: string,
        port: number,
        url: string,
        pid: number,
        startTime: number,
    }
}

export class GetServersResponse extends jspb.Message { 
    clearServersList(): void;
    getServersList(): Array<ServerInfo>;
    setServersList(value: Array<ServerInfo>): GetServersResponse;
    addServers(value?: ServerInfo, index?: number): ServerInfo;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetServersResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetServersResponse): GetServersResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetServersResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetServersResponse;
    static deserializeBinaryFromReader(message: GetServersResponse, reader: jspb.BinaryReader): GetServersResponse;
}

export namespace GetServersResponse {
    export type AsObject = {
        serversList: Array<ServerInfo.AsObject>,
    }
}

export class HealthCheckRequest extends jspb.Message { 

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): HealthCheckRequest.AsObject;
    static toObject(includeInstance: boolean, msg: HealthCheckRequest): HealthCheckRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: HealthCheckRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): HealthCheckRequest;
    static deserializeBinaryFromReader(message: HealthCheckRequest, reader: jspb.BinaryReader): HealthCheckRequest;
}

export namespace HealthCheckRequest {
    export type AsObject = {
    }
}

export class HealthCheckResponse extends jspb.Message { 
    getHealthy(): boolean;
    setHealthy(value: boolean): HealthCheckResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): HealthCheckResponse.AsObject;
    static toObject(includeInstance: boolean, msg: HealthCheckResponse): HealthCheckResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: HealthCheckResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): HealthCheckResponse;
    static deserializeBinaryFromReader(message: HealthCheckResponse, reader: jspb.BinaryReader): HealthCheckResponse;
}

export namespace HealthCheckResponse {
    export type AsObject = {
        healthy: boolean,
    }
}
