from __future__ import annotations

import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

PROJECT_ROOT = Path(__file__).resolve().parents[3]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.core.services.activation import ActivationService
from src.core.services.repository import AppRepository
from src.core.services.workspace_scanner import WorkspaceScanner
from src.core.storage.json_store import JsonStore


def _store_for(workspace_root: Path) -> JsonStore:
    return JsonStore(workspace_root / ".ai-config-manager")


def get_workspace_snapshot(workspace_root: str) -> dict:
    root = Path(workspace_root)
    store = _store_for(root)
    return AppRepository(store).get_workspace_snapshot(root)


def create_tool(workspace_root: str, tool_name: str) -> dict:
    root = Path(workspace_root)
    WorkspaceScanner(root).create_tool_structure(tool_name)
    return get_workspace_snapshot(workspace_root)


def rename_tool(workspace_root: str, old_name: str, new_name: str) -> dict:
    root = Path(workspace_root)
    WorkspaceScanner(root).rename_tool(old_name, new_name)
    return get_workspace_snapshot(workspace_root)


def delete_tool(workspace_root: str, tool_name: str) -> dict:
    root = Path(workspace_root)
    WorkspaceScanner(root).delete_tool(tool_name)
    return get_workspace_snapshot(workspace_root)


def create_config_set_structure(workspace_root: str, tool_name: str, config_set_id: str) -> dict:
    root = Path(workspace_root)
    WorkspaceScanner(root).create_config_set_structure(tool_name, config_set_id)
    return get_workspace_snapshot(workspace_root)


def update_theme(workspace_root: str, theme: str) -> dict:
    root = Path(workspace_root)
    store = _store_for(root)
    settings = store.read_document("settings") or {"workspacePath": str(root), "theme": theme}
    settings["workspacePath"] = str(root)
    settings["theme"] = theme
    store.write_document("settings", settings)
    return get_workspace_snapshot(workspace_root)


def activate_config_set(workspace_root: str, tool_name: str, config_set_id: str) -> dict:
    root = Path(workspace_root)
    store = _store_for(root)
    scanner = WorkspaceScanner(root)
    snapshot = scanner.scan()
    tool = next((item for item in snapshot["tools"] if item["name"] == tool_name), None)
    if tool is None:
        raise ValueError(f"tool not found: {tool_name}")

    service = ActivationService(store)
    target_mapping: dict[str, dict[str, str]] = {}
    for config_tool in snapshot["tools"]:
        resource_targets: dict[str, str] = {}
        for group in config_tool.get("resourceGroups", []):
            resource_targets[group["type"]] = str(root / ".active" / config_tool["name"] / group["type"])
        target_mapping[config_tool["name"]] = resource_targets
    service.configure_tool_targets(target_mapping)
    service.activate_config_set(str(root), tool_name, config_set_id)
    return get_workspace_snapshot(workspace_root)


if __name__ == "__main__":
    action = sys.argv[1]
    payload_text = sys.stdin.read()
    payload = json.loads(payload_text) if payload_text else {}
    result = globals()[action](**payload)
    print(json.dumps(result, ensure_ascii=False), flush=True)
