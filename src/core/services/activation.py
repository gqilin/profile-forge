from __future__ import annotations

import shutil
from datetime import UTC, datetime
from pathlib import Path

from src.core.models.entities import ActivationRecord, BackupRecord
from src.core.services.workspace_scanner import WorkspaceScanner
from src.core.storage.json_store import JsonStore


class ActivationService:
    def __init__(self, store: JsonStore):
        self.store = store
        self._tool_targets: dict[str, dict[str, str]] = {}

    def configure_tool_targets(self, mapping: dict[str, dict[str, str]]) -> None:
        self._tool_targets = mapping

    def activate_config_set(self, workspace_root: str, tool_name: str, config_set_id: str) -> dict:
        workspace_path = Path(workspace_root)
        snapshot = WorkspaceScanner(workspace_path).scan()
        tool = next(item for item in snapshot["tools"] if item["name"] == tool_name)
        config_set = next(item for item in tool["configSets"] if item["id"] == config_set_id)

        timestamp = datetime.now(UTC).strftime("%Y%m%d%H%M%S")
        backup_root = Path(self.store.root) / "backups" / tool_name / config_set_id / timestamp
        backup_root.mkdir(parents=True, exist_ok=True)

        steps: list[dict] = []
        for resource in config_set["resources"]:
            target_path = Path(self._tool_targets[tool_name][resource])
            source_path = Path(config_set["path"]) / resource
            backup_path = backup_root / resource
            steps.append(
                {
                    "type": "backup_target",
                    "resource": resource,
                    "targetPath": str(target_path),
                    "backupPath": str(backup_path),
                }
            )
            if target_path.exists():
                if target_path.is_dir():
                    shutil.copytree(target_path, backup_path, dirs_exist_ok=True)
                else:
                    backup_path.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(target_path, backup_path)
            if target_path.exists() and target_path.is_dir():
                shutil.rmtree(target_path)
            target_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copytree(source_path, target_path, dirs_exist_ok=True)
            steps.append(
                {
                    "type": "copy_files",
                    "resource": resource,
                    "sourcePath": str(source_path),
                    "targetPath": str(target_path),
                }
            )

        active_state = self.store.read_document("active-state") or {"workspace": workspace_root, "active": {}}
        active_state["workspace"] = workspace_root
        active_state.setdefault("active", {})[tool_name] = config_set_id
        record = ActivationRecord(workspace=workspace_root, active=active_state["active"])
        self.store.write_document("active-state", record.to_dict())

        backups = self.store.read_collection("backups")
        backups.insert(
            0,
            BackupRecord(
                id=f"{tool_name}-{config_set_id}-{timestamp}",
                tool=tool_name,
                config_set=config_set_id,
                status="available",
                backup_path=str(backup_root),
            ).to_dict(),
        )
        self.store.write_collection("backups", backups)

        return {
            "status": "success",
            "plan": {
                "id": f"{tool_name}-{config_set_id}-{timestamp}",
                "steps": steps + [{"type": "write_active_state", "tool": tool_name, "configSet": config_set_id}],
            },
            "activeState": active_state["active"],
        }

