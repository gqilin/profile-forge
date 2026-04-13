from __future__ import annotations

from dataclasses import dataclass

from src.core.storage.json_store import JsonStore


@dataclass(slots=True)
class ValidationIssue:
    level: str
    message: str


class ActivationService:
    def __init__(self, store: JsonStore):
        self.store = store

    def activate_profile(self, profile_id: str) -> dict:
        profile = self._find_by_id("profiles", profile_id)
        bundles = self.store.read_collection("bundles")
        resources = self.store.read_collection("resources")
        targets = self.store.read_collection("managed-targets")

        steps: list[dict] = []
        selected_resources: list[dict] = []

        for platform, bundle_ids in profile["bindings"].items():
            for bundle_id in bundle_ids:
                bundle = next(item for item in bundles if item["id"] == bundle_id and item["platform"] == platform)
                for resource_id in bundle["resourceRefs"]:
                    resource = next(item for item in resources if item["id"] == resource_id)
                    self._ensure_managed_target(resource, targets)
                    selected_resources.append(resource)
                    steps.append(
                        {
                            "type": "verify_target",
                            "platform": resource["platform"],
                            "targetPath": resource["managedPath"],
                        }
                    )
                    steps.append(
                        {
                            "type": "copy_files",
                            "resourceId": resource["id"],
                            "sourcePath": resource["sourcePath"],
                            "targetPath": resource["managedPath"],
                        }
                    )

        if profile["mcpBindings"]:
            steps.append({"type": "register_mcp", "bindings": profile["mcpBindings"]})
        if profile["commandBindings"]:
            steps.append({"type": "apply_commands", "bindings": profile["commandBindings"]})
        if profile["envBindings"]:
            steps.append({"type": "write_env", "bindings": profile["envBindings"]})

        plan = {
            "id": f"{profile_id}-activation",
            "profileId": profile_id,
            "mode": profile["activationPolicy"]["mode"],
            "steps": steps + [{"type": "write_active_state"}],
        }

        self.store.write_document(
            "active-profile",
            {
                "currentProfileId": profile_id,
                "status": "active",
                "planId": plan["id"],
                "resources": [item["id"] for item in selected_resources],
            },
        )
        return {"status": "success", "plan": plan}

    def _find_by_id(self, collection: str, item_id: str) -> dict:
        items = self.store.read_collection(collection)
        return next(item for item in items if item["id"] == item_id)

    def _ensure_managed_target(self, resource: dict, targets: list[dict]) -> None:
        matched = [
            target
            for target in targets
            if target["platform"] == resource["platform"]
            and target["targetType"] == resource["type"]
            and target["path"] == resource["managedPath"]
            and target["managed"]
        ]
        if not matched:
            raise ValueError(f"unmanaged target: {resource['managedPath']}")
