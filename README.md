# 🎵 舞萌DX B50查询工具

一个基于Vue 3的舞萌DX B50成绩查询和可视化工具，支持多版本数据查询和丰富的数据展示功能。

## ✨ 功能特性

- 🔍 **多种查询方式**：支持QQ号、用户名查询B50数据
- 🧪 **测试版功能**：查询用户全部分数记录（需要开发者token）
- 📊 **可视化展示**：美观的B50成绩图表展示
- 📱 **响应式设计**：完美适配桌面端和移动端
- 🎨 **多主题支持**：支持难度颜色区分和评级展示
- 📈 **数据统计**：详细的分数统计和筛选功能
- 💾 **数据导出**：支持JSON格式数据导出
- 🖼️ **图片生成**：支持将B50数据生成图片保存

## 🚀 快速开始

### 环境配置

1. 克隆项目：
```bash
git clone <your-repo-url>
cd vue-b50-web
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，配置你的开发者token（仅测试功能需要）
# VITE_DEV_API_KEY=your_developer_token_here
```

4. 启动开发服务器：
```bash
npm run dev
```

### 环境变量说明

创建 `.env` 文件并配置以下变量：

- `VITE_DEV_API_KEY`: diving-fish开发者API token（仅测试版"查询全部分数"功能需要）
- `VITE_API_BASE_URL`: API基础URL（可选，默认为diving-fish官方API）

**重要提醒**：
- `.env` 文件已被添加到 `.gitignore`，不会被提交到版本控制
- 测试版功能需要有效的开发者token，请从diving-fish官方获取
- 请勿在代码中硬编码敏感信息

## 📖 使用指南

### 基本查询

1. 在查询页面选择查询类型（QQ号或用户名）
2. 输入对应的查询信息
3. 点击"查询B50"按钮
4. 等待查询结果加载

### 测试版功能（查询全部分数）

1. 选择"查询全部分数（测试）"选项卡
2. 输入QQ号（必填）或用户名（可选）
3. 点击查询按钮获取完整分数记录
4. 支持搜索、筛选、排序和分页功能
5. 可导出全部数据或筛选后的数据

### 功能说明

- **旧谱面(SD)**：显示传统谱面的最佳25首成绩
- **新谱面(DX)**：显示DX谱面的最佳25首成绩
- **难度标识**：不同颜色表示不同难度等级
- **星级系统**：根据DX分数占比显示1-3星评价
- **导出功能**：支持图片和JSON格式导出

## 🛠️ 技术栈

- **前端框架**：Vue 3 + Composition API
- **UI组件库**：Element Plus
- **构建工具**：Vite
- **HTTP客户端**：Axios
- **图片生成**：html2canvas

## 🔒 安全特性

- ✅ 环境变量管理敏感配置
- ✅ Token运行时混淆机制
- ✅ 私有类字段保护
- ✅ 详细的错误处理和用户提示

## 📦 构建部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -am 'Add new feature'`
4. 推送到分支：`git push origin feature/new-feature`
5. 提交Pull Request

## 📄 许可证

MIT License

## 💡 注意事项

- 数据来源：[diving-fish舞萌DX查分器](https://www.diving-fish.com/maimaidx/prober/)
- 测试版功能需要用户在diving-fish官网同意用户协议且开放数据访问权限
- 请合理使用API，避免频繁请求

## 🙏 致谢

感谢 [diving-fish](https://www.diving-fish.com/) 提供的数据API支持。

---

© 2025 舞萌DX B50计算工具 | 作者：宇航员Dale
