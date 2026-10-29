use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Task {
    pub id: String,
    pub name: String,
    pub trader: String,
    #[serde(default)]
    pub chapter: Option<String>,
    #[serde(default)]
    pub is_main: Option<bool>,
    pub map: Option<String>,
    pub kappa: Option<bool>,
    pub objectives: Option<Vec<String>>,
    pub guide: Option<String>,
    pub rewards: Option<String>,
    pub wiki_url: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct HideoutTask {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub chapter: Option<String>,
    #[serde(default)]
    pub requirements: Option<Vec<String>>,
    #[serde(default)]
    pub objectives: Option<Vec<String>>,
}

const SIDE_QUESTS_FILE: &str = "tarkov_quests_db.json";
const MAIN_QUESTS_FILE: &str = "tarkov_quests.json";
const HIDEOUT_FILE: &str = "tarkov_hideout_db.json";
const PROGRESS_FILE: &str = "tarkov_user_progress.json";

fn find_file(filename: &str) -> Option<PathBuf> {
    let candidate_paths = vec![
        PathBuf::from(filename),
        PathBuf::from("src-tauri").join(filename),
        PathBuf::from("..").join(filename),
        PathBuf::from("..").join("src-tauri").join(filename),
    ];

    for path in candidate_paths {
        if path.exists() {
            return Some(path);
        }
    }

    if let Ok(mut exe_path) = std::env::current_exe() {
        exe_path.pop();
        let in_exe_dir = exe_path.join(filename);
        if in_exe_dir.exists() {
            return Some(in_exe_dir);
        }
    }

    None
}

// Obtiene la ruta segura de almacenamiento del usuario en AppData
fn get_progress_path(app_handle: &tauri::AppHandle) -> PathBuf {
    if let Ok(dir) = app_handle.path().app_data_dir() {
        let _ = fs::create_dir_all(&dir);
        dir.join(PROGRESS_FILE)
    } else {
        PathBuf::from(PROGRESS_FILE)
    }
}

#[tauri::command]
fn load_quests() -> Result<Vec<Task>, String> {
    let mut all_tasks: Vec<Task> = Vec::new();

    // 1. Cargar Misiones Secundarias (Side Quests)
    if let Some(side_path) = find_file(SIDE_QUESTS_FILE) {
        if let Ok(content) = fs::read_to_string(&side_path) {
            if let Ok(mut side_tasks) = serde_json::from_str::<Vec<Task>>(&content) {
                all_tasks.append(&mut side_tasks);
            }
        }
    }

    // 2. Cargar Misiones Principales (Main Story 1.0)
    if let Some(main_path) = find_file(MAIN_QUESTS_FILE) {
        if let Ok(content) = fs::read_to_string(&main_path) {
            if let Ok(mut main_tasks) = serde_json::from_str::<Vec<Task>>(&content) {
                for task in &mut main_tasks {
                    if task.is_main.is_none() {
                        task.is_main = Some(true);
                    }
                }
                all_tasks.append(&mut main_tasks);
            }
        }
    }

    if all_tasks.is_empty() {
        return Err(format!(
            "No se pudieron encontrar o parsear las misiones desde '{}' o '{}'. Asegúrate de tener los archivos JSON en la carpeta src-tauri/",
            SIDE_QUESTS_FILE, MAIN_QUESTS_FILE
        ));
    }

    Ok(all_tasks)
}

#[tauri::command]
fn load_hideout() -> Result<Vec<HideoutTask>, String> {
    if let Some(hideout_path) = find_file(HIDEOUT_FILE) {
        if let Ok(content) = fs::read_to_string(&hideout_path) {
            if let Ok(tasks) = serde_json::from_str::<Vec<HideoutTask>>(&content) {
                return Ok(tasks);
            }
        }
    }
    Ok(Vec::new())
}

#[tauri::command]
fn load_progress(app_handle: tauri::AppHandle) -> HashMap<String, serde_json::Value> {
    let progress_path = get_progress_path(&app_handle);
    if let Ok(content) = fs::read_to_string(progress_path) {
        if let Ok(progress) = serde_json::from_str(&content) {
            return progress;
        }
    }
    HashMap::new()
}

#[tauri::command]
fn save_progress(app_handle: tauri::AppHandle, progress: HashMap<String, serde_json::Value>) -> Result<(), String> {
    let content = serde_json::to_string_pretty(&progress)
        .map_err(|e| format!("Error serializando progreso: {}", e))?;

    let progress_path = get_progress_path(&app_handle);

    fs::write(progress_path, content)
        .map_err(|e| format!("Error guardando archivo de progreso: {}", e))?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            load_quests,
            load_hideout,
            load_progress,
            save_progress
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}