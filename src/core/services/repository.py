from __future__ import annotations

from pathlib import Path

from src.core.models.entities import ActivationRecord, BackupRecord
from src.core.services.workspace_scanner import WorkspaceScanner
from src.core.storage.json_store import JsonStore
from src.ui.app import build_dashboard_view
from src.ui.pages.backups import build_backups_page
from src.ui.pages.profiles import build_profiles_page
from src.ui.pages.resources import build_resources_page


def _write_sample_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def bootstrap_sample_data(store: JsonStore, workspace_root: Path | None = None) -> None:
    root = Path(workspace_root) if workspace_root else store.root

    _write_sample_file(root / "ai-configs" / "codex" / "default" / "rules" / "base.md", "codex default rules")
    _write_sample_file(root / "ai-configs" / "cursor" / "frontend" / "commands" / "open.json", '{"command":"cursor open"}')
    _write_sample_file(root / "ai-configs" / "factory" / "design" / "skills" / "figma.md", "factory design skill")
    _write_sample_file(root / "ai-configs" / "factory" / "design" / "mcp" / "figma.json", '{"transport":"http"}')

    active_state = ActivationRecord(workspace=str(root), active={"factory": "design", "codex": "default"})
    store.write_document("active-state", active_state.to_dict())
    store.write_collection(
        "backups",
        [
            BackupRecord(
                id="factory-design-snapshot-001",
                tool="factory",
                config_set="design",
                status="available",
                backup_path=str(root / ".ai-config-backups" / "factory" / "design" / "snapshot-001"),
            ).to_dict()
        ],
    )


class AppRepository:
    def __init__(self, store: JsonStore):
        self.store = store

    def get_workspace_snapshot(self, workspace_root: Path | None = None) -> dict:
        root = Path(workspace_root) if workspace_root else self.store.root
        workspace_payload = WorkspaceScanner(root).scan()
        active_state_doc = self.store.read_document("active-state") or {"workspace": str(root), "active": {}}
        active_state = active_state_doc.get("active", {})
        backups = self.store.read_collection("backups")

        tools = [self._apply_active_flags(tool, active_state) for tool in workspace_payload["tools"]]
        current_tool = tools[0] if tools else {"name": "", "configSets": [], "resourceGroups": [], "actions": {"createStructureLabel": "创建配置文件夹结构"}}
        current_tool["actions"] = {
            "createStructureLabel": "创建配置文件夹结构",
            "activateLabel": "切换到当前组",
        }

        return {
            "workspace": {"rootPath": workspace_payload["rootPath"], "tools": tools},
            "tools": tools,
            "currentTool": current_tool,
            "activeState": active_state,
            "backups": backups,
            "dashboard": build_dashboard_view({"rootPath": workspace_payload["rootPath"], "tools": tools}, active_state, backups),
            "pages": {
                "profiles": build_profiles_page(tools, active_state),
                "resources": build_resources_page(tools),
                "backups": build_backups_page(backups),
            },
        }

    def _apply_active_flags(self, tool: dict, active_state: dict[str, str]) -> dict:
        active_config_set = active_state.get(tool["name"])
        resource_groups = []
        for group in tool.get("resourceGroups", []):
            resource_groups.append(
                {
                    "type": group["type"],
                    "items": [
                        {
                            **item,
                            "isActive": item["configSetId"] == active_config_set,
                        }
                        for item in group["items"]
                    ],
                }
            )
        return {
            **tool,
            "resourceGroups": resource_groups,
        }
