# jsgenerate_grpc

[中文](https://github.com/powerpuffpenguin/jsgenerate_grpc/blob/master/README_ZH.md)

A grpc framework template Use [jsgenerate](https://github.com/powerpuffpenguin/jsgenerate) tool to quickly create a grpc server framework, which can work with gin grpc-gateway.

# install

After installing [jsgenerate](https://github.com/powerpuffpenguin/jsgenerate), clone the project to the **~/.jsgenerate/init** folder

# new project

Use the following command to initialize the frame in the current directory

```
jsgenerate init jsgenerate_grpc -p your_domain/your_project -t init-supplement -t default
```

Please replace **your_domain/your_project** with your own project package name

|tag|meaning|
|---|---|
|init-supplement|Skip existing files|
|init-trunc|Overwrite existing file|
|gateway|Generate gateway code|
|gin|Generate gateway,gin code|
|view|Generate gateway, gin code and a default angular front-end code|
|db|Generate database code|
|default|gateway+gin+view+db|