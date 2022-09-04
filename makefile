account_proto: account/v1/*.proto
	protoc --go_out=.. --go-grpc_out=.. $^
