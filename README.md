# fec-builder-helper

[fec-builder](https://github.com/Front-End-Engineering-Cloud/builder) 助手

## Features

- 根据 fec-builder 中定义的 build-config 的 JSON schema，为项目中编辑 build-config 提供 hover 提示
  **Usage:** `cmd+shift+p` 后输入 `loadSchema` 并执行

  - 正确性校验

    ![正确性校验](https://user-images.githubusercontent.com/5511451/69794179-c5726880-1204-11ea-9d50-354a6df8cfad.png)

  - 字段释义

    ![字段释义](https://user-images.githubusercontent.com/5511451/69793995-6ca2d000-1204-11ea-9903-1be9a008e8ae.png)

## Requirements

- 依赖本地安装的 fec-builder 版本 >= 1.16.1
- 项目内 build config 相关的配置文件名应为 `["/build-config.json", "/build-config.*.json", "/build-config-*.json"]` 之一。

## Extension Settings

```json
{
  "fecBuilderHelper.path": "YOUR FEC-BUILDER PATH" // 优先使用配置的路径
}
```

## Release Notes

### 0.1.0

初始版本
