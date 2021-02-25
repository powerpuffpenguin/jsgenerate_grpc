# jsgenerate_grpc

[English](https://github.com/powerpuffpenguin/jsgenerate_grpc/blob/master/README.md)

一個 grpc框架模板 借由 [jsgenerate](https://github.com/powerpuffpenguin/jsgenerate) 工具 快速創建一個 grpc服務器 框架 ,可以和 gin grpc-gateway 一起工作。

# 安裝

安裝好 [jsgenerate](https://github.com/powerpuffpenguin/jsgenerate) 後 將項目 clone 到 **~/.jsgenerate/init** 檔案夾

# new project

使用如下指令 在當前目錄 初始化 框架 

```
jsgenerate init jsgenerate_grpc -p your_domain/your_project -t init-supplement -t default
```

請將 **your_domain/your_project** 替換爲你自己的項目 包名

|tag|含義|
|---|---|
|init-supplement|跳過已有檔案|
|init-trunc|覆蓋已有檔案|
|gateway|創建gateway代碼|
|gin|創建gateway,gin代碼|
|view|創建gateway,gin代碼以及一個默認的angular前端代碼|
|db|創建數據庫代碼|
|default|gateway+gin+view+db|

# 目錄結構

* bin -> 輸出檔案目錄
* cmd -> 控制檯指令解析
   * cmd/internal/daemon -> 框架入口
* configure -> 項目配置檔案解析
* js-build -> typescript 實現的自動化腳本
* build.js -> 自動化腳本
* logger -> 日誌系統
* management -> grpc 模塊管理 中間件
   * module -> grpc 模塊
   * pb -> grpc protocol 定義
   * protocol -> protoc 生成的 golang grpc 代碼
* static -> 在使用 gin 時，嵌入的web靜態檔案
* third_party -> googleapis
* utils -> 一些項目用到的工具函數型別
* web -> 嵌入的 gin 支持
* view -> 使用 view 標籤初始化時，創建的angular前端項目

# 模塊

package management 中的 struct Management  實現了 模塊管理和中間件 management.DefaultManagement() 會返回默認的模塊管理器

Management 會依據 grpc 請求的 fullMethod 來確認處理模塊 fullMethod 按照 前綴+模塊id+實現方法 來解析 例如
1. 項目前綴(由項目名稱生成)爲 /jsgenerate_kk.
2. fullMethod 爲 /jsgenerate_kk.features.logger/Service.Level
3. 此時Management會將 請求轉發給 features.logger 模塊的 Service.Level 來響應
4. 此時 proto 中應該定義 `package jsgenerate_kk.features.logger;`

**pb/features** 和 **module/features** 應該一一對應 分別用於定義 grpc 和 實現 grpc 模塊。你可以參考生成的默認模塊來實現自己的模塊。

一個 Management 模塊 需要實現 Module 接口

```
// Module grpc module interface
type Module interface {
	// ID module id must lower case and unique
	ID() string

	// OnStart callback at before started 
	OnStart(basePath string, data json.RawMessage)

	// RegisterGRPC register grpc 
	RegisterGRPC(srv *grpc.Server, middleware *Middleware) error
	// RegisterGateway  register grpc-gateway
	RegisterGateway(srv *runtime.ServeMux, clientConn *grpc.ClientConn) error

	// OnReload callback when module should reload configure
	OnReload(basePath string, data json.RawMessage, tag string) (e error)

	// OnClearDBCache callback when module should clear db cache
	OnClearDBCache(tag string) error

	// OnClearCache callback when module should clear cache
	OnClearCache(tag string) error

	// OnStop callback at before stoped 
	OnStop()
}
```

> 如果不需要支持 grpc-gateway 則無需定義 RegisterGateway

# 中間件

* package management 實現了一個中間件 中間是兩個兼容 grpc interceptor 的函數, 你應該在 RegisterGRPC 中 爲當前模塊的函數實現註冊中間件
* 你可以參考 **/module/features** 中的默認模塊來查看如何使用中間件
* 你可以參考 **/module/interceptor.go** 中的實現來實現自己的中間件

# build.js

build.js 是一個 nodejs 下的 自動化工具 提供了項目的 編譯功能

```
$ ./build.js 
Usage: ./build.js [options] [command]

Options:
  -h, --help         display help for command

Commands:
  linux [options]    build code to linux
  freebsd [options]  build code to freebsd
  darwin [options]   build code to darwin
  windows [options]  build code to windows
  version            update version/version.go
  test [options]     run go test
  grpc [options]     build *.proto to grpc code
  source             build static source to golang code
  help [command]     display help for command
```

example
```
# 將 /pb 中 的 proto 生成 golang的 grpc 實現
# 如果啓用了 grpc-gateway 請參考 https://github.com/grpc-ecosystem/grpc-gateway 配置好 環境
./build.js grpc -l go

# 將 /static 嵌入到網頁前端，如果沒有啓用 gin 功能則不需要此操作
./build.js source

# 編譯 linux/freebsd/darwin/windows 程式  
./build.js linux
```