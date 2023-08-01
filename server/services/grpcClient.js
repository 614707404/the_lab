const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

// Load the protobuf
const packageDefinition = protoLoader.loadSync('./protos/service.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

// Create the client

const client = new protoDescriptor.streaming.StreamingService('localhost:50051', grpc.credentials.createInsecure());

// Export the client
module.exports = client;
