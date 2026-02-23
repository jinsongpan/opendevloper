// package: sandbox
// file: sandbox.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as sandbox_pb from "./sandbox_pb";

interface ISandboxServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    createSandbox: ISandboxServiceService_ICreateSandbox;
    destroySandbox: ISandboxServiceService_IDestroySandbox;
    createFile: ISandboxServiceService_ICreateFile;
    readFile: ISandboxServiceService_IReadFile;
    listFiles: ISandboxServiceService_IListFiles;
    deleteFile: ISandboxServiceService_IDeleteFile;
    execCommand: ISandboxServiceService_IExecCommand;
    execCommandStream: ISandboxServiceService_IExecCommandStream;
    runApplication: ISandboxServiceService_IRunApplication;
    installDependencies: ISandboxServiceService_IInstallDependencies;
    runServer: ISandboxServiceService_IRunServer;
    runServerStream: ISandboxServiceService_IRunServerStream;
    runStaticServer: ISandboxServiceService_IRunStaticServer;
    getServers: ISandboxServiceService_IGetServers;
    healthCheck: ISandboxServiceService_IHealthCheck;
}

interface ISandboxServiceService_ICreateSandbox extends grpc.MethodDefinition<sandbox_pb.CreateRequest, sandbox_pb.CreateResponse> {
    path: "/sandbox.SandboxService/CreateSandbox";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<sandbox_pb.CreateRequest>;
    requestDeserialize: grpc.deserialize<sandbox_pb.CreateRequest>;
    responseSerialize: grpc.serialize<sandbox_pb.CreateResponse>;
    responseDeserialize: grpc.deserialize<sandbox_pb.CreateResponse>;
}
interface ISandboxServiceService_IDestroySandbox extends grpc.MethodDefinition<sandbox_pb.DestroyRequest, sandbox_pb.DestroyResponse> {
    path: "/sandbox.SandboxService/DestroySandbox";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<sandbox_pb.DestroyRequest>;
    requestDeserialize: grpc.deserialize<sandbox_pb.DestroyRequest>;
    responseSerialize: grpc.serialize<sandbox_pb.DestroyResponse>;
    responseDeserialize: grpc.deserialize<sandbox_pb.DestroyResponse>;
}
interface ISandboxServiceService_ICreateFile extends grpc.MethodDefinition<sandbox_pb.CreateFileRequest, sandbox_pb.CreateFileResponse> {
    path: "/sandbox.SandboxService/CreateFile";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<sandbox_pb.CreateFileRequest>;
    requestDeserialize: grpc.deserialize<sandbox_pb.CreateFileRequest>;
    responseSerialize: grpc.serialize<sandbox_pb.CreateFileResponse>;
    responseDeserialize: grpc.deserialize<sandbox_pb.CreateFileResponse>;
}
interface ISandboxServiceService_IReadFile extends grpc.MethodDefinition<sandbox_pb.ReadFileRequest, sandbox_pb.ReadFileResponse> {
    path: "/sandbox.SandboxService/ReadFile";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<sandbox_pb.ReadFileRequest>;
    requestDeserialize: grpc.deserialize<sandbox_pb.ReadFileRequest>;
    responseSerialize: grpc.serialize<sandbox_pb.ReadFileResponse>;
    responseDeserialize: grpc.deserialize<sandbox_pb.ReadFileResponse>;
}
interface ISandboxServiceService_IListFiles extends grpc.MethodDefinition<sandbox_pb.ListFilesRequest, sandbox_pb.ListFilesResponse> {
    path: "/sandbox.SandboxService/ListFiles";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<sandbox_pb.ListFilesRequest>;
    requestDeserialize: grpc.deserialize<sandbox_pb.ListFilesRequest>;
    responseSerialize: grpc.serialize<sandbox_pb.ListFilesResponse>;
    responseDeserialize: grpc.deserialize<sandbox_pb.ListFilesResponse>;
}
interface ISandboxServiceService_IDeleteFile extends grpc.MethodDefinition<sandbox_pb.DeleteFileRequest, sandbox_pb.DeleteFileResponse> {
    path: "/sandbox.SandboxService/DeleteFile";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<sandbox_pb.DeleteFileRequest>;
    requestDeserialize: grpc.deserialize<sandbox_pb.DeleteFileRequest>;
    responseSerialize: grpc.serialize<sandbox_pb.DeleteFileResponse>;
    responseDeserialize: grpc.deserialize<sandbox_pb.DeleteFileResponse>;
}
interface ISandboxServiceService_IExecCommand extends grpc.MethodDefinition<sandbox_pb.ExecRequest, sandbox_pb.ExecResponse> {
    path: "/sandbox.SandboxService/ExecCommand";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<sandbox_pb.ExecRequest>;
    requestDeserialize: grpc.deserialize<sandbox_pb.ExecRequest>;
    responseSerialize: grpc.serialize<sandbox_pb.ExecResponse>;
    responseDeserialize: grpc.deserialize<sandbox_pb.ExecResponse>;
}
interface ISandboxServiceService_IExecCommandStream extends grpc.MethodDefinition<sandbox_pb.ExecRequest, sandbox_pb.ExecStreamResponse> {
    path: "/sandbox.SandboxService/ExecCommandStream";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<sandbox_pb.ExecRequest>;
    requestDeserialize: grpc.deserialize<sandbox_pb.ExecRequest>;
    responseSerialize: grpc.serialize<sandbox_pb.ExecStreamResponse>;
    responseDeserialize: grpc.deserialize<sandbox_pb.ExecStreamResponse>;
}
interface ISandboxServiceService_IRunApplication extends grpc.MethodDefinition<sandbox_pb.RunAppRequest, sandbox_pb.RunAppResponse> {
    path: "/sandbox.SandboxService/RunApplication";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<sandbox_pb.RunAppRequest>;
    requestDeserialize: grpc.deserialize<sandbox_pb.RunAppRequest>;
    responseSerialize: grpc.serialize<sandbox_pb.RunAppResponse>;
    responseDeserialize: grpc.deserialize<sandbox_pb.RunAppResponse>;
}
interface ISandboxServiceService_IInstallDependencies extends grpc.MethodDefinition<sandbox_pb.InstallDepsRequest, sandbox_pb.InstallDepsResponse> {
    path: "/sandbox.SandboxService/InstallDependencies";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<sandbox_pb.InstallDepsRequest>;
    requestDeserialize: grpc.deserialize<sandbox_pb.InstallDepsRequest>;
    responseSerialize: grpc.serialize<sandbox_pb.InstallDepsResponse>;
    responseDeserialize: grpc.deserialize<sandbox_pb.InstallDepsResponse>;
}
interface ISandboxServiceService_IRunServer extends grpc.MethodDefinition<sandbox_pb.RunServerRequest, sandbox_pb.RunServerResponse> {
    path: "/sandbox.SandboxService/RunServer";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<sandbox_pb.RunServerRequest>;
    requestDeserialize: grpc.deserialize<sandbox_pb.RunServerRequest>;
    responseSerialize: grpc.serialize<sandbox_pb.RunServerResponse>;
    responseDeserialize: grpc.deserialize<sandbox_pb.RunServerResponse>;
}
interface ISandboxServiceService_IRunServerStream extends grpc.MethodDefinition<sandbox_pb.RunServerRequest, sandbox_pb.RunServerStreamResponse> {
    path: "/sandbox.SandboxService/RunServerStream";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<sandbox_pb.RunServerRequest>;
    requestDeserialize: grpc.deserialize<sandbox_pb.RunServerRequest>;
    responseSerialize: grpc.serialize<sandbox_pb.RunServerStreamResponse>;
    responseDeserialize: grpc.deserialize<sandbox_pb.RunServerStreamResponse>;
}
interface ISandboxServiceService_IRunStaticServer extends grpc.MethodDefinition<sandbox_pb.RunStaticServerRequest, sandbox_pb.RunStaticServerResponse> {
    path: "/sandbox.SandboxService/RunStaticServer";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<sandbox_pb.RunStaticServerRequest>;
    requestDeserialize: grpc.deserialize<sandbox_pb.RunStaticServerRequest>;
    responseSerialize: grpc.serialize<sandbox_pb.RunStaticServerResponse>;
    responseDeserialize: grpc.deserialize<sandbox_pb.RunStaticServerResponse>;
}
interface ISandboxServiceService_IGetServers extends grpc.MethodDefinition<sandbox_pb.GetServersRequest, sandbox_pb.GetServersResponse> {
    path: "/sandbox.SandboxService/GetServers";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<sandbox_pb.GetServersRequest>;
    requestDeserialize: grpc.deserialize<sandbox_pb.GetServersRequest>;
    responseSerialize: grpc.serialize<sandbox_pb.GetServersResponse>;
    responseDeserialize: grpc.deserialize<sandbox_pb.GetServersResponse>;
}
interface ISandboxServiceService_IHealthCheck extends grpc.MethodDefinition<sandbox_pb.HealthCheckRequest, sandbox_pb.HealthCheckResponse> {
    path: "/sandbox.SandboxService/HealthCheck";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<sandbox_pb.HealthCheckRequest>;
    requestDeserialize: grpc.deserialize<sandbox_pb.HealthCheckRequest>;
    responseSerialize: grpc.serialize<sandbox_pb.HealthCheckResponse>;
    responseDeserialize: grpc.deserialize<sandbox_pb.HealthCheckResponse>;
}

export const SandboxServiceService: ISandboxServiceService;

export interface ISandboxServiceServer {
    createSandbox: grpc.handleUnaryCall<sandbox_pb.CreateRequest, sandbox_pb.CreateResponse>;
    destroySandbox: grpc.handleUnaryCall<sandbox_pb.DestroyRequest, sandbox_pb.DestroyResponse>;
    createFile: grpc.handleUnaryCall<sandbox_pb.CreateFileRequest, sandbox_pb.CreateFileResponse>;
    readFile: grpc.handleUnaryCall<sandbox_pb.ReadFileRequest, sandbox_pb.ReadFileResponse>;
    listFiles: grpc.handleUnaryCall<sandbox_pb.ListFilesRequest, sandbox_pb.ListFilesResponse>;
    deleteFile: grpc.handleUnaryCall<sandbox_pb.DeleteFileRequest, sandbox_pb.DeleteFileResponse>;
    execCommand: grpc.handleUnaryCall<sandbox_pb.ExecRequest, sandbox_pb.ExecResponse>;
    execCommandStream: grpc.handleServerStreamingCall<sandbox_pb.ExecRequest, sandbox_pb.ExecStreamResponse>;
    runApplication: grpc.handleUnaryCall<sandbox_pb.RunAppRequest, sandbox_pb.RunAppResponse>;
    installDependencies: grpc.handleUnaryCall<sandbox_pb.InstallDepsRequest, sandbox_pb.InstallDepsResponse>;
    runServer: grpc.handleUnaryCall<sandbox_pb.RunServerRequest, sandbox_pb.RunServerResponse>;
    runServerStream: grpc.handleServerStreamingCall<sandbox_pb.RunServerRequest, sandbox_pb.RunServerStreamResponse>;
    runStaticServer: grpc.handleUnaryCall<sandbox_pb.RunStaticServerRequest, sandbox_pb.RunStaticServerResponse>;
    getServers: grpc.handleUnaryCall<sandbox_pb.GetServersRequest, sandbox_pb.GetServersResponse>;
    healthCheck: grpc.handleUnaryCall<sandbox_pb.HealthCheckRequest, sandbox_pb.HealthCheckResponse>;
}

export interface ISandboxServiceClient {
    createSandbox(request: sandbox_pb.CreateRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.CreateResponse) => void): grpc.ClientUnaryCall;
    createSandbox(request: sandbox_pb.CreateRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.CreateResponse) => void): grpc.ClientUnaryCall;
    createSandbox(request: sandbox_pb.CreateRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.CreateResponse) => void): grpc.ClientUnaryCall;
    destroySandbox(request: sandbox_pb.DestroyRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.DestroyResponse) => void): grpc.ClientUnaryCall;
    destroySandbox(request: sandbox_pb.DestroyRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.DestroyResponse) => void): grpc.ClientUnaryCall;
    destroySandbox(request: sandbox_pb.DestroyRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.DestroyResponse) => void): grpc.ClientUnaryCall;
    createFile(request: sandbox_pb.CreateFileRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.CreateFileResponse) => void): grpc.ClientUnaryCall;
    createFile(request: sandbox_pb.CreateFileRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.CreateFileResponse) => void): grpc.ClientUnaryCall;
    createFile(request: sandbox_pb.CreateFileRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.CreateFileResponse) => void): grpc.ClientUnaryCall;
    readFile(request: sandbox_pb.ReadFileRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.ReadFileResponse) => void): grpc.ClientUnaryCall;
    readFile(request: sandbox_pb.ReadFileRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.ReadFileResponse) => void): grpc.ClientUnaryCall;
    readFile(request: sandbox_pb.ReadFileRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.ReadFileResponse) => void): grpc.ClientUnaryCall;
    listFiles(request: sandbox_pb.ListFilesRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.ListFilesResponse) => void): grpc.ClientUnaryCall;
    listFiles(request: sandbox_pb.ListFilesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.ListFilesResponse) => void): grpc.ClientUnaryCall;
    listFiles(request: sandbox_pb.ListFilesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.ListFilesResponse) => void): grpc.ClientUnaryCall;
    deleteFile(request: sandbox_pb.DeleteFileRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.DeleteFileResponse) => void): grpc.ClientUnaryCall;
    deleteFile(request: sandbox_pb.DeleteFileRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.DeleteFileResponse) => void): grpc.ClientUnaryCall;
    deleteFile(request: sandbox_pb.DeleteFileRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.DeleteFileResponse) => void): grpc.ClientUnaryCall;
    execCommand(request: sandbox_pb.ExecRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.ExecResponse) => void): grpc.ClientUnaryCall;
    execCommand(request: sandbox_pb.ExecRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.ExecResponse) => void): grpc.ClientUnaryCall;
    execCommand(request: sandbox_pb.ExecRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.ExecResponse) => void): grpc.ClientUnaryCall;
    execCommandStream(request: sandbox_pb.ExecRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<sandbox_pb.ExecStreamResponse>;
    execCommandStream(request: sandbox_pb.ExecRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<sandbox_pb.ExecStreamResponse>;
    runApplication(request: sandbox_pb.RunAppRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.RunAppResponse) => void): grpc.ClientUnaryCall;
    runApplication(request: sandbox_pb.RunAppRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.RunAppResponse) => void): grpc.ClientUnaryCall;
    runApplication(request: sandbox_pb.RunAppRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.RunAppResponse) => void): grpc.ClientUnaryCall;
    installDependencies(request: sandbox_pb.InstallDepsRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.InstallDepsResponse) => void): grpc.ClientUnaryCall;
    installDependencies(request: sandbox_pb.InstallDepsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.InstallDepsResponse) => void): grpc.ClientUnaryCall;
    installDependencies(request: sandbox_pb.InstallDepsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.InstallDepsResponse) => void): grpc.ClientUnaryCall;
    runServer(request: sandbox_pb.RunServerRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.RunServerResponse) => void): grpc.ClientUnaryCall;
    runServer(request: sandbox_pb.RunServerRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.RunServerResponse) => void): grpc.ClientUnaryCall;
    runServer(request: sandbox_pb.RunServerRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.RunServerResponse) => void): grpc.ClientUnaryCall;
    runServerStream(request: sandbox_pb.RunServerRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<sandbox_pb.RunServerStreamResponse>;
    runServerStream(request: sandbox_pb.RunServerRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<sandbox_pb.RunServerStreamResponse>;
    runStaticServer(request: sandbox_pb.RunStaticServerRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.RunStaticServerResponse) => void): grpc.ClientUnaryCall;
    runStaticServer(request: sandbox_pb.RunStaticServerRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.RunStaticServerResponse) => void): grpc.ClientUnaryCall;
    runStaticServer(request: sandbox_pb.RunStaticServerRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.RunStaticServerResponse) => void): grpc.ClientUnaryCall;
    getServers(request: sandbox_pb.GetServersRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.GetServersResponse) => void): grpc.ClientUnaryCall;
    getServers(request: sandbox_pb.GetServersRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.GetServersResponse) => void): grpc.ClientUnaryCall;
    getServers(request: sandbox_pb.GetServersRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.GetServersResponse) => void): grpc.ClientUnaryCall;
    healthCheck(request: sandbox_pb.HealthCheckRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
    healthCheck(request: sandbox_pb.HealthCheckRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
    healthCheck(request: sandbox_pb.HealthCheckRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
}

export class SandboxServiceClient extends grpc.Client implements ISandboxServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public createSandbox(request: sandbox_pb.CreateRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.CreateResponse) => void): grpc.ClientUnaryCall;
    public createSandbox(request: sandbox_pb.CreateRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.CreateResponse) => void): grpc.ClientUnaryCall;
    public createSandbox(request: sandbox_pb.CreateRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.CreateResponse) => void): grpc.ClientUnaryCall;
    public destroySandbox(request: sandbox_pb.DestroyRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.DestroyResponse) => void): grpc.ClientUnaryCall;
    public destroySandbox(request: sandbox_pb.DestroyRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.DestroyResponse) => void): grpc.ClientUnaryCall;
    public destroySandbox(request: sandbox_pb.DestroyRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.DestroyResponse) => void): grpc.ClientUnaryCall;
    public createFile(request: sandbox_pb.CreateFileRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.CreateFileResponse) => void): grpc.ClientUnaryCall;
    public createFile(request: sandbox_pb.CreateFileRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.CreateFileResponse) => void): grpc.ClientUnaryCall;
    public createFile(request: sandbox_pb.CreateFileRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.CreateFileResponse) => void): grpc.ClientUnaryCall;
    public readFile(request: sandbox_pb.ReadFileRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.ReadFileResponse) => void): grpc.ClientUnaryCall;
    public readFile(request: sandbox_pb.ReadFileRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.ReadFileResponse) => void): grpc.ClientUnaryCall;
    public readFile(request: sandbox_pb.ReadFileRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.ReadFileResponse) => void): grpc.ClientUnaryCall;
    public listFiles(request: sandbox_pb.ListFilesRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.ListFilesResponse) => void): grpc.ClientUnaryCall;
    public listFiles(request: sandbox_pb.ListFilesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.ListFilesResponse) => void): grpc.ClientUnaryCall;
    public listFiles(request: sandbox_pb.ListFilesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.ListFilesResponse) => void): grpc.ClientUnaryCall;
    public deleteFile(request: sandbox_pb.DeleteFileRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.DeleteFileResponse) => void): grpc.ClientUnaryCall;
    public deleteFile(request: sandbox_pb.DeleteFileRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.DeleteFileResponse) => void): grpc.ClientUnaryCall;
    public deleteFile(request: sandbox_pb.DeleteFileRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.DeleteFileResponse) => void): grpc.ClientUnaryCall;
    public execCommand(request: sandbox_pb.ExecRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.ExecResponse) => void): grpc.ClientUnaryCall;
    public execCommand(request: sandbox_pb.ExecRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.ExecResponse) => void): grpc.ClientUnaryCall;
    public execCommand(request: sandbox_pb.ExecRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.ExecResponse) => void): grpc.ClientUnaryCall;
    public execCommandStream(request: sandbox_pb.ExecRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<sandbox_pb.ExecStreamResponse>;
    public execCommandStream(request: sandbox_pb.ExecRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<sandbox_pb.ExecStreamResponse>;
    public runApplication(request: sandbox_pb.RunAppRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.RunAppResponse) => void): grpc.ClientUnaryCall;
    public runApplication(request: sandbox_pb.RunAppRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.RunAppResponse) => void): grpc.ClientUnaryCall;
    public runApplication(request: sandbox_pb.RunAppRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.RunAppResponse) => void): grpc.ClientUnaryCall;
    public installDependencies(request: sandbox_pb.InstallDepsRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.InstallDepsResponse) => void): grpc.ClientUnaryCall;
    public installDependencies(request: sandbox_pb.InstallDepsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.InstallDepsResponse) => void): grpc.ClientUnaryCall;
    public installDependencies(request: sandbox_pb.InstallDepsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.InstallDepsResponse) => void): grpc.ClientUnaryCall;
    public runServer(request: sandbox_pb.RunServerRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.RunServerResponse) => void): grpc.ClientUnaryCall;
    public runServer(request: sandbox_pb.RunServerRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.RunServerResponse) => void): grpc.ClientUnaryCall;
    public runServer(request: sandbox_pb.RunServerRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.RunServerResponse) => void): grpc.ClientUnaryCall;
    public runServerStream(request: sandbox_pb.RunServerRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<sandbox_pb.RunServerStreamResponse>;
    public runServerStream(request: sandbox_pb.RunServerRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<sandbox_pb.RunServerStreamResponse>;
    public runStaticServer(request: sandbox_pb.RunStaticServerRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.RunStaticServerResponse) => void): grpc.ClientUnaryCall;
    public runStaticServer(request: sandbox_pb.RunStaticServerRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.RunStaticServerResponse) => void): grpc.ClientUnaryCall;
    public runStaticServer(request: sandbox_pb.RunStaticServerRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.RunStaticServerResponse) => void): grpc.ClientUnaryCall;
    public getServers(request: sandbox_pb.GetServersRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.GetServersResponse) => void): grpc.ClientUnaryCall;
    public getServers(request: sandbox_pb.GetServersRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.GetServersResponse) => void): grpc.ClientUnaryCall;
    public getServers(request: sandbox_pb.GetServersRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.GetServersResponse) => void): grpc.ClientUnaryCall;
    public healthCheck(request: sandbox_pb.HealthCheckRequest, callback: (error: grpc.ServiceError | null, response: sandbox_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
    public healthCheck(request: sandbox_pb.HealthCheckRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sandbox_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
    public healthCheck(request: sandbox_pb.HealthCheckRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sandbox_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
}
