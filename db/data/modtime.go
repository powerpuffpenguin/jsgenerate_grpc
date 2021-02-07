package data

const (
	// TableModtimeName .
	TableModtimeName = `modtime`
	// ColModtimeID .
	ColModtimeID = `id`
	// ColModtimeUnix .
	ColModtimeUnix = `unix`
	// ColModtimeETag .
	ColModtimeETag = `etag`
	// ColModtimeDescription .
	ColModtimeDescription = `description`
)

// Modtime 記錄 數據 最後修改時間
type Modtime struct {
	ID          int32  `xorm:"pk 'id'"`
	Unix        int64  `xorm:"'unix'"`
	ETag        string `xorm:"'etag'"`
	Description string `xorm:"'description'"`
}

// TableName .
func (Modtime) TableName() string {
	return TableModtimeName
}
