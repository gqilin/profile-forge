import { useEffect, useMemo, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import type { ToolConfig, WorkspaceSnapshot } from './types/workspace'
import './App.css'

const defaultWorkspace = 'H:/其他/abcde'

function LinearIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" className="linear-icon" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

function ThemeModeIcon({ theme }: { theme: 'white' | 'black' }) {
  return (
    theme === 'white' ? (
      <span className="theme-mode-icon theme-mode-icon--sun" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="theme-mode-icon__sun">
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path d="M12 2.5v2.5M12 19v2.5M21.5 12H19M5 12H2.5M18.72 5.28l-1.77 1.77M7.05 16.95l-1.77 1.77M18.72 18.72l-1.77-1.77M7.05 7.05L5.28 5.28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
    ) : (
      <span className="theme-mode-icon theme-mode-icon--moon" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="theme-mode-icon__moon">
          <path d="M15.2 2.8a8.9 8.9 0 1 0 6 15.2 9.7 9.7 0 0 1-12.4-12.4 8.86 8.86 0 0 0 6.4-2.8Z" fill="currentColor" />
        </svg>
      </span>
    )
  )
}

const toolIconPath = 'M4 7h16M7 12h10M10 17h4'
const groupIconPath = 'M5 6.5h14v11H5z'

function EmptyState({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="empty-state">
      <svg viewBox="0 0 1024 1024" className="empty-state__svg" aria-hidden="true">
        <path d="M826.4064 727.2064h-2.4064L704 435.2v-1.6H211.2V435.2L91.2 727.2064h-3.2V972.8h739.2V733.5936l-0.8064-6.4z" fill="currentColor" />
        <path d="M814.4 736v213.6064L704 640V468.8L814.4 736z" fill="currentColor" fillOpacity="0.3" />
        <path d="M223.2064 648.8064h468.7872L803.2 960H109.5936l113.6128-311.2064z" fill="currentColor" fillOpacity="0.16" />
        <path d="M691.2 446.4v189.6064H224V446.3872H691.2z m-480 22.4V640L100.8 943.2064V736.7808L211.2 468.8128z" fill="currentColor" fillOpacity="0.24" />
        <path d="M88 972.8V727.1936h291.2l0.8064 6.4c3.2 42.4064 41.6 74.4064 83.9936 71.2064a77.9008 77.9008 0 0 0 71.2064-71.2064l0.7936-6.4h292.0064V972.8H87.9872z" fill="currentColor" />
        <path d="M100.8 960h713.6V739.9936H547.2v0.8064c-7.2064 49.6-53.6064 83.2-103.2064 76.0064-39.1936-5.6064-69.5936-36.8128-75.9936-76.0064v-0.8064H100.8V960z" fill="currentColor" fillOpacity="0.22" />
        <path d="M766.4 236.8l108.0064 46.4L935.9872 51.2l-169.6 185.6zM936 51.2L643.2 190.4 736 236.8 936 51.2z m-169.6 200.8064v76.8l46.4-46.4-46.4-30.4z m-424 416a7.168 7.168 0 0 1-7.2064-7.2064c0-2.4064 1.6-5.6064 4.0064-6.4 8.8064-4.8 18.4064-9.6 27.2-14.4 3.2-1.6 8-0.8064 9.6 3.2 1.6 3.2 0.8064 8-3.2 9.6-8.8064 4.8-18.4064 9.6-27.2 14.4-1.6 0.8064-2.4064 0.8064-3.2 0.8064z m53.6064-29.6064a7.168 7.168 0 0 1-7.2064-7.2064c0-2.3936 1.6-4.7872 3.2-6.4 8.8064-5.5936 17.6-11.1872 25.6-16a6.1056 6.1056 0 0 1 4.0064-1.5872 7.168 7.168 0 0 1 7.1936 7.1936v1.6c0 1.6-1.6 3.2-3.2 4.8l-26.4064 16.8064c-0.7936 0.7936-1.6 0.7936-3.2 0.7936zM448 603.9936a7.2576 7.2576 0 0 1-5.6064-2.3936 7.2832 7.2832 0 0 1 0.8064-9.6c8-6.4 16-12.8 23.2064-19.2 1.5872-0.8064 3.2-1.6 4.7872-1.6 2.4064 0 4.0064 0.8064 5.6064 2.4064 1.6 1.5872 1.6 3.2 1.6 4.7872 0 1.6128-0.8064 4.0064-2.4064 4.8128-7.9872 7.1936-16 13.5936-23.9872 19.9936-1.6128 0-3.2 0.8064-4.0064 0.8064z m45.6064-41.6c-1.6128 0-3.2-0.7936-4.8128-1.5872a6.5792 6.5792 0 0 1-0.7936-9.6 173.7728 173.7728 0 0 0 19.2-23.2064c2.4064-3.2 7.2064-4.0064 9.6-1.6 3.2 2.4064 4.0064 6.4 1.6 9.6-5.6064 8-12.8 16-20.0064 24-0.7936 1.6-3.2 2.4064-4.7872 2.4064z m35.2-51.2c-0.8064 0-2.4064 0-3.2-0.7936-3.2-1.6-4.8128-5.6064-3.2-9.6l1.5872-3.2h-0.7936c-3.2 0.8064-7.2064 0.8064-11.2 0.8064a7.168 7.168 0 0 1-7.2064-7.2064c0-1.6 0.8064-4.0064 1.6128-4.8 1.5872-1.6 3.2-2.4064 4.7872-2.4064 6.4 0 12.0064-0.7936 18.4064-2.3936 1.6-3.2 2.4064-5.6064 3.2-8.8064 0.8064-3.2 4.0064-4.7872 6.4-4.7872h1.6c4.0064 0.7936 6.4 4.7872 5.6064 8.7936l-0.8064 3.2c0.8064 0 0.8064 0.8064 1.6 0.8064 3.2 2.3936 3.2 7.1936 0 10.3936-0.8064 0.8064-2.4064 1.6-3.2 2.4064l-3.2 0.7936c-2.4064 4.8-4.0064 8.8064-6.4 12.8 0 1.6-2.4064 4.0064-5.6064 4.0064z m-48-15.1936h-1.6128c-10.3936-3.2-20.7872-8-29.5936-14.4-3.2-2.4064-4.0064-6.4-1.6-9.6 1.6-1.6 3.2-3.2 5.6064-3.2 1.5872 0 2.3936 0 3.9936 0.8064 8 5.5936 16.8064 9.6 25.6 11.9936 1.6 0.8064 3.2 1.6 4.0064 3.2 0.7936 1.6 0.7936 3.2 0.7936 5.6064a10.176 10.176 0 0 1-7.2064 5.5936z m91.1872-14.4a7.168 7.168 0 0 1-7.1936-7.2064c0-2.3936 1.6-4.7872 4.0064-6.4 8.7936-4.7872 17.5872-9.6 25.6-16 0.7936-0.7936 2.3936-0.7936 3.9936-0.7936 2.4064 0 4.8 0.8064 5.6064 3.2 2.3936 3.2 1.5872 7.2064-1.6128 9.6-8.7936 6.4-17.5872 12.0064-27.1872 16.8064-0.8064 0-2.4064 0.7936-3.2 0.7936zM428.8 461.5936a7.2576 7.2576 0 0 1-5.6064-2.3936c-7.9872-8-13.5936-18.4064-17.5872-28.8-0.8064-4.0064 0.7936-8 4.8-8.8064h3.9936c2.4064 0.8064 4.8 2.4064 4.8 4.8128 3.2 8.7936 8 16.7936 15.2064 23.9872 2.3936 3.2 2.3936 7.2064-0.8064 10.4064-0.8064 0-3.2 0.8064-4.8 0.8064z m114.4064-9.6c-4.0064 0-6.4-2.3936-7.2064-6.4-0.8064-8.7936-3.2-18.3936-8.8064-25.6-2.3936-3.2-1.5872-7.9872 1.6128-9.6 3.2-2.3936 7.9872-1.5872 9.6 1.6128 6.4 9.6 10.3936 20.7872 11.1872 32.7936 0.8064 4.0064-2.3936 7.2064-6.4 7.2064z m78.3872-5.5936a7.168 7.168 0 0 1-7.1936-7.2064c0-1.5872 0.8064-3.2 2.4064-4.7872 7.1936-6.4 15.1936-13.6064 21.5936-20.8128 1.6-1.5872 3.2-2.3936 4.8-2.3936a7.168 7.168 0 0 1 7.2064 7.2064 8.64 8.64 0 0 1-2.4064 5.5936c-7.2064 7.2064-15.2064 14.4-22.4 21.6064-0.8064 0-2.4064 0.7936-4.0064 0.7936z m-201.6-40h-2.3936a7.2064 7.2064 0 0 1-4.8-4.8c-0.8064-2.4064 0-4.8 2.4064-6.4 8.7936-8 19.9936-12.8 32-14.4H448a7.168 7.168 0 0 1 7.2064 7.2064c0 0.7936 0 1.6-0.8064 2.3936-0.8064 2.4064-3.2 4.0064-5.6064 4.8-8.7936 1.6-17.5872 4.8-23.9872 10.4064-0.8064 0-3.2 0.7936-4.8128 0.7936z m89.6-3.2c-1.5872 0-2.3936 0-3.2-0.8064-8.7936-3.9936-17.5872-7.1936-27.1872-8.7936-2.4064 0-4.8128-2.4064-5.6064-4.8-1.6-4.0064 0-8 4.0064-9.6 0.7936 0 1.5872-0.8064 2.3936-0.8064h0.8064c11.1872 1.6 21.5936 4.8 31.1936 10.4064 3.2 1.6 4.8 5.6064 3.2 9.6-0.8064 1.6-1.6 2.4064-2.4064 3.2-0.7936 0.8064-2.3936 0.8064-3.2 1.6z m155.2128-1.6c-1.6128 0-3.2-0.8064-4.8128-1.6-3.2-2.4064-3.2-6.4-0.7936-9.6l19.2-24a7.2576 7.2576 0 0 1 5.6064-2.4064A7.168 7.168 0 0 1 691.2 371.2c0 1.6 0 3.2-1.6 4.0064-6.4 8-12.8 16.7936-19.2 24-0.8064 1.6-3.2 2.3936-5.6064 2.3936z m37.5936-49.6c-2.4064 0-4.8-1.6-6.4-4.0064a7.7824 7.7824 0 0 1 0.8064-7.1936c5.5936-8 11.1872-16.8064 16-25.6 1.5872-2.4064 3.2-3.2 6.4-3.2 1.5872 0 2.3936 0 3.9936 0.8064 3.2 2.3936 4.8 6.4 2.4064 9.6l-16.8064 26.3936c-1.6 1.6-4.0064 3.2-6.4 3.2z m31.2064-52.8c-0.8064 0-2.4064 0-3.2-0.8064-3.2-1.6-4.8128-6.4-3.2-9.6 3.2-5.5936 6.4-11.2 8.7936-16.7936 1.6-2.4064 3.2-3.2 6.4-3.2a7.168 7.168 0 0 1 7.2064 7.2064c0 0.7936 0 1.6-0.8064 3.2-3.2 5.5936-6.4 11.2-8.8064 16.7936-0.7936 1.6-3.2 3.2-6.4 3.2z" fill="currentColor" />
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
    const theme = snapshot?.settings.theme ?? 'violet'
    document.documentElement.dataset.themeAccent = theme
    document.documentElement.style.colorScheme = theme === 'white' ? 'light' : 'dark'
  }, [snapshot?.settings.theme])

  const tools = useMemo(() => snapshot?.tools ?? [], [snapshot])
  const settings = snapshot?.settings
  const dashboard = snapshot?.dashboard
  const activeState = snapshot?.activeState ?? {}
  const themeOptions = useMemo(() => (settings?.themeOptions ?? ['violet', 'emerald', 'amber', 'rose', 'white', 'black']).filter((option) => option !== 'white' && option !== 'black'), [settings?.themeOptions])
  const isContrastTheme = settings?.theme === 'white' || settings?.theme === 'black'

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
                <button
                  type="button"
                  className={`theme-chip theme-chip--mode ${isContrastTheme ? 'theme-chip--active' : ''}`}
                  onClick={() => mutate('update_theme', { workspace_root: workspacePath, theme: settings?.theme === 'white' ? 'black' : 'white' })}
                >
                  <ThemeModeIcon theme={settings?.theme === 'white' ? 'white' : 'black'} />
                  <span>{settings?.theme === 'white' ? 'white' : 'black'}</span>
                </button>
                {themeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`theme-chip ${settings?.theme === option ? 'theme-chip--active' : ''}`}
                    data-theme-option={option}
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
