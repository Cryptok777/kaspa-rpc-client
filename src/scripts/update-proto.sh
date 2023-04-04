#! /bin/sh

cd ../grpc/proto/
rm -f *.proto
wget -q --show-progress https://raw.githubusercontent.com/kaspanet/kaspad/master/infrastructure/network/netadapter/server/grpcserver/protowire/messages.proto
wget -q --show-progress https://raw.githubusercontent.com/kaspanet/kaspad/master/infrastructure/network/netadapter/server/grpcserver/protowire/p2p.proto
wget -q --show-progress https://raw.githubusercontent.com/kaspanet/kaspad/master/infrastructure/network/netadapter/server/grpcserver/protowire/rpc.proto