from __future__ import annotations

from dataclasses import asdict
from dataclasses import dataclass


@dataclass(slots=True)
class DashboardMetric:
    label: str
    value: str
    tone: str


def build_dashboard_view() -> dict:
    return {
        "theme": "system",
        "shell": {
            "title": "AI Config Manager",
            "subtitle": "Profile-first orchestration for Factory, Codex, Cursor",
            "navigation": ["Dashboard", "Profiles", "Bundles", "Resources", "Backups", "Settings"],
        },
        "hero": {
            "activeProfile": "Design",
            "status": "Ready to activate",
            "summary": "Fast profile switching with managed targets, dry-run preview, backup and rollback.",
        },
        "metrics": [
            asdict(DashboardMetric("Managed Targets", "12", "neutral")),
            asdict(DashboardMetric("Bundles", "8", "neutral")),
            asdict(DashboardMetric("Warnings", "1", "warning")),
        ],
        "panels": [
            {
                "title": "Activation Preview",
                "items": [
                    "Verify managed targets",
                    "Copy platform resources",
                    "Register MCP bindings",
                    "Apply commands and env",
                ],
            },
            {
                "title": "Platform Coverage",
                "items": ["Factory", "Codex", "Cursor"],
            },
            {
                "title": "Safety Controls",
                "items": ["Managed targets only", "Dry-run before apply", "Automatic backup", "Rollback support"],
            },
        ],
    }
