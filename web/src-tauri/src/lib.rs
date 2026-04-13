use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::io::Write;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use tauri::Manager;

#[derive(Deserialize, Serialize)]
struct WorkspacePayload {
    workspace_root: String,
}

#[derive(Deserialize, Serialize)]
struct ToolPayload {
    workspace_root: String,
    tool_name: String,
}

#[derive(Deserialize, Serialize)]
struct RenameToolPayload {
    workspace_root: String,
    old_name: String,
    new_name: String,
}

#[derive(Deserialize, Serialize)]
struct ConfigSetPayload {
    workspace_root: String,
    tool_name: String,
    config_set_id: String,
}

#[derive(Deserialize, Serialize)]
struct ThemePayload {
    workspace_root: String,
    theme: String,
}

fn project_root(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    if cfg!(debug_assertions) {
        let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        return manifest_dir
            .parent()
            .and_then(|path| path.parent())
            .map(|path| path.to_path_buf())
            .ok_or_else(|| "failed to resolve project root from CARGO_MANIFEST_DIR".to_string());
    }

    app.path()
        .resolve("..", tauri::path::BaseDirectory::Resource)
        .map_err(|err| err.to_string())
}

fn run_python_action(app: &tauri::AppHandle, action: &str, payload: Value) -> Result<Value, String> {
    let root = project_root(app)?;
    let script = root.join("src").join("core").join("services").join("workspace_api.py");
    let mut child = Command::new("python3")
        .arg(script)
        .arg(action)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .env("PYTHONIOENCODING", "utf-8")
        .spawn()
        .map_err(|err| err.to_string())?;

    if let Some(stdin) = child.stdin.as_mut() {
        stdin
            .write_all(payload.to_string().as_bytes())
            .map_err(|err| err.to_string())?;
    }

    let output = child.wait_with_output().map_err(|err| err.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let json_line = stdout
        .lines()
        .rev()
        .find(|line| !line.trim().is_empty())
        .ok_or_else(|| "python action returned empty stdout".to_string())?;

    serde_json::from_str(json_line).map_err(|err| format!("{} | stdout: {}", err, stdout))
}

#[tauri::command]
fn get_workspace_snapshot(app: tauri::AppHandle, payload: WorkspacePayload) -> Result<Value, String> {
    run_python_action(&app, "get_workspace_snapshot", serde_json::to_value(payload).map_err(|err| err.to_string())?)
}

#[tauri::command]
fn create_tool(app: tauri::AppHandle, payload: ToolPayload) -> Result<Value, String> {
    run_python_action(&app, "create_tool", serde_json::to_value(payload).map_err(|err| err.to_string())?)
}

#[tauri::command]
fn rename_tool(app: tauri::AppHandle, payload: RenameToolPayload) -> Result<Value, String> {
    run_python_action(&app, "rename_tool", serde_json::to_value(payload).map_err(|err| err.to_string())?)
}

#[tauri::command]
fn delete_tool(app: tauri::AppHandle, payload: ToolPayload) -> Result<Value, String> {
    run_python_action(&app, "delete_tool", serde_json::to_value(payload).map_err(|err| err.to_string())?)
}

#[tauri::command]
fn create_config_set_structure(app: tauri::AppHandle, payload: ConfigSetPayload) -> Result<Value, String> {
    run_python_action(&app, "create_config_set_structure", serde_json::to_value(payload).map_err(|err| err.to_string())?)
}

#[tauri::command]
fn update_theme(app: tauri::AppHandle, payload: ThemePayload) -> Result<Value, String> {
    run_python_action(&app, "update_theme", serde_json::to_value(payload).map_err(|err| err.to_string())?)
}

#[tauri::command]
fn activate_config_set(app: tauri::AppHandle, payload: ConfigSetPayload) -> Result<Value, String> {
    run_python_action(&app, "activate_config_set", serde_json::to_value(payload).map_err(|err| err.to_string())?)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![
      get_workspace_snapshot,
      create_tool,
      rename_tool,
      delete_tool,
      create_config_set_structure,
      update_theme,
      activate_config_set
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
