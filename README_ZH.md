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

# 目錄架構