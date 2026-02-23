#!/usr/bin/env python3
"""
AI Developer Sandbox Server
Remote gRPC-based sandbox service
"""

import os
import sys
import signal
from sandbox.service import serve, SandboxService

def main():
    port = int(os.environ.get('SANDBOX_PORT', '50051'))
    
    print(f"Starting Sandbox Server on port {port}...")
    
    def signal_handler(sig, frame):
        print("\nShutting down Sandbox Server...")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    serve(port)

if __name__ == '__main__':
    main()
