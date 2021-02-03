package module

import (
	"context"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// UnaryInterceptorCheckAccessSession unary check access session
func (s Service) UnaryInterceptorCheckAccessSession(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (response interface{}, e error) {
	_, e = s.AccessSession(ctx)
	if e != nil {
		return
	}
	response, e = handler(ctx, req)
	return
}

// StreamInterceptorCheckAccessSession stream check access session
func (s Service) StreamInterceptorCheckAccessSession(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) (e error) {
	ctx := ss.Context()
	_, e = s.AccessSession(ctx)
	if e != nil {
		return
	}
	e = handler(srv, ss)
	return
}

// UnaryInterceptorCheckRefreshSession unary check refresh session
func (s Service) UnaryInterceptorCheckRefreshSession(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (response interface{}, e error) {
	_, e = s.RefreshSession(ctx)
	if e != nil {
		return
	}
	response, e = handler(ctx, req)
	return
}

// StreamInterceptorCheckRefreshSession stream check refresh session
func (s Service) StreamInterceptorCheckRefreshSession(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) (e error) {
	ctx := ss.Context()
	_, e = s.RefreshSession(ctx)
	if e != nil {
		return
	}
	e = handler(srv, ss)
	return
}

// UnaryInterceptorCheckSignin unary check signin
func (s Service) UnaryInterceptorCheckSignin(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (response interface{}, e error) {
	_, e = s.Session(ctx)
	if e != nil {
		return
	}
	response, e = handler(ctx, req)
	return
}

// StreamInterceptorCheckSignin stream check signin
func (s Service) StreamInterceptorCheckSignin(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) (e error) {
	ctx := ss.Context()
	_, e = s.Session(ctx)
	if e != nil {
		return
	}
	e = handler(srv, ss)
	return
}

// UnaryInterceptorCheckRoot unary check root
func (s Service) UnaryInterceptorCheckRoot(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (response interface{}, e error) {
	session, e := s.Session(ctx)
	if e != nil {
		return
	} else if !session.IsRoot() {
		e = status.Error(codes.PermissionDenied, `only root can access`)
		return
	}
	response, e = handler(ctx, req)
	return
}

// StreamInterceptorCheckRoot stream check root
func (s Service) StreamInterceptorCheckRoot(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) (e error) {
	ctx := ss.Context()
	session, e := s.Session(ctx)
	if e != nil {
		return
	} else if !session.IsRoot() {
		e = status.Error(codes.PermissionDenied, `only root can access`)
		return
	}
	e = handler(srv, ss)
	return
}
