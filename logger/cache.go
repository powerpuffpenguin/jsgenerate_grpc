package logger

import (
	"runtime"

	"go.uber.org/zap/zapcore"
)

type loggerCache struct {
	ch     chan []byte
	buffer []byte
	size   int
	writer zapcore.WriteSyncer
}

func newLoggerCache(writer zapcore.WriteSyncer, bufferSize int) *loggerCache {
	l := &loggerCache{
		ch:     make(chan []byte, runtime.GOMAXPROCS(0)),
		buffer: make([]byte, bufferSize),
		writer: writer,
	}
	go l.run()
	return l
}
func (l *loggerCache) Sync() error {
	return l.writer.Sync()
}
func (l *loggerCache) Write(b []byte) (count int, e error) {
	count = len(b)
	if count > 0 {
		data := make([]byte, count)
		copy(data, b)
		l.ch <- data
	}
	return
}
func (l *loggerCache) run() {
	var (
		r = reader{
			ch: l.ch,
		}
		n int
	)
	for {
		n, _ = r.Read(l.buffer)
		if n > 0 {
			l.writer.Write(l.buffer[:n])
		}
	}
}

type reader struct {
	ch     chan []byte
	buffer []byte
}

func (r *reader) Read(p []byte) (sum int, e error) {
	if len(p) == 0 {
		return
	}

	for r.buffer == nil {
		buffer := <-r.ch
		if len(buffer) != 0 {
			r.buffer = buffer
		}
	}

	var n int
	for len(p) != 0 {
		if !r.getBuffer() {
			break
		}

		n = r.copyBuffer(p)
		p = p[n:]
		sum += n
	}
	return
}
func (r *reader) getBuffer() (ok bool) {
	if r.buffer != nil {
		ok = true
		return
	}
	select {
	case buffer := <-r.ch:
		r.buffer = buffer
		ok = true
	default:
	}
	return
}
func (r *reader) copyBuffer(p []byte) (n int) {
	n = copy(p, r.buffer)
	r.buffer = r.buffer[n:]
	if len(r.buffer) == 0 {
		r.buffer = nil
	}
	return
}
