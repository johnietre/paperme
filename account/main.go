package main

import (
  "context"
  "log"
  "net"
  "sync"

  "github.com/google/uuid"
  psutils "github.com/johnietre/pubsub/utils"
  "google.golang.org/grpc"
  "google.golang.org/grpc/codes"
  "google.golang.org/grpc/status"
  pb "paperme/account/v1"
)

var (
  addr = "127.0.0.1:8000"
  accounts = psutils.NewSyncMap[string, *pb.Account]()
)

func main() {
  ls, err := net.Listen("tcp", addr)
  if err != nil {
    log.Fatal(err)
  }
  s := grpc.NewServer()
  pb.RegisterAccountAPIServer(s, &server{})
  log.Fatal(s.Serve(ls))
}

/* Server */

type server struct {
  pb.UnimplementedAccountAPIServer
}

func (s *server) CreateAccount(
  ctx context.Context, req *pb.CreateAccountRequest,
) (*pb.CreateAccountResponse, error) {
  return nil, nil
}

func (s *server) LoginAccount(
  ctx context.Context, req *pb.LoginAccountRequest,
) (*pb.LoginAccountResponse, error) {
  if req.GetEmail() == "" || req.GetPassword() == "" {
    //
  }
  return nil, nil
}

func (s *server) LogoutAccount(
  ctx context.Context, req *pb.LogoutAccountRequest,
) (*pb.LogoutAccountResponse, error) {
  return nil, nil
}

func (s *server) DeleteAccount(
  ctx context.Context, req *pb.DeleteAccountRequest,
) (*pb.DeleteAccountResponse, error) {
  return nil, nil
}

func authInterceptor(
  ctx context.Context,
  req interface{},
  info *grpc.UnaryServerInfo,
  handler grpc.UnaryHandler,
) (interface{}, error) {
  md, ok := metadata
}

/* Account Functions */
