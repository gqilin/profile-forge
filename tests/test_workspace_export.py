import json
import subprocess
from pathlib import Path

from src.core.services.repository import bootstrap_sample_data
from src.core.storage.json_store import JsonStore


def test_export_workspace_snapshot_script_writes_json(tmp_path: Path):
    output_path = tmp_path / "workspace.json"
    data_path = tmp_path / "data"

    store = JsonStore(data_path)
    bootstrap_sample_data(store, workspace_root=data_path)

    result = subprocess.run(
        [
            "python3",
            "H:\\陕西师范\\UItest1\\src\\export_workspace.py",
            str(data_path),
            str(output_path),
        ],
        capture_output=True,
        text=True,
        check=False,
    )

    assert result.returncode == 0
    payload = json.loads(output_path.read_text(encoding="utf-8"))
    assert payload["workspace"]["rootPath"] == str(data_path)
    assert payload["tools"][0]["name"] == "codex"
    assert payload["activeState"]["factory"] == "design"
    assert payload["currentTool"]["actions"]["createStructureLabel"] == "创建配置文件夹结构"
