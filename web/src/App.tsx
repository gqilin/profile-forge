import { useMemo, useState } from 'react'
import { MetricCard } from './components/MetricCard'
import { PanelCard } from './components/PanelCard'
import { workspaceData } from './workspaceData'
import './App.css'

function App() {
  const { dashboard, tools, activeState, backups, workspace } = workspaceData
  const [selectedTool, setSelectedTool] = useState(tools[0]?.name ?? '')
  const currentTool = useMemo(
    () => tools.find((tool) => tool.name === selectedTool) ?? tools[0],
    [selectedTool, tools],
  )
  const [selectedGroup, setSelectedGroup] = useState(currentTool?.resourceGroups[0]?.type ?? '')

  const currentGroup = useMemo(() => {
    if (!currentTool) return undefined
    return currentTool.resourceGroups.find((group) => group.type === selectedGroup) ?? currentTool.resourceGroups[0]
  }, [currentTool, selectedGroup])

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

  return (
    <div className="app-shell app-shell--stacked">
      <main className="content content--wide">
        <section className="hero-card" id="总览">
          <p className="eyebrow">当前工作区</p>
          <div className="hero-card__header">
            <div>
              <h1>{dashboard.shell.title}</h1>
              <h2>{dashboard.hero.activeWorkspace}</h2>
              <p>{dashboard.hero.summary}</p>
            </div>
            <span className="status-pill">{dashboard.hero.status}</span>
          </div>
          <div className="hero-meta">
            <span>工具数量：{workspace.tools.length}</span>
            <span>已激活工具：{Object.keys(activeState).length}</span>
            <span>{dashboard.shell.subtitle}</span>
          </div>
        </section>

        <section className="tool-tabs-card" id="工具">
          <div className="section-heading">
            <p className="eyebrow">开发工具</p>
            <h2>顶部 Tab 切换</h2>
          </div>
          <div className="tool-tabs">
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
                {tool.name}
              </button>
            ))}
          </div>
        </section>

        <section className="metric-grid">
          {dashboard.metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>

        <section className="panel-grid">
          {dashboard.panels.map((panel) => (
            <PanelCard key={panel.title} {...panel} />
          ))}
        </section>

        {currentTool ? (
          <section className="workspace-layout" id="资源组">
            <aside className="group-sidebar">
              <div className="section-heading">
                <p className="eyebrow">资源组</p>
                <h2>{currentTool.name}</h2>
              </div>
              <button type="button" className="primary-action">
                {currentTool.actions?.createStructureLabel ?? '创建配置文件夹结构'}
              </button>
              <div className="group-nav">
                {currentTool.resourceGroups.map((group) => (
                  <button
                    key={group.type}
                    type="button"
                    className={`group-nav__item ${group.type === currentGroup?.type ? 'group-nav__item--active' : ''}`}
                    onClick={() => setSelectedGroup(group.type)}
                  >
                    <span>{group.type}</span>
                    <strong>{group.items.length}</strong>
                  </button>
                ))}
              </div>
            </aside>

            <div className="group-detail">
              <div className="section-heading">
                <p className="eyebrow">当前资源组</p>
                <h2>{currentGroup?.type ?? '暂无资源组'}</h2>
              </div>
              <div className="list-grid">
                {visibleConfigSets.map((item) => (
                  <article className={`data-card interactive-card ${item.isActive ? 'interactive-card--active' : ''}`} key={`${currentGroup?.type}-${item.configSetId}`}>
                    <div className="card-header-row">
                      <h3>{item.configSetId}</h3>
                      {item.isActive ? <span className="active-badge">当前使用</span> : null}
                    </div>
                    <p>{item.description || '当前开发工具下该资源组的配置项。'}</p>
                    <p>目录：{item.path}</p>
                    <p>资源：{item.resources.join('、') || '无'}</p>
                    <button type="button" className="secondary-action">
                      {item.isActive ? '已激活' : currentTool.actions?.activateLabel ?? '切换到当前组'}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="data-section" id="备份">
          <div className="section-heading">
            <p className="eyebrow">激活备份</p>
            <h2>备份记录</h2>
          </div>
          <div className="list-grid">
            {backups.map((backup) => (
              <article className="data-card" key={backup.id}>
                <h3>{backup.tool} / {backup.configSet}</h3>
                <p>ID：{backup.id}</p>
                <p>状态：{backup.status}</p>
                <p>{backup.createdAt}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
