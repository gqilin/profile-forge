import { useEffect, useMemo, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import type { ToolConfig, WorkspaceSnapshot } from './types/workspace'
import './App.css'

const defaultWorkspace = 'H:/陕西师范/UItest1'

function LinearIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" className="linear-icon" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

const toolIconPath = 'M4 7h16M7 12h10M10 17h4'
const groupIconPath = 'M5 6.5h14v11H5z'

function EmptyState({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="empty-state">
      <svg viewBox="0 0 160 120" className="empty-state__svg" aria-hidden="true">
        <rect x="20" y="24" width="120" height="72" rx="16" />
        <path d="M44 48h72M44 64h46" />
        <circle cx="112" cy="64" r="10" />
      </svg>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction ? (
        <button type="button" className="primary-action" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}

function App() {
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot | null>(null)
  const [workspacePath, setWorkspacePath] = useState(defaultWorkspace)
  const [selectedTool, setSelectedTool] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [newToolName, setNewToolName] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const loadSnapshot = async (root = workspacePath) => {
    const data = await invoke<WorkspaceSnapshot>('get_workspace_snapshot', { payload: { workspace_root: root } })
    setSnapshot(data)
    setWorkspacePath(data.settings.workspacePath)
    setSelectedTool((prev) => prev || data.currentTool?.name || data.tools[0]?.name || '')
    setSelectedGroup((prev) => {
      const tool = data.tools.find((item) => item.name === (data.currentTool?.name || data.tools[0]?.name || ''))
      if (tool?.resourceGroups.some((group) => group.type === prev)) {
        return prev
      }
      return tool?.resourceGroups[0]?.type || ''
    })
  }

  const pickWorkspaceFolder = async () => {
    const folder = await open({ directory: true, multiple: false, defaultPath: workspacePath })
    if (typeof folder === 'string') {
      setWorkspacePath(folder)
      await loadSnapshot(folder)
      setStatusMessage('工作目录已更新')
    }
  }

  useEffect(() => {
    document.documentElement.dataset.themeAccent = snapshot?.settings.theme ?? 'violet'
  }, [snapshot?.settings.theme])

  const tools = useMemo(() => snapshot?.tools ?? [], [snapshot])
  const settings = snapshot?.settings
  const dashboard = snapshot?.dashboard
  const activeState = snapshot?.activeState ?? {}

  const currentTool = useMemo<ToolConfig | undefined>(() => {
    return tools.find((tool) => tool.name === selectedTool) ?? tools[0]
  }, [selectedTool, tools])

  const resolvedGroup = useMemo(() => {
    if (!currentTool) return ''
    if (currentTool.resourceGroups.some((group) => group.type === selectedGroup)) {
      return selectedGroup
    }
    return currentTool.resourceGroups[0]?.type ?? ''
  }, [currentTool, selectedGroup])

  const currentGroup = useMemo(() => {
    if (!currentTool) return undefined
    return currentTool.resourceGroups.find((group) => group.type === resolvedGroup) ?? currentTool.resourceGroups[0]
  }, [currentTool, resolvedGroup])

  const visibleConfigSets = useMemo(() => {
    if (!currentTool || !currentGroup) return []
    return currentGroup.items.map((item) => {
      const configSet = currentTool.configSets.find((entry) => entry.id === item.configSetId)
      return {
        ...item,
        resources: configSet?.resources ?? [],
        description: configSet?.description ?? '',
      }
    })
  }, [currentGroup, currentTool])

  const activeConfigCount = useMemo(() => visibleConfigSets.filter((item) => item.isActive).length, [visibleConfigSets])

  const mutate = async (command: string, payload: Record<string, string>) => {
    const data = await invoke<WorkspaceSnapshot>(command, { payload })
    setSnapshot(data)
    setWorkspacePath(data.settings.workspacePath)
    setStatusMessage('操作成功')
  }

  const showNoDataScreen = !snapshot || !dashboard || !settings

  return (
    <div className="app-shell app-shell--command-center">
      <main className="content content--wide">
        {showNoDataScreen ? (
          <section className="empty-screen">
            <EmptyState
              title="当前没有可用数据"
              description="请先打开设置，选择工作目录，并添加至少一个开发工具。"
              actionLabel="打开设置"
              onAction={() => setIsSettingsOpen(true)}
            />
          </section>
        ) : (
          <>
            <section className="tool-tabs-card command-strip" id="工具">
              <div className="command-strip__header">
                <div className="section-heading">
                  <p className="eyebrow">工具切换</p>
                  <h2>当前工具</h2>
                </div>
                <div className="command-strip__meta">
                  <span>{workspacePath}</span>
                  <span>{dashboard.hero.status}</span>
                </div>
              </div>
              {tools.length ? (
                <div className="tool-tabs tool-tabs--command">
                  {tools.map((tool) => (
                    <button
                      key={tool.name}
                      type="button"
                      className={`tool-tab ${tool.name === currentTool?.name ? 'tool-tab--active' : ''}`}
                      onClick={() => {
                        setSelectedTool(tool.name)
                        setSelectedGroup(tool.resourceGroups[0]?.type ?? '')
                      }}
                    >
                      <LinearIcon path={toolIconPath} />
                      <span>{tool.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState title="暂无开发工具" description="请先在设置中添加一个工具目录。" actionLabel="打开设置" onAction={() => setIsSettingsOpen(true)} />
              )}
            </section>

            {currentTool ? (
              <section className="workspace-layout workspace-layout--command" id="资源组">
                <aside className="group-sidebar">
                  <div className="section-heading">
                    <p className="eyebrow">资源组矩阵</p>
                    <h2>{currentTool.name}</h2>
                    <p className="sidebar-summary">{dashboard.hero.summary}</p>
                  </div>
                  <div className="sidebar-stats" aria-label="当前工具概览">
                    <div>
                      <span>资源组</span>
                      <strong>{currentTool.resourceGroups.length}</strong>
                    </div>
                    <div>
                      <span>配置集</span>
                      <strong>{currentTool.configSets.length}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="primary-action"
                    onClick={() => mutate('create_config_set_structure', { workspace_root: workspacePath, tool_name: currentTool.name, config_set_id: 'default' })}
                  >
                    {currentTool.actions?.createStructureLabel ?? '创建配置文件夹结构'}
                  </button>
                  {currentTool.resourceGroups.length ? (
                    <div className="group-nav">
                      {currentTool.resourceGroups.map((group) => (
                        <button
                          key={group.type}
                          type="button"
                          className={`group-nav__item ${group.type === currentGroup?.type ? 'group-nav__item--active' : ''}`}
                          onClick={() => setSelectedGroup(group.type)}
                        >
                          <span className="group-nav__label">
                            <LinearIcon path={groupIconPath} />
                            {group.type}
                          </span>
                          <strong>{group.items.length}</strong>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="当前工具无资源组" description="先为该工具创建标准配置目录结构。" />
                  )}
                </aside>

                <div className="group-detail">
                  <header className="group-detail__header">
                    <div className="section-heading">
                      <p className="eyebrow">当前状态</p>
                      <h2>{currentGroup?.type ?? '暂无资源组'}</h2>
                    </div>
                    <div className="group-detail__meta">
                      <span>{dashboard.hero.status}</span>
                      <span>工具数量 {tools.length}</span>
                      <span>已激活 {Object.keys(activeState).length}</span>
                      <span>当前组 {visibleConfigSets.length}</span>
                    </div>
                  </header>
                  {statusMessage ? <p className="status-message">{statusMessage}</p> : null}
                  <div className="detail-summary" aria-label="当前资源组概览">
                    <div>
                      <span>活跃配置</span>
                      <strong>{activeConfigCount}</strong>
                    </div>
                    <div>
                      <span>可切换配置</span>
                      <strong>{visibleConfigSets.length}</strong>
                    </div>
                    <div>
                      <span>当前工具</span>
                      <strong>{currentTool.name}</strong>
                    </div>
                  </div>
                  {visibleConfigSets.length ? (
                    <div className="list-grid list-grid--command">
                      {visibleConfigSets.map((item) => (
                        <article className={`data-card interactive-card ${item.isActive ? 'interactive-card--active' : ''}`} key={`${currentGroup?.type}-${item.configSetId}`}>
                          <div className="card-header-row">
                            <div>
                              <p className="eyebrow">Config Set</p>
                              <h3>{item.configSetId}</h3>
                            </div>
                            {item.isActive ? <span className="active-badge">当前使用</span> : null}
                          </div>
                          <p>{item.description || '当前开发工具下该资源组的配置项。'}</p>
                          <p>目录：{item.path}</p>
                          <p>资源：{item.resources.join('、') || '无'}</p>
                          <button
                            type="button"
                            className="secondary-action"
                            onClick={() => mutate('activate_config_set', { workspace_root: workspacePath, tool_name: currentTool.name, config_set_id: item.configSetId })}
                          >
                            {item.isActive ? '已激活' : currentTool.actions?.activateLabel ?? '切换到当前组'}
                          </button>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="当前资源组无数据" description="请先创建配置目录或添加真实文件。" />
                  )}
                </div>
              </section>
            ) : null}
          </>
        )}
      </main>

      <button type="button" className="settings-fab" onClick={() => setIsSettingsOpen(true)}>
        {settings?.floatingButtonLabel ?? '设置'}
      </button>

      {isSettingsOpen ? (
        <div className="settings-modal-backdrop" onClick={() => setIsSettingsOpen(false)}>
          <section className="settings-modal" onClick={(event) => event.stopPropagation()}>
            <div className="card-header-row">
              <div>
                <p className="eyebrow">设置</p>
                <h2>{settings?.title ?? '应用设置'}</h2>
                <p className="settings-intro">集中管理工作目录、主题偏好与工具列表。</p>
              </div>
              <button type="button" className="secondary-action" onClick={() => setIsSettingsOpen(false)}>
                关闭
              </button>
            </div>

            <div className="settings-section">
              <label className="field-label">{settings?.workspaceLabel ?? '工作目录'}</label>
              <div className="folder-picker-row">
                <input value={workspacePath} readOnly />
                <button type="button" className="primary-action" onClick={() => void pickWorkspaceFolder()}>
                  选择文件夹
                </button>
              </div>
              <p className="field-hint">当前目录会作为配置扫描与生成的默认根路径。</p>
            </div>

            <div className="settings-section">
              <label className="field-label">{settings?.themeLabel ?? '主题颜色'}</label>
              <div className="theme-options">
                {(settings?.themeOptions ?? ['violet', 'emerald', 'amber', 'rose']).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`theme-chip ${settings?.theme === option ? 'theme-chip--active' : ''}`}
                    onClick={() => mutate('update_theme', { workspace_root: workspacePath, theme: option })}
                  >
                    <span className="theme-chip__swatch" aria-hidden="true" />
                    {option}
                  </button>
                ))}
              </div>
              <p className="field-hint">主题强调色会同步到状态提示、激活态与主要操作。</p>
            </div>

            <div className="settings-section">
              <div className="section-heading">
                <h3>{settings?.toolManagerTitle ?? '管理开发工具'}</h3>
                <p>{settings?.toolManagerDescription ?? '添加、删除、编辑顶部开发工具 tab。'}</p>
              </div>
              <div className="tool-manager-list">
                {tools.map((tool) => (
                  <div key={tool.name} className="tool-manager-item">
                    <input defaultValue={tool.name} onBlur={(event) => void mutate('rename_tool', { workspace_root: workspacePath, old_name: tool.name, new_name: event.target.value })} />
                    <button type="button" className="secondary-action" onClick={() => mutate('delete_tool', { workspace_root: workspacePath, tool_name: tool.name })}>
                      删除
                    </button>
                  </div>
                ))}
              </div>
              <div className="tool-manager-create">
                <input value={newToolName} placeholder="新增工具名" onChange={(event) => setNewToolName(event.target.value)} />
                <button
                  type="button"
                  className="primary-action"
                  onClick={() => {
                    void mutate('create_tool', { workspace_root: workspacePath, tool_name: newToolName })
                    setNewToolName('')
                  }}
                >
                  添加
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default App
