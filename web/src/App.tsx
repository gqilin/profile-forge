import { MetricCard } from './components/MetricCard'
import { PanelCard } from './components/PanelCard'
import { workspaceData } from './workspaceData'
import './App.css'

function App() {
  const { dashboard, pages } = workspaceData

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">本地编排中心</p>
          <h1>{dashboard.shell.title}</h1>
          <p className="sidebar__subtitle">{dashboard.shell.subtitle}</p>
        </div>
        <nav>
          {dashboard.shell.navigation.map((item) => (
            <a href={`#${item.toLowerCase()}`} key={item}>
              {item}
            </a>
          ))}
        </nav>
      </aside>

      <main className="content">
        <section className="hero-card" id="总览">
          <p className="eyebrow">当前配置档案</p>
          <div className="hero-card__header">
            <div>
              <h2>{dashboard.hero.activeProfile}</h2>
              <p>{dashboard.hero.summary}</p>
            </div>
            <span className="status-pill">{dashboard.hero.status}</span>
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

        <section className="data-section" id="配置档案">
          <div className="section-heading">
            <p className="eyebrow">配置档案</p>
            <h2>{pages.profiles.title}</h2>
          </div>
          <div className="list-grid">
            {pages.profiles.items.map((profile) => (
              <article className="data-card" key={profile.id}>
                <h3>{profile.name}</h3>
                <p>{profile.description}</p>
                <p>资源包：{profile.bundles.join('，')}</p>
                <p>模式：{profile.activationMode}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="data-section" id="资源">
          <div className="section-heading">
            <p className="eyebrow">资源</p>
            <h2>{pages.resources.title}</h2>
          </div>
          <div className="list-grid">
            {pages.resources.items.map((resource) => (
              <article className="data-card" key={resource.id}>
                <h3>{resource.name}</h3>
                <p>
                  平台：{resource.platform} / 类型：{resource.type}
                </p>
                <p>受管路径：{resource.managedPath}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="data-section" id="备份">
          <div className="section-heading">
            <p className="eyebrow">备份</p>
            <h2>{pages.backups.title}</h2>
          </div>
          <div className="list-grid">
            {pages.backups.items.map((backup) => (
              <article className="data-card" key={backup.id}>
                <h3>{backup.id}</h3>
                <p>配置档案：{backup.profileId}</p>
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
