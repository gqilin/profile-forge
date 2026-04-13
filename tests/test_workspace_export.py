import json
import subprocess
from pathlib import Path

from src.core.services.repository import bootstrap_sample_data
from src.core.storage.json_store import JsonStore


def test_export_workspace_snapshot_script_writes_json(tmp_path: Path):
    output_path = tmp_path / "workspace.json"
    data_path = tmp_path / "data"

    store = JsonStore(data_path)
    bootstrap_sample_data(store)

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
    assert payload["dashboard"]["shell"]["title"] == "AI Config Manager"
    assert payload["pages"]["profiles"]["title"] == "Profiles"
