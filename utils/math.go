package utils

import "regexp"

var matchName = regexp.MustCompile(`^[a-zA-Z][a-zA-Z0-9]+$`)

// MatchName if match user name return true
func MatchName(val string) bool {
	if len(val) < 4 {
		return false
	}
	return matchName.MatchString(val)
}
