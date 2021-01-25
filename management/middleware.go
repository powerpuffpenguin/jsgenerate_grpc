package management

import (
	"context"
	"strings"
	"sync"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type unaryHandler struct {
	offset      int
	interceptor []grpc.UnaryServerInterceptor
	info        *grpc.UnaryServerInfo
	handler     grpc.UnaryHandler
	pool        bool
}

func (h *unaryHandler) Next(ctx context.Context, req interface{}) (response interface{}, e error) {
	count := len(h.interceptor)
	if h.offset == count {
		h.offset++
		response, e = h.handler(ctx, req)
	} else if h.offset < count {
		interceptor := h.interceptor[h.offset]
		h.offset++
		response, e = interceptor(ctx, req, h.info, h.Next)
	} else {
		e = status.Error(codes.Internal, `UnaryInterceptor next out of range`)
	}
	return
}

type streamHandler struct {
	offset      int
	interceptor []grpc.StreamServerInterceptor
	info        *grpc.StreamServerInfo
	handler     grpc.StreamHandler
	pool        bool
}

func (h *streamHandler) Next(rv interface{}, ss grpc.ServerStream) (e error) {
	count := len(h.interceptor)
	if h.offset == count {
		h.offset++
		e = h.handler(rv, ss)
	} else if h.offset < count {
		interceptor := h.interceptor[h.offset]
		h.offset++
		e = interceptor(rv, ss, h.info, h.Next)
	} else {
		e = status.Error(codes.Internal, `StreamInterceptor next out of range`)
	}
	return
}

// Middleware for grpc
type Middleware struct {
	noCopy noCopy

	// global interceptor
	unary  []grpc.UnaryServerInterceptor
	stream []grpc.StreamServerInterceptor

	// module interceptor
	moduleUnaryInterceptor  map[string][]grpc.UnaryServerInterceptor
	moduleStreamInterceptor map[string][]grpc.StreamServerInterceptor

	// method interceptor
	methodUnaryInterceptor  map[string][]grpc.UnaryServerInterceptor
	methodStreamInterceptor map[string][]grpc.StreamServerInterceptor

	unaryHandlerPool      sync.Pool
	unaryInterceptorPool  sync.Pool
	streamHandlerPool     sync.Pool
	streamInterceptorPool sync.Pool
}

func (m *Middleware) init() {
	m.moduleUnaryInterceptor = make(map[string][]grpc.UnaryServerInterceptor)
	m.moduleStreamInterceptor = make(map[string][]grpc.StreamServerInterceptor)
	m.methodUnaryInterceptor = make(map[string][]grpc.UnaryServerInterceptor)
	m.methodStreamInterceptor = make(map[string][]grpc.StreamServerInterceptor)

	m.unaryHandlerPool.New = func() interface{} {
		return new(unaryHandler)
	}
	m.unaryInterceptorPool.New = func() interface{} {
		return make([]grpc.UnaryServerInterceptor, 0, 64)
	}
	m.streamHandlerPool.New = func() interface{} {
		return new(streamHandler)
	}
	m.streamInterceptorPool.New = func() interface{} {
		return make([]grpc.StreamServerInterceptor, 0, 64)
	}
}
func (m *Middleware) getModule(fullMethod string) (module string, method string) {
	if len(fullMethod) < len(grpcPackage) {
		return
	}

	method = strings.ToLower(fullMethod[len(grpcPackage):])
	// get module name
	find := strings.LastIndex(method, ".")
	if find < 1 {
		return
	}
	module = method[:find]
	return
}
func (m *Middleware) mergeUnary(one, two, three []grpc.UnaryServerInterceptor) (interceptors []grpc.UnaryServerInterceptor, pool bool) {
	count := len(one)
	if count != 0 {
		interceptors = one
	}

	add := len(two)
	if add != 0 {
		count += add
		if count == 0 {
			interceptors = two
		} else {
			pool = true
			tmp := m.unaryInterceptorPool.Get().([]grpc.UnaryServerInterceptor)[:0]
			tmp = append(tmp, interceptors...)
			interceptors = append(tmp, two...)
		}
	}

	add = len(three)
	if add != 0 {
		if count == 0 {
			interceptors = three
		} else {
			if pool {
				interceptors = append(interceptors, three...)
			} else {
				pool = true
				tmp := m.unaryInterceptorPool.Get().([]grpc.UnaryServerInterceptor)[:0]
				tmp = append(tmp, interceptors...)
				interceptors = append(tmp, three...)
			}
		}
	}
	return
}

// unaryInterceptor return unary interceptor
func (m *Middleware) unaryInterceptor(info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interceptor *unaryHandler) {
	module, method := m.getModule(info.FullMethod)
	interceptors, pool := m.mergeUnary(m.unary,
		m.moduleUnaryInterceptor[module],
		m.methodUnaryInterceptor[method],
	)

	interceptor = m.unaryHandlerPool.Get().(*unaryHandler)
	interceptor.offset = 0
	interceptor.interceptor = interceptors
	interceptor.pool = pool
	interceptor.info = info
	interceptor.handler = handler
	return
}

// completeUnaryInterceptor complete unary interceptor
func (m *Middleware) completeUnaryInterceptor(interceptor *unaryHandler) {
	if interceptor.pool {
		m.unaryInterceptorPool.Put(interceptor.interceptor)
		interceptor.interceptor = nil
	}
	m.unaryHandlerPool.Put(interceptor)
}
func (m *Middleware) mergeStream(one, two, three []grpc.StreamServerInterceptor) (interceptors []grpc.StreamServerInterceptor, pool bool) {
	count := len(one)
	if count != 0 {
		interceptors = one
	}

	add := len(two)
	if add != 0 {
		count += add
		if count == 0 {
			interceptors = two
		} else {
			pool = true
			tmp := m.streamInterceptorPool.Get().([]grpc.StreamServerInterceptor)[:0]
			tmp = append(tmp, interceptors...)
			interceptors = append(tmp, two...)
		}
	}

	add = len(three)
	if add != 0 {
		if count == 0 {
			interceptors = three
		} else {
			if pool {
				interceptors = append(interceptors, three...)
			} else {
				pool = true
				tmp := m.streamInterceptorPool.Get().([]grpc.StreamServerInterceptor)[:0]
				tmp = append(tmp, interceptors...)
				interceptors = append(tmp, three...)
			}
		}
	}
	return
}

// streamInterceptor return stream interceptor
func (m *Middleware) streamInterceptor(info *grpc.StreamServerInfo, handler grpc.StreamHandler) (interceptor *streamHandler) {
	module, method := m.getModule(info.FullMethod)

	interceptors, pool := m.mergeStream(m.stream,
		m.moduleStreamInterceptor[module],
		m.methodStreamInterceptor[method],
	)

	interceptor = m.streamHandlerPool.Get().(*streamHandler)
	interceptor.offset = 0
	interceptor.interceptor = interceptors
	interceptor.pool = pool
	interceptor.info = info
	interceptor.handler = handler
	return
}

// completeStreamInterceptor complete stream interceptor
func (m *Middleware) completeStreamInterceptor(interceptor *streamHandler) {
	if interceptor.pool {
		m.streamInterceptorPool.Put(interceptor.interceptor)
		interceptor.interceptor = nil
	}
	m.streamHandlerPool.Put(interceptor)
}

// UnaryInterceptor add global interceptor for unary
func (m *Middleware) UnaryInterceptor(interceptor ...grpc.UnaryServerInterceptor) *Middleware {
	if len(interceptor) != 0 {
		m.unary = append(m.unary, interceptor...)
	}
	return m
}

// ModuleUnaryInterceptor add module interceptor for unary
func (m *Middleware) ModuleUnaryInterceptor(module string, interceptor ...grpc.UnaryServerInterceptor) *Middleware {
	if len(interceptor) != 0 {
		module = strings.ToLower(module)
		m.moduleUnaryInterceptor[module] = append(m.moduleUnaryInterceptor[module], interceptor...)
	}
	return m
}

// MethodUnaryInterceptor add method interceptor for unary
func (m *Middleware) MethodUnaryInterceptor(module, medthod string, interceptor ...grpc.UnaryServerInterceptor) *Middleware {
	if len(interceptor) != 0 {
		key := strings.ToLower(module + `.` + medthod)
		m.methodUnaryInterceptor[key] = append(m.methodUnaryInterceptor[key], interceptor...)
	}
	return m
}

// StreamInterceptor add global interceptor for stream
func (m *Middleware) StreamInterceptor(interceptor ...grpc.StreamServerInterceptor) *Middleware {
	if len(interceptor) != 0 {
		m.stream = append(m.stream, interceptor...)
	}
	return m
}

// ModuleStreamInterceptor add module interceptor for stream
func (m *Middleware) ModuleStreamInterceptor(module string, interceptor ...grpc.StreamServerInterceptor) *Middleware {
	if len(interceptor) != 0 {
		module = strings.ToLower(module)
		m.moduleStreamInterceptor[module] = append(m.moduleStreamInterceptor[module], interceptor...)
	}
	return m
}

// MethodStreamInterceptor add method interceptor for stream
func (m *Middleware) MethodStreamInterceptor(module, medthod string, interceptor ...grpc.StreamServerInterceptor) *Middleware {
	if len(interceptor) != 0 {
		key := strings.ToLower(module + `.` + medthod)
		m.methodStreamInterceptor[key] = append(m.methodStreamInterceptor[key], interceptor...)
	}
	return m
}

// Module return helper
func (m *Middleware) Module(moduleID string) *MiddlewareHelper {
	return &MiddlewareHelper{
		middleware: m,
		module:     strings.ToLower(moduleID),
	}
}

// MiddlewareHelper .
type MiddlewareHelper struct {
	middleware *Middleware
	module     string
}

// ModuleUnary add module interceptor for unary
func (h *MiddlewareHelper) ModuleUnary(interceptor ...grpc.UnaryServerInterceptor) *MiddlewareHelper {
	h.middleware.ModuleUnaryInterceptor(h.module, interceptor...)
	return h
}

// MethodUnary add method interceptor for unary
func (h *MiddlewareHelper) MethodUnary(medthod string, interceptor ...grpc.UnaryServerInterceptor) *MiddlewareHelper {
	h.middleware.MethodUnaryInterceptor(h.module, medthod, interceptor...)
	return h
}

// UnaryMethod add method interceptor for unary
func (h *MiddlewareHelper) UnaryMethod(interceptor grpc.UnaryServerInterceptor, medthods ...string) *MiddlewareHelper {
	for _, medthod := range medthods {
		h.middleware.MethodUnaryInterceptor(h.module, medthod, interceptor)
	}
	return h
}

// ModuleStream add module interceptor for stream
func (h *MiddlewareHelper) ModuleStream(interceptor ...grpc.StreamServerInterceptor) *MiddlewareHelper {
	h.middleware.ModuleStreamInterceptor(h.module, interceptor...)
	return h
}

// MethodStream add method interceptor for stream
func (h *MiddlewareHelper) MethodStream(medthod string, interceptor ...grpc.StreamServerInterceptor) *MiddlewareHelper {
	h.middleware.MethodStreamInterceptor(h.module, medthod, interceptor...)
	return h
}

// StreamMethod add method interceptor for stream
func (h *MiddlewareHelper) StreamMethod(interceptor grpc.StreamServerInterceptor, medthods ...string) *MiddlewareHelper {
	for _, medthod := range medthods {
		h.middleware.MethodStreamInterceptor(h.module, medthod, interceptor)
	}
	return h
}

// Method add method interceptor
func (h *MiddlewareHelper) Method(unary grpc.UnaryServerInterceptor, stream grpc.StreamServerInterceptor, medthods ...string) *MiddlewareHelper {
	for _, medthod := range medthods {
		if unary != nil {
			h.middleware.MethodUnaryInterceptor(h.module, medthod, unary)
		}
		if stream != nil {
			h.middleware.MethodStreamInterceptor(h.module, medthod, stream)
		}
	}
	return h
}
