package management

import (
	"context"
	"strings"
)

type mdContext struct {
}

// MD is a mapping from metadata keys to value
type MD map[string]interface{}

func newMD() interface{} {
	return make(MD)
}

// FromContext .
func FromContext(ctx context.Context) (md MD, ok bool) {
	md, ok = ctx.Value(mdContext{}).(MD)
	return
}

// Get obtains the values for a given key.
func (md MD) Get(k string) interface{} {
	k = strings.ToLower(k)
	return md[k]
}

// Set sets the value of a given key with a slice of values.
func (md MD) Set(k string, val interface{}) {
	k = strings.ToLower(k)
	md[k] = val
}

// Delete key
func (md MD) Delete(key string) {
	delete(md, key)
}

// Clear clear keys
func (md MD) Clear() {
	for k := range md {
		delete(md, k)
	}
}
