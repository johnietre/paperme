account_proto: account/v1/*.proto
	protoc --go_out=.. --go-grpc_out=.. $^

bin/p2ts: p2ts/main.rs
	rustc $^ -o $@

p2ts: bin/p2ts
