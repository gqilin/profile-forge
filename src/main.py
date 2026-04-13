from pathlib import Path
from pprint import pprint

from src.core.services.repository import AppRepository, bootstrap_sample_data
from src.core.storage.json_store import JsonStore


def main() -> None:
    store = JsonStore(Path.home() / ".ai-config-manager-demo")
    bootstrap_sample_data(store)
    repository = AppRepository(store)
    pprint(repository.get_workspace_snapshot())


if __name__ == "__main__":
    main()
