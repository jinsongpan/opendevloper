FROM python:3.12.0

WORKDIR /app

RUN apt-get update && apt-get install -y \
    protobuf-compiler \
    grpc-tools \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. src/sandbox/proto/sandbox.proto

EXPOSE 50051

CMD ["python", "main.py"]
