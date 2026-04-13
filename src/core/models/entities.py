from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, UTC


def utc_now() -> str:
    return datetime.now(UTC).isoformat()


@dataclass(slots=True)
class Resource:
    id: str
    name: str
    platform: str
    type: str
    source_path: str
    managed_path: str
    version: str = "1.0.0"
    hash: str = ""
    metadata: dict = field(default_factory=dict)
    created_at: str = field(default_factory=utc_now)
    updated_at: str = field(default_factory=utc_now)

    def to_dict(self) -> dict:
        payload = asdict(self)
        payload["sourcePath"] = payload.pop("source_path")
        payload["managedPath"] = payload.pop("managed_path")
        payload["createdAt"] = payload.pop("created_at")
        payload["updatedAt"] = payload.pop("updated_at")
        return payload


@dataclass(slots=True)
class Bundle:
    id: str
    name: str
    platform: str
    resource_refs: list[str]
    tags: list[str]
    description: str
    version: str = "1.0.0"

    def to_dict(self) -> dict:
        payload = asdict(self)
        payload["resourceRefs"] = payload.pop("resource_refs")
        return payload


@dataclass(slots=True)
class Profile:
    id: str
    name: str
    description: str
    bindings: dict[str, list[str]]
    env_bindings: dict[str, str]
    command_bindings: dict[str, str]
    mcp_bindings: dict[str, dict]
    activation_policy: dict = field(default_factory=lambda: {"mode": "copy"})
    created_at: str = field(default_factory=utc_now)
    updated_at: str = field(default_factory=utc_now)

    def to_dict(self) -> dict:
        payload = asdict(self)
        payload["envBindings"] = payload.pop("env_bindings")
        payload["commandBindings"] = payload.pop("command_bindings")
        payload["mcpBindings"] = payload.pop("mcp_bindings")
        payload["activationPolicy"] = payload.pop("activation_policy")
        payload["createdAt"] = payload.pop("created_at")
        payload["updatedAt"] = payload.pop("updated_at")
        return payload


@dataclass(slots=True)
class ManagedTarget:
    id: str
    platform: str
    target_type: str
    path: str
    scope: str
    managed: bool = True
    last_verified_at: str = field(default_factory=utc_now)

    def to_dict(self) -> dict:
        payload = asdict(self)
        payload["targetType"] = payload.pop("target_type")
        payload["lastVerifiedAt"] = payload.pop("last_verified_at")
        return payload
