import json
from pathlib import Path


def test_frontend_package_declares_tauri_dev_script():
    web_dirs = list(Path(r"H:\陕西师范\UItest1").glob("*web"))
    assert web_dirs
    package_json = web_dirs[0] / "package.json"
    payload = json.loads(package_json.read_text(encoding="utf-8"))

    assert "tauri:dev" in payload["scripts"]
    assert "tauri:build" in payload["scripts"]
