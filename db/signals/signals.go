package signals

import (
	"sync"

	"gitlab.com/king011_go/signals/metadata"
)

var (
	defaultSignals Signals
)

func init() {
	defaultSignals.Init()
}

// Default return default Signals
func Default() *Signals {
	return &defaultSignals
}

// Signals and slots
type Signals struct {
	noCopy
	pool    sync.Pool
	Session Session
}

// Get .
func (s *Signals) Get() metadata.MD {
	return s.pool.Get().(metadata.MD)
}

// Put .
func (s *Signals) Put(md metadata.MD) {
	md.Clear()
	s.pool.Put(md)
}

// Init .
func (s *Signals) Init() {
	s.pool.New = func() interface{} {
		return metadata.MD{}
	}
	s.Session.pool = s
}

type pool interface {
	Get() metadata.MD
	Put(metadata.MD)
}
