# Galaxy UniApp组件数据库

这个文件夹包含了从Galaxy组件库解析并转换为UniApp格式的组件数据，总共包含 **2011个组件**：
- 🔘 **1231个按钮组件** (buttons)
- 💬 **62个提示框组件** (tooltips)
- ⏳ **718个加载器组件** (loaders)

## 📁 文件结构

```
data/
├── README.md                 # 说明文档
├── components/              # 组件数据目录 (2011个组件)
│   ├── buttons/            # 按钮组件 (1231个)
│   ├── tooltips/           # 提示框组件 (62个)
│   └── loaders/            # 加载器组件 (718个)
├── metadata/               # 元数据
│   ├── component-index.json # 组件索引 (总览)
│   ├── authors.json        # 作者信息 (662位作者)
│   └── tags.json          # 标签分类
└── templates/              # 模板文件
    ├── uniapp-component.json # UniApp组件模板
    └── conversion-rules.json # 转换规则
```

## 🚀 MCP服务器

本项目提供了完整的MCP (Model Context Protocol) 服务器，支持：

### 核心功能
- 🔍 **智能搜索**: 按关键词、分类、作者、标签搜索组件
- 🔄 **自动转换**: 将HTML/CSS组件转换为UniApp格式
- 📱 **平台兼容**: 支持H5、微信小程序、支付宝小程序、App等平台
- ⚡ **性能优化**: 自动优化小程序性能和包体积
- 📦 **项目集成**: 生成完整的项目集成代码

### 使用方法
```bash
# 启动MCP服务器
node mcp-server.js

# 运行测试
node test-mcp.js
```

## 组件数据格式

每个组件以JSON格式存储，包含以下字段：

```json
{
  "id": "组件唯一标识",
  "name": "组件名称",
  "category": "组件分类",
  "author": "作者",
  "description": "组件描述",
  "tags": ["标签1", "标签2"],
  "original": {
    "html": "原始HTML代码",
    "css": "原始CSS代码"
  },
  "uniapp": {
    "template": "UniApp模板代码",
    "script": "Vue脚本代码",
    "style": "UniApp样式代码"
  },
  "platforms": {
    "h5": true,
    "mp-weixin": true,
    "mp-alipay": true,
    "app-plus": true
  },
  "props": [],
  "events": [],
  "slots": [],
  "compatibility": {},
  "performance": {},
  "created_at": "创建时间",
  "updated_at": "更新时间"
}
```

## 🛠️ MCP工具列表

### 1. `list_available_components` 🆕
列出和统计所有可用组件
```javascript
{
  "category": "buttons",           // 可选：按分类过滤
  "author": "cssbuttons-io",       // 可选：按作者过滤
  "sort_by": "complexity",         // 排序字段：name/author/category/created_at/complexity
  "sort_order": "asc",            // 排序顺序：asc/desc
  "include_stats": true,          // 是否包含统计信息
  "limit": 50                     // 返回数量
}
```

### 2. `get_component_details` 🆕
获取组件详细信息
```javascript
{
  "component_id": "cssbuttons-io_brown-otter-21",
  "include_code": true,           // 是否包含源代码
  "include_usage": true           // 是否包含使用示例
}
```

### 3. `analyze_uniapp_compatibility`
分析组件在各平台的兼容性
```javascript
{
  "component_id": "cssbuttons-io_brown-otter-21",
  "target_platforms": ["H5", "MP-WEIXIN", "APP-PLUS"],
  "check_performance": true
}
```

### 4. `convert_to_uniapp_component`
转换组件为UniApp格式
```javascript
{
  "component_id": "cssbuttons-io_brown-otter-21",
  "target_platforms": ["H5", "MP-WEIXIN"],
  "enable_conditions": true,
  "component_name": "GalaxyFancyButton"
}
```

### 5. `search_uniapp_components`
搜索组件
```javascript
{
  "query": "button",
  "category": "buttons",
  "tags": ["animation"],
  "platforms": ["H5", "MP-WEIXIN"],
  "complexity": "low",
  "limit": 10
}
```

### 6. `generate_uniapp_project_integration`
生成项目集成代码
```javascript
{
  "components": ["cssbuttons-io_brown-otter-21", "cssbuttons-io_calm-tiger-42"],
  "auto_import": true,
  "global_styles": true
}
```

## 📊 统计信息

- **总组件数**: 2,011个
- **作者数量**: 662位
- **组件分类**: 3大类 (buttons, tooltips, loaders)
- **平台支持**: H5、微信小程序、支付宝小程序、App
- **转换成功率**: 100%

## 🎯 使用场景

1. **快速原型开发**: 从3000+组件中快速选择合适的UI元素
2. **跨平台适配**: 一键转换为UniApp兼容格式
3. **性能优化**: 自动优化小程序性能
4. **团队协作**: 统一的组件库和规范

## 📝 使用说明

1. 运行 `npm install` 安装依赖
2. 运行 `node parse-components.js` 解析组件数据
3. 启动 `node mcp-server.js` MCP服务器
4. 通过MCP工具查询和转换组件
5. 集成到UniApp项目中
