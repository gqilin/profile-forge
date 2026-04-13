from __future__ import annotations

import json
from pathlib import Path


class JsonStore:
    def __init__(self, root: Path):
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True)

    def write_collection(self, name: str, data: list[dict]) -> None:
        path = self.root / f"{name}.json"
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    def read_collection(self, name: str) -> list[dict]:
        path = self.root / f"{name}.json"
        if not path.exists():
            return []
        return json.loads(path.read_text(encoding="utf-8"))

    def write_document(self, name: str, data: dict) -> None:
        path = self.root / f"{name}.json"
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
