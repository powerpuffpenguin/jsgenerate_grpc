package management

import (
	"context"

	"google.golang.org/grpc"
)

type serverStream struct {
	grpc.ServerStream
	ctx context.Context
}

func (ss serverStream) Context() context.Context {
	return ss.ctx
}

// UnaryInterceptor .
func (m *Management) UnaryInterceptor(ctx context.Context,
	req interface{},
	info *grpc.UnaryServerInfo,
	handler grpc.UnaryHandler,
) (interface{}, error) {
	md := m.ctxPool.Get().(MD)
	md.Clear()
	ctx = context.WithValue(ctx, mdContext{}, md)

	interceptor := m.middleware.unaryInterceptor(info, handler)
	result, e := interceptor.Next(ctx, req)
	m.middleware.completeUnaryInterceptor(interceptor)

	m.ctxPool.Put(md)
	return result, e
}

// StreamInterceptor .
func (m *Management) StreamInterceptor(srv interface{},
	ss grpc.ServerStream,
	info *grpc.StreamServerInfo,
	handler grpc.StreamHandler,
) error {
	md := m.ctxPool.Get().(MD)
	md.Clear()

	ss = serverStream{
		ServerStream: ss,
		ctx:          context.WithValue(ss.Context(), mdContext{}, md),
	}

	interceptor := m.middleware.streamInterceptor(info, handler)
	e := interceptor.Next(srv, ss)
	m.middleware.completeStreamInterceptor(interceptor)

	m.ctxPool.Put(md)
	return e
}
