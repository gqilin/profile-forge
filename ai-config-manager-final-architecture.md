# AI 开发工具统一配置管理器最终架构方案

## 1. 文档目的

本文档是 `ai-config-manager-architecture.md` 的确认增强版，用作后续产品设计、开发拆分与实现落地的统一参考。

该方案已确认以下核心方向：

- MVP 目标：本地稳定优先
- 默认生效策略：Copy
- 受管范围：仅管理用户显式登记的目录
- Profile 激活范围：包含文件配置、MCP、命令集、环境变量

---

## 2. 产品最终定义

本产品不是单一平台的配置面板，而是一个：

**跨 Factory / Codex / Cursor 的本地配置管理与 Profile 编排中心**

核心能力包括：

1. 统一发现、导入与管理不同 AI 开发工具的本地配置资源
2. 将资源组织为可复用的 Bundle
3. 使用 Profile 编排完整工作环境
4. 一键激活当前工作流上下文
5. 通过备份、预检和回滚保证切换安全
6. 提供图形化界面降低维护与切换成本

---

## 3. 产品边界与定位

### 3.1 产品定位

该工具是本地 AI 开发环境的编排器，不是：

- 单一 skill 管理器
- 单一 prompt 管理器
- 单一 MCP 面板
- 某个平台的配置编辑器

它的职责是统一抽象和切换多平台配置工作流。

### 3.2 MVP 边界

MVP 聚焦于：

- 本地单机使用
- 多平台配置编排
- 安全切换
- 可回滚

MVP 不包含：

- 云同步
- 多用户协作
- 在线配置市场
- 复杂权限系统
- 自动接管用户所有默认目录
- 直接修改系统级环境变量注册表

---

## 4. 目标用户与典型场景

### 4.1 目标用户

- 同时使用 Factory / Codex / Cursor 的 AI 开发用户
- 需要在多种工作模式中快速切换的人群
- 管理大量 skills / rules / commands / MCP 配置的高级用户

### 4.2 核心场景

#### 场景 A：设计工作流

用户一键启用：

- Factory 的设计类 skills
- Cursor 的 UI rules
- Codex 的前端 prompts
- Figma 相关 MCP

形成完整设计环境。

#### 场景 B：自动化工作流

用户一键启用：

- Factory 的自动化技能集
- 浏览器自动化 MCP
- 自动化测试命令集
- Cursor / Codex 的自动化规则

形成自动化开发环境。

#### 场景 C：实验与回滚

用户可在新 Profile 下测试新资源，不影响稳定环境，并在失败时快速恢复。

---

## 5. 核心设计原则

### 5.1 以 Profile 为中心

切换的不是单一资源，而是一整套工作上下文。

### 5.2 资源与激活状态分离

资源独立保存，生效结果通过 Adapter 投射到目标平台。

### 5.3 显式受管

系统只操作用户显式登记的目标目录，不自动接管未知路径。

### 5.4 适配器解耦

不同平台的路径、格式和生效方式不同，统一通过 Adapter 层抽象。

### 5.5 安全优先

所有切换必须可预检、可备份、可回滚、可审计。

### 5.6 渐进扩展

先满足稳定 MVP，再扩展 Link、插件化、远程同步等能力。

---

## 6. 最终架构总览

采用五层架构：

```text
Desktop UI Layer
Application Service Layer
Domain Layer
Adapter Layer
Local Storage Layer
```

### 6.1 Desktop UI Layer

负责用户交互、状态展示、激活操作和历史查看。

包含：

- Dashboard
- Profiles
- Bundles
- Resources
- Platforms
- Activation Preview
- Backups / History
- Settings

### 6.2 Application Service Layer

负责流程协调，不直接处理平台细节。

核心服务：

- ProfileService
- BundleService
- ResourceRegistryService
- ActivationService
- ValidationService
- BackupService
- EnvironmentService
- McpService
- CommandService

### 6.3 Domain Layer

负责核心实体和业务规则。

核心对象：

- Resource
- Bundle
- Profile
- ManagedTarget
- ActivationPlan
- ActivationStep
- BackupSnapshot
- ValidationIssue

### 6.4 Adapter Layer

屏蔽平台差异，负责把抽象配置落地到具体工具。

适配器：

- FactoryAdapter
- CodexAdapter
- CursorAdapter
- FutureAdapter

### 6.5 Local Storage Layer

负责本地元数据、索引、快照和日志持久化。

MVP 采用：

- JSON 文件
- 本地目录结构
- 快照目录
- 日志文件

---

## 7. 核心领域模型

## 7.1 Resource

Resource 是最小配置管理单元。

示例：

- 一个 skills 目录
- 一组 rules 文件
- 一组 commands
- 一套 MCP 配置
- 一组 prompts / presets
- 一组环境变量定义

建议字段：

```json
{
  "id": "string",
  "name": "string",
  "platform": "factory | codex | cursor",
  "type": "skills | rules | commands | mcp | prompts | presets | env",
  "sourcePath": "string",
  "managedPath": "string",
  "version": "string",
  "hash": "string",
  "metadata": {},
  "createdAt": "string",
  "updatedAt": "string"
}
```

## 7.2 Bundle

Bundle 是同平台、同用途的一组 Resource 的逻辑集合，用于复用。

建议字段：

```json
{
  "id": "string",
  "name": "string",
  "platform": "factory | codex | cursor",
  "resourceRefs": ["resource-id"],
  "tags": ["design", "automation"],
  "description": "string",
  "version": "string"
}
```

## 7.3 Profile

Profile 是最终工作环境定义，也是唯一激活入口。

建议字段：

```json
{
  "id": "design",
  "name": "Design",
  "description": "UI design workflow",
  "bindings": {},
  "envBindings": {},
  "commandBindings": {},
  "mcpBindings": {},
  "activationPolicy": {
    "mode": "copy"
  },
  "createdAt": "string",
  "updatedAt": "string"
}
```

## 7.4 ManagedTarget

ManagedTarget 是本架构新增的核心安全模型。

系统仅允许向 ManagedTarget 白名单路径写入。

建议字段：

```json
{
  "id": "string",
  "platform": "factory | codex | cursor",
  "targetType": "skills | rules | commands | mcp | prompts | presets | env",
  "path": "string",
  "scope": "global | workspace",
  "managed": true,
  "lastVerifiedAt": "string"
}
```

## 7.5 ActivationPlan

ActivationPlan 是一次 Profile 激活的标准执行计划，统一管理所有变更动作。

建议字段：

```json
{
  "id": "string",
  "profileId": "string",
  "mode": "copy",
  "steps": [],
  "backupSnapshotId": "string",
  "dryRunSummary": {},
  "createdAt": "string"
}
```

## 7.6 ActivationStep

每个步骤表示一个具体执行动作。

推荐类型：

- `verify_target`
- `copy_files`
- `write_config`
- `register_mcp`
- `apply_commands`
- `write_env`
- `rollback_step`

---

## 8. 关键服务设计

## 8.1 ProfileService

职责：

- 创建、更新、删除 Profile
- 校验 Profile 配置完整性
- 解析 Profile 引用的 Bundle 和副作用配置
- 构建 ActivationPlan

关键方法：

- `createProfile()`
- `updateProfile()`
- `deleteProfile()`
- `getProfileById()`
- `resolveProfileResources()`
- `buildActivationPlan()`

## 8.2 BundleService

职责：

- 创建和维护 Bundle
- 检查 Bundle 是否包含无效资源
- 追踪 Bundle 被哪些 Profile 引用

关键方法：

- `createBundle()`
- `updateBundle()`
- `deleteBundle()`
- `validateBundle()`
- `getBundleDependencies()`

## 8.3 ResourceRegistryService

职责：

- 扫描资源目录
- 解析资源类型与平台
- 建立资源索引
- 标记损坏、缺失和冲突

关键方法：

- `scanResources()`
- `registerResource()`
- `removeResource()`
- `detectConflicts()`
- `refreshIndex()`

## 8.4 ActivationService

职责：

- 接收激活请求
- 调用 ValidationService 预检
- 创建备份
- 执行 ActivationPlan
- 记录执行结果
- 出错回滚

关键方法：

- `activateProfile()`
- `runDryPreview()`
- `executePlan()`
- `rollbackPlan()`

## 8.5 ValidationService

职责：

- 检查 Profile 完整性
- 检查 Bundle 合法性
- 检查目标路径是否属于 ManagedTarget
- 检查命名冲突、依赖缺失、MCP 冲突

输出级别：

- `error`
- `warning`
- `info`

## 8.6 BackupService

职责：

- 在切换前创建快照
- 在失败时恢复
- 支持用户按历史版本手动回滚

关键方法：

- `createSnapshot()`
- `restoreSnapshot()`
- `listSnapshots()`
- `deleteExpiredSnapshots()`

## 8.7 EnvironmentService

职责：

- 管理 Profile 级环境变量绑定
- 将环境变量写入受控配置文件
- 禁止直接写系统级全局环境变量

## 8.8 McpService

职责：

- 统一管理 MCP 配置集
- 支持配置文件写入或 CLI 注册
- 提供可回滚执行结果

## 8.9 CommandService

职责：

- 管理命令集模板
- 写入受控命令配置文件
- 参与 Profile 激活计划

---

## 9. 平台适配器设计

## 9.1 FactoryAdapter

受管对象包括：

- skills
- rules
- commands
- droids
- mcp

职责：

- 定位 `.factory` 根目录
- 对受管目标执行文件复制或配置写入
- 返回结构化执行报告

目标路径示例：

- `C:\Users\Administrator\.factory\skills`
- `C:\Users\Administrator\.factory\rules`
- `C:\Users\Administrator\.factory\commands`

## 9.2 CodexAdapter

职责：

- 定位 Codex 配置目录
- 管理 prompts / rules / presets / env
- 支持用户自定义全局路径和工作区路径

由于 Codex 可能存在多种安装与运行方式，适配器需支持能力声明和路径验证。

## 9.3 CursorAdapter

职责：

- 定位 Cursor 配置目录
- 管理 `.cursor` 相关 rules、instructions、workspace presets
- 区分全局配置与工作区配置
- 明确覆盖优先级

---

## 10. 本地存储结构设计

建议使用独立工作目录：

```text
%USERPROFILE%\.ai-config-manager\
  app-config.json
  active-profile.json
  managed-targets.json
  profiles\
  bundles\
  resources\
  backups\
  logs\
  cache\
```

### 10.1 app-config.json

保存应用级设置，例如：

- 工作目录路径
- 默认切换模式
- 日志级别
- 备份保留策略

### 10.2 active-profile.json

保存当前激活状态：

- 当前 Profile
- 激活时间
- 执行结果摘要
- 关联快照 ID

### 10.3 managed-targets.json

记录所有被允许写入的目标路径，是系统安全边界核心。

### 10.4 profiles

每个 Profile 一个 JSON 文件。

### 10.5 bundles

每个 Bundle 一个 JSON 文件。

### 10.6 resources

记录资源索引、来源、版本、路径和 hash。

### 10.7 backups

按快照 ID 保存历史配置副本。

### 10.8 logs

保存结构化执行日志，便于审计和排障。

---

## 11. 切换策略最终确定

## 11.1 默认策略：Copy

MVP 默认只采用 Copy 模式。

优点：

- 稳定性最高
- 用户最容易理解
- 权限兼容性最好
- 适合 Windows 本地桌面工具

缺点：

- 切换速度略慢
- 会占用更多存储空间

### 11.2 Link 模式

保留在后续扩展中，不进入 MVP 主路径。

### 11.3 Hybrid 模式

保留为未来演进策略，不纳入首期实现。

---

## 12. 关键流程设计

## 12.1 导入资源流程

```text
用户选择本地目录或 Git 仓库
→ 系统扫描结构
→ 识别平台与资源类型
→ 生成 Resource 元数据
→ 写入资源索引
→ 校验合法性
→ 可选创建 Bundle
```

## 12.2 激活 Profile 流程

```text
用户选择 Profile
→ 系统解析 Bundle、MCP、命令集、环境变量
→ 校验 ManagedTarget 白名单
→ 生成 ActivationPlan
→ dry-run 预览
→ 创建 BackupSnapshot
→ 按顺序执行 ActivationStep
→ 更新 active-profile.json
→ 写入日志
→ 若失败则自动回滚
```

推荐执行顺序：

1. 校验
2. 创建备份
3. 应用文件类配置
4. 应用 MCP
5. 应用命令集
6. 应用环境变量
7. 更新激活状态
8. 收尾验证

## 12.3 回滚流程

```text
用户选择历史快照
→ 校验快照完整性
→ 恢复各平台受管目录
→ 恢复 active-profile.json
→ 写入结果日志
```

---

## 13. UI 信息架构

## 13.1 Dashboard

显示：

- 当前激活 Profile
- 最近切换记录
- 平台状态
- 错误与警告
- 回滚入口

## 13.2 Profiles

支持：

- 创建、编辑、删除
- 绑定 Bundle
- 绑定 MCP / Commands / Env
- 查看激活预览
- 一键激活

## 13.3 Bundles

支持：

- 创建与编辑 Bundle
- 查看资源组成
- 检测冲突
- 查看被引用关系

## 13.4 Resources

支持：

- 浏览资源
- 导入资源
- 查看来源路径和版本
- 查看冲突、损坏和缺失状态

## 13.5 Platforms

按平台展示：

- 受管目录
- 当前映射结果
- 路径验证状态

## 13.6 Backups

支持：

- 浏览快照
- 查看快照详情
- 手动回滚

## 13.7 Settings

支持：

- 工作目录设置
- 备份策略
- 默认激活策略
- 日志级别

---

## 14. 错误处理与安全设计

## 14.1 必须处理的异常

- 目标目录不存在
- 路径未登记为受管目标
- 目录被占用
- 权限不足
- 资源损坏
- 命名冲突
- 依赖缺失
- MCP 注册失败
- 命令集写入失败
- 环境变量目标不可写

## 14.2 安全约束

系统必须满足：

1. 所有写操作仅允许作用于 ManagedTarget 白名单路径
2. 所有切换前必须自动备份
3. 所有激活前必须支持 dry-run
4. 所有 Adapter 必须返回结构化结果
5. 禁止删除未知目录
6. 禁止覆盖未登记目录
7. 失败后必须自动回滚
8. 激活成功后必须进行二次验证

---

## 15. 技术选型建议

## 15.1 桌面框架

推荐：**Tauri**

原因：

- 更适合构建轻量级本地桌面工具，安装包体积和运行资源占用更低
- 安全边界更清晰，适合处理本地配置目录、命令调用与受管路径控制
- 前端仍可采用 React + TypeScript，保持良好的界面开发效率
- Rust 后端更适合承载文件复制、备份回滚、路径校验和本地命令编排等核心能力

实施建议：

- 前端继续使用 React + TypeScript
- Tauri 负责窗口壳、系统能力桥接与权限控制
- 核心本地编排能力优先放在 Rust Service 层实现
- 前端仅负责状态展示、交互编排和结果呈现

## 15.2 前端技术

推荐：

- React
- TypeScript
- Zustand
- Mantine 或 Ant Design

## 15.3 本地数据存储

MVP：

- JSON 文件

后续可升级：

- SQLite

## 15.4 日志方案

建议采用结构化日志：

- JSON / JSONL
- 支持按时间与激活任务过滤

---

## 16. MVP 范围最终锁定

### 16.1 支持平台

- Factory
- Codex
- Cursor

### 16.2 支持资源

- skills
- rules
- commands
- mcp
- prompts
- presets
- env bindings

### 16.3 支持能力

- 受管目标登记
- 资源扫描与导入
- Bundle 管理
- Profile 管理
- dry-run 激活预览
- 一键激活
- 自动备份
- 自动回滚
- 激活历史查看

### 16.4 明确不做

- 云同步
- 团队协作
- 远程配置市场
- 插件市场
- 自动扫描自动接管
- 系统级环境变量直接写注册表

---

## 17. 推荐目录示例

```text
C:\Users\Administrator\.ai-config-manager\
  app-config.json
  active-profile.json
  managed-targets.json
  profiles\
    design.json
    automation.json
  bundles\
    factory-design.json
    cursor-ui-rules.json
  resources\
    factory\
      skills\
      rules\
      commands\
      mcp\
    codex\
      prompts\
      rules\
      presets\
    cursor\
      rules\
      presets\
  backups\
  logs\
```

---

## 18. 最终结论

该系统最终应围绕以下核心抽象构建：

**Profile + Bundle + ManagedTarget + Adapter + ActivationPlan**

其中：

- `Resource` 负责描述原始配置资源
- `Bundle` 负责资源组织与复用
- `Profile` 负责完整工作流编排
- `ManagedTarget` 负责定义安全边界
- `Adapter` 负责平台落地
- `ActivationPlan` 负责执行、审计与回滚

这套架构同时满足：

- 多平台统一管理
- 多资源类型统一编排
- 安全激活
- 可备份回滚
- 后续扩展能力

它是当前阶段最适合“本地稳定优先”目标的完整方案。
