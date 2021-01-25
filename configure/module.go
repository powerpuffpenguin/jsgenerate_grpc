package configure

import "encoding/json"

// Module module configure
type Module struct {
	// enable module
	Enable []string
	// module configure
	Data map[string]json.RawMessage
}
