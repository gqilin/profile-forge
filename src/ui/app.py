from __future__ import annotations

from dataclasses import asdict
from dataclasses import dataclass


@dataclass(slots=True)
class DashboardMetric:
    label: str
    value: str
    tone: str


def build_dashboard_view(workspace: dict, active_state: dict[str, str], backups: list[dict]) -> dict:
    tool_count = len(workspace["tools"])
    config_set_count = sum(len(tool["configSets"]) for tool in workspace["tools"])
    active_lines = [f"{tool}: {config_set}" for tool, config_set in active_state.items()] or ["No active config sets"]

    return {
        "theme": "system",
        "shell": {
            "title": "AI Config Workspace Manager",
            "subtitle": "Workspace-first activation for Codex, Cursor, Factory",
            "navigation": ["Dashboard", "Config Sets", "Resources", "Backups"],
        },
        "hero": {
            "activeWorkspace": workspace["rootPath"],
            "status": "Ready to activate",
            "summary": "Scan fixed tool directories, preview available config sets, and activate them with backup-first copy operations.",
        },
        "metrics": [
            asdict(DashboardMetric("Tools", str(tool_count), "neutral")),
            asdict(DashboardMetric("Config Sets", str(config_set_count), "neutral")),
            asdict(DashboardMetric("Backups", str(len(backups)), "neutral")),
        ],
        "panels": [
            {
                "title": "Tool Activation",
                "items": ["Scan workspace", "Backup current targets", "Copy selected config set", "Write active state"],
            },
            {
                "title": "Active State",
                "items": active_lines,
            },
            {
                "title": "Supported Tools",
                "items": [tool["name"] for tool in workspace["tools"]],
            },
        ],
    }
