# 🎵 舞萌DX B50查询工具

一个基于 Vue 3 的舞萌DX B50成绩查询和可视化工具，支持通过QQ号或用户名查询玩家的最佳50首歌曲成绩，并生成精美的可视化图表。

## ✨ 功能特性

- 🔍 **多种查询方式**：支持QQ号和用户名两种查询模式
- 📊 **可视化展示**：清晰展示B50成绩，包括旧谱面(SD)和新谱面(DX)
- 🎯 **详细信息**：显示歌曲封面、达成率、定数(DS)、Rating值、FC/FS状态等
- ⭐ **DX星级系统**：根据DX分数显示星级评价（1-3星）
- 📱 **响应式设计**：完美适配桌面端和移动端
- 🖼️ **图片导出**：支持将B50成绩导出为高质量图片
- 📋 **数据导出**：支持将成绩数据导出为JSON格式
- 🎨 **打印优化**：专门优化的打印样式

## 🛠️ 技术栈

- **前端框架**：Vue 3 (Composition API)
- **构建工具**：Vite
- **UI组件库**：Element Plus
- **HTTP客户端**：Axios
- **图片处理**：html2canvas
- **样式**：CSS3 + Flexbox
- **部署**：Vercel

## 📁 项目结构

```
vue-b50-web/
├── public/                 # 静态资源
│   ├── covers/            # 歌曲封面图片
│   ├── json/              # 歌曲数据文件
│   └── mai/               # maimai相关资源
├── src/
│   ├── api/               # API接口
│   │   └── b50Api.js      # B50查询API
│   ├── assets/            # 项目资源文件
│   ├── components/        # Vue组件
│   │   ├── B50Query.vue   # 查询表单组件
│   │   ├── B50Result.vue  # 结果展示组件
│   │   └── icons/         # 图标组件
│   │       └── StarIcon.vue # 星级图标
│   ├── types/             # TypeScript类型定义
│   ├── utils/             # 工具函数
│   │   └── musicDataService.js # 音乐数据服务
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── index.html             # HTML模板
├── package.json           # 项目配置
├── vite.config.js         # Vite配置
└── vercel.json            # Vercel部署配置
```

## 🚀 快速开始

### 环境要求

- Node.js 16+ 
- npm 或 yarn

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/your-username/vue-b50-web.git
cd vue-b50-web
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **构建生产版本**
```bash
npm run build
```

## 📖 使用指南

### 基本查询

1. 在查询页面选择查询类型（QQ号或用户名）
2. 输入对应的查询信息
3. 点击"查询B50"按钮
4. 等待查询结果加载

### 功能说明

- **旧谱面(SD)**：显示传统谱面的最佳25首成绩
- **新谱面(DX)**：显示DX谱面的最佳25首成绩
- **难度标识**：不同颜色表示不同难度等级
- **星级系统**：根据DX分数占比显示1-3星评价
- **导出功能**：支持图片和JSON格式导出

### DX星级说明

- ⭐ **1星**：DX分数达成率 85-90%
- ⭐⭐ **2星**：DX分数达成率 90-93% 
- ⭐⭐⭐ **3星**：DX分数达成率 93%以上

## 🎨 界面预览

- 简洁的查询界面
- 卡片式成绩展示
- 响应式布局设计
- 打印友好的样式

## 🔧 配置说明

### API配置

项目使用代理方式访问后端API，配置在 `vite.config.js` 中：

```javascript
server: {
  proxy: {
    '/api': {
      target: 'https://your-api-domain.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

### 部署配置

项目支持Vercel一键部署，配置文件：`vercel.json`

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 开源协议

本项目采用 MIT 协议 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Element Plus](https://element-plus.org/) - Vue 3组件库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- maimai DX 游戏及其社区

## 📞 联系方式

如有问题或建议，欢迎提交 Issue 或 Pull Request。

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
