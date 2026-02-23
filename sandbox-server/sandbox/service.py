import os
import uuid
import shutil
import subprocess
import threading
import shlex
from typing import Generator, Dict
import grpc
from concurrent import futures
from . import sandbox_pb2
from . import sandbox_pb2_grpc

WORKSPACE_DIR = "/tmp/ai-developer-sandbox"


class Sandbox:
    def __init__(self, sandbox_id: str):
        self.sandbox_id = sandbox_id
        self.work_dir = os.path.join(WORKSPACE_DIR, sandbox_id)
        self.processes: list = []
        self.servers: list = []
        os.makedirs(self.work_dir, exist_ok=True)
    
    def cleanup(self):
        for proc in self.processes:
            try:
                proc.terminate()
                proc.wait(timeout=5)
            except:
                try:
                    proc.kill()
                except:
                    pass
        
        for server in self.servers:
            try:
                server['process'].terminate()
            except:
                pass
        
        try:
            shutil.rmtree(self.work_dir, ignore_errors=True)
        except:
            pass


class SandboxService(sandbox_pb2_grpc.SandboxServiceServicer):
    def __init__(self):
        self.sandboxes: Dict[str, Sandbox] = {}
        os.makedirs(WORKSPACE_DIR, exist_ok=True)
        print(f"[SandboxService] Initialized with workspace: {WORKSPACE_DIR}")
    
    def CreateSandbox(self, request, context) -> sandbox_pb2.CreateResponse:
        sandbox_id = str(uuid.uuid4())
        sandbox = Sandbox(sandbox_id)
        self.sandboxes[sandbox_id] = sandbox
        print(f"[SandboxService] Created sandbox: {sandbox_id} at {sandbox.work_dir}")
        return sandbox_pb2.CreateResponse(sandbox_id=sandbox_id, work_dir=sandbox.work_dir)
    
    def DestroySandbox(self, request, context) -> sandbox_pb2.DestroyResponse:
        sandbox_id = request.sandbox_id
        if sandbox_id in self.sandboxes:
            sandbox = self.sandboxes[sandbox_id]
            sandbox.cleanup()
            del self.sandboxes[sandbox_id]
            print(f"[SandboxService] Destroyed sandbox: {sandbox_id}")
        return sandbox_pb2.DestroyResponse(success=True)
    
    def CreateFile(self, request, context) -> sandbox_pb2.CreateFileResponse:
        sandbox_id = request.sandbox_id
        file_path = request.path
        content = request.content
        
        if sandbox_id not in self.sandboxes:
            return sandbox_pb2.CreateFileResponse(success=False)
        
        sandbox = self.sandboxes[sandbox_id]
        full_path = os.path.join(sandbox.work_dir, file_path)
        
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return sandbox_pb2.CreateFileResponse(success=True)
    
    def ReadFile(self, request, context) -> sandbox_pb2.ReadFileResponse:
        sandbox_id = request.sandbox_id
        file_path = request.path
        
        if sandbox_id not in self.sandboxes:
            return sandbox_pb2.ReadFileResponse(content="")
        
        sandbox = self.sandboxes[sandbox_id]
        full_path = os.path.join(sandbox.work_dir, file_path)
        
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return sandbox_pb2.ReadFileResponse(content=content)
        except:
            return sandbox_pb2.ReadFileResponse(content="")
    
    def ListFiles(self, request, context) -> sandbox_pb2.ListFilesResponse:
        sandbox_id = request.sandbox_id
        dir_path = request.dir or ""
        
        if sandbox_id not in self.sandboxes:
            return sandbox_pb2.ListFilesResponse(files=[])
        
        sandbox = self.sandboxes[sandbox_id]
        full_path = os.path.join(sandbox.work_dir, dir_path)
        
        def build_tree(base_path: str, relative_path: str = "") -> list:
            nodes = []
            try:
                for entry in os.scandir(base_path):
                    if entry.name.startswith('.'):
                        continue
                    
                    node_path = os.path.join(relative_path, entry.name) if relative_path else entry.name
                    
                    if entry.is_dir():
                        children = build_tree(entry.path, node_path)
                        nodes.append(sandbox_pb2.FileNode(
                            name=entry.name,
                            path=node_path,
                            type="directory",
                            children=children
                        ))
                    else:
                        nodes.append(sandbox_pb2.FileNode(
                            name=entry.name,
                            path=node_path,
                            type="file"
                        ))
            except:
                pass
            return sorted(nodes, key=lambda x: (x.type != "directory", x.name))
        
        files = build_tree(full_path, dir_path)
        return sandbox_pb2.ListFilesResponse(files=files)
    
    def DeleteFile(self, request, context) -> sandbox_pb2.DeleteFileResponse:
        sandbox_id = request.sandbox_id
        file_path = request.path
        
        if sandbox_id not in self.sandboxes:
            return sandbox_pb2.DeleteFileResponse(success=False)
        
        sandbox = self.sandboxes[sandbox_id]
        full_path = os.path.join(sandbox.work_dir, file_path)
        
        try:
            if os.path.isdir(full_path):
                shutil.rmtree(full_path)
            else:
                os.remove(full_path)
            return sandbox_pb2.DeleteFileResponse(success=True)
        except:
            return sandbox_pb2.DeleteFileResponse(success=False)
    
    def ExecCommand(self, request, context) -> sandbox_pb2.ExecResponse:
        sandbox_id = request.sandbox_id
        command = request.command
        
        if sandbox_id not in self.sandboxes:
            return sandbox_pb2.ExecResponse(output="Sandbox not found", exit_code=1)
        
        sandbox = self.sandboxes[sandbox_id]
        
        try:
            args = shlex.split(command)
            result = subprocess.run(
                args,
                shell=False,
                cwd=sandbox.work_dir,
                capture_output=True,
                text=True,
                timeout=300
            )
            output = result.stdout + result.stderr
            return sandbox_pb2.ExecResponse(output=output, exit_code=result.returncode)
        except subprocess.TimeoutExpired:
            return sandbox_pb2.ExecResponse(output="Command timeout", exit_code=124)
        except Exception as e:
            return sandbox_pb2.ExecResponse(output=str(e), exit_code=1)
    
    def ExecCommandStream(self, request, context) -> Generator[sandbox_pb2.ExecStreamResponse, None, None]:
        sandbox_id = request.sandbox_id
        command = request.command
        
        if sandbox_id not in self.sandboxes:
            return
        
        sandbox = self.sandboxes[sandbox_id]
        
        try:
            process = subprocess.Popen(
                shlex.split(command),
                shell=False,
                cwd=sandbox.work_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=os.setsid
            )
            
            sandbox.processes.append(process)
            
            if process.stdout:
                for line in iter(process.stdout.readline, ''):
                    if not line:
                        break
                    yield sandbox_pb2.ExecStreamResponse(data=line, is_error=False)
            
            if process.stderr:
                for line in iter(process.stderr.readline, ''):
                    if not line:
                        break
                    yield sandbox_pb2.ExecStreamResponse(data=line, is_error=True)
            
            process.wait()
            
        except Exception as e:
            yield sandbox_pb2.ExecStreamResponse(data=str(e), is_error=True)
    
    def RunApplication(self, request, context) -> sandbox_pb2.RunAppResponse:
        return self.ExecCommand(
            sandbox_pb2.ExecRequest(sandbox_id=request.sandbox_id, command=request.command),
            context
        )
    
    def InstallDependencies(self, request, context) -> sandbox_pb2.InstallDepsResponse:
        sandbox_id = request.sandbox_id
        
        if sandbox_id not in self.sandboxes:
            return sandbox_pb2.InstallDepsResponse(output="Sandbox not found", exit_code=1)
        
        sandbox = self.sandboxes[sandbox_id]
        output = ""
        exit_code = 0
        
        requirements_txt = os.path.join(sandbox.work_dir, 'requirements.txt')
        package_json = os.path.join(sandbox.work_dir, 'package.json')
        
        if os.path.exists(requirements_txt):
            output += "Detected requirements.txt, installing dependencies...\n"
            result = subprocess.run(
                ["pip", "install", "-r", "requirements.txt"],
                shell=False,
                cwd=sandbox.work_dir,
                capture_output=True,
                text=True
            )
            output += result.stdout + result.stderr
            exit_code = result.returncode
        elif os.path.exists(package_json):
            output += "Detected package.json, installing dependencies...\n"
            result = subprocess.run(
                ["npm", "install"],
                shell=False,
                cwd=sandbox.work_dir,
                capture_output=True,
                text=True
            )
            output += result.stdout + result.stderr
            exit_code = result.returncode
        else:
            output += "No package manager detected, skipping\n"
        
        return sandbox_pb2.InstallDepsResponse(output=output, exit_code=exit_code)
    
    def RunServer(self, request, context) -> sandbox_pb2.RunServerResponse:
        import socket
        
        def is_port_available(port):
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                try:
                    s.bind(('127.0.0.1', port))
                    return True
                except OSError:
                    return False
        
        def kill_port(port):
            try:
                import subprocess
                subprocess.run(f'lsof -ti:{port} | xargs kill -9 2>/dev/null || true', shell=True, check=False)
                time.sleep(0.5)
            except:
                pass
        
        sandbox_id = request.sandbox_id
        command = request.command
        port = int(request.port or 8000)
        
        if sandbox_id not in self.sandboxes:
            return sandbox_pb2.RunServerResponse(output="Sandbox not found", exit_code=1)
        
        sandbox = self.sandboxes[sandbox_id]
        
        base_port = max(port, 3001)
        for i in range(100):
            if is_port_available(port):
                break
            print(f"[SandboxService] Port {port} is occupied, trying to kill and reuse...")
            kill_port(port)
            port += 1
            if port > 9999:
                port = base_port
        
        port_str = str(port)
        command_with_port = command.replace('8000', port_str)
        
        try:
            process = subprocess.Popen(
                shlex.split(command_with_port),
                shell=False,
                cwd=sandbox.work_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=os.setsid
            )
            
            sandbox.processes.append(process)
            pid = process.pid
            url = f"http://localhost:{port}"
            
            sandbox.servers.append({
                'process': process,
                'port': port,
                'url': url,
                'pid': pid
            })
            
            time.sleep(2)
            
            output = f"Server started: {url}\n"
            return sandbox_pb2.RunServerResponse(
                output=output,
                url=url,
                port=port,
                pid=pid,
                exit_code=0
            )
            
        except Exception as e:
            return sandbox_pb2.RunServerResponse(output=str(e), exit_code=1)
    
    def RunServerStream(self, request, context) -> Generator[sandbox_pb2.RunServerStreamResponse, None, None]:
        sandbox_id = request.sandbox_id
        command = request.command
        port = request.port or "8000"
        
        if sandbox_id not in self.sandboxes:
            return
        
        sandbox = self.sandboxes[sandbox_id]
        
        try:
            process = subprocess.Popen(
                shlex.split(command),
                shell=False,
                cwd=sandbox.work_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                preexec_fn=os.setsid
            )
            
            sandbox.processes.append(process)
            pid = process.pid
            url = f"http://localhost:{port}"
            
            sandbox.servers.append({
                'process': process,
                'port': port,
                'url': url,
                'pid': pid
            })
            
            yield sandbox_pb2.RunServerStreamResponse(
                data=f"Server starting on {url}\n",
                port=int(port),
                url=url,
                is_error=False
            )
            
            if process.stdout:
                for line in iter(process.stdout.readline, ''):
                    if not line:
                        break
                    yield sandbox_pb2.RunServerStreamResponse(data=line, is_error=False)
            
            if process.stderr:
                for line in iter(process.stderr.readline, ''):
                    if not line:
                        break
                    yield sandbox_pb2.RunServerStreamResponse(data=line, is_error=True)
            
        except Exception as e:
            yield sandbox_pb2.RunServerStreamResponse(data=str(e), is_error=True)
    
    def RunStaticServer(self, request, context) -> sandbox_pb2.RunStaticServerResponse:
        sandbox_id = request.sandbox_id
        port = request.port or "8000"
        
        if sandbox_id not in self.sandboxes:
            return sandbox_pb2.RunStaticServerResponse(url="", port=0, pid=0)
        
        sandbox = self.sandboxes[sandbox_id]
        
        command = ["python3", "-m", "http.server", port]
        
        try:
            process = subprocess.Popen(
                command,
                shell=False,
                cwd=sandbox.work_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=os.setsid
            )
            
            sandbox.processes.append(process)
            pid = process.pid
            url = f"http://localhost:{port}"
            
            sandbox.servers.append({
                'process': process,
                'port': port,
                'url': url,
                'pid': pid
            })
            
            import time
            time.sleep(1)
            
            return sandbox_pb2.RunStaticServerResponse(url=url, port=int(port), pid=pid)
        except Exception as e:
            return sandbox_pb2.RunStaticServerResponse(url=str(e), port=0, pid=0)
    
    def GetServers(self, request, context) -> sandbox_pb2.GetServersResponse:
        sandbox_id = request.sandbox_id
        
        if sandbox_id not in self.sandboxes:
            return sandbox_pb2.GetServersResponse(servers=[])
        
        sandbox = self.sandboxes[sandbox_id]
        
        servers = []
        for server in sandbox.servers:
            servers.append(sandbox_pb2.ServerInfo(
                sandbox_id=sandbox_id,
                port=int(server['port']),
                url=server['url'],
                pid=server['pid'],
                start_time=0
            ))
        
        return sandbox_pb2.GetServersResponse(servers=servers)
    
    def HealthCheck(self, request, context) -> sandbox_pb2.HealthCheckResponse:
        return sandbox_pb2.HealthCheckResponse(healthy=True)


def serve(port: int = 50051):
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    sandbox_pb2_grpc.add_SandboxServiceServicer_to_server(SandboxService(), server)
    server.add_insecure_port(f'[::]:{port}')
    server.start()
    print(f'[SandboxService] gRPC server started on port {port}')
    server.wait_for_termination()


if __name__ == '__main__':
    serve()
