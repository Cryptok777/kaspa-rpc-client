#! /bin/sh

cd ../grpc/proto/
rm -f *.proto
wget -q --show-progress https://raw.githubusercontent.com/kaspanet/kaspad/master/infrastructure/network/netadapter/server/grpcserver/protowire/messages.proto
wget -q --show-progress https://raw.githubusercontent.com/kaspanet/kaspad/master/infrastructure/network/netadapter/server/grpcserver/protowire/p2p.proto
wget -q --show-progress https://raw.githubusercontent.com/kaspanet/kaspad/master/infrastructure/network/netadapter/server/grpcserver/protowire/rpc.proto

# Auto gen ts interface
protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_opt=onlyTypes=true --ts_proto_out=. ./src/grpc/proto/rpc.proto