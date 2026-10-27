// 千鸟热点看板 · Tauri 桌面端入口
//
// 架构要点：
//  - 后端为 Nitro（Node）服务，打包为 sidecar 资源（node.exe + server/ 目录）。
//  - 生产构建中，主进程拉起本地 Nitro 服务（http://127.0.0.1:3000），
//    待端口就绪后，用 Webview 窗口加载该本地地址。
//  - 前端 API 使用相对路径 `/api`，在本地服务下自动指向本地后端，无需改动。
//  - 开发模式（debug）不拉起 sidecar，直接由 `npm run dev` 的 Vite+Nitro 提供 3000 端口。
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::{BufRead, BufReader};
use std::net::TcpStream;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use url::Url;

/// 将诊断日志追加写入 %TEMP%\qyn-tauri.log（GUI 子系统下 eprintln 不可见）
fn log_msg(msg: &str) {
    use std::io::Write;
    let path = std::env::temp_dir().join("qyn-tauri.log");
    if let Ok(mut f) = std::fs::OpenOptions::new().create(true).append(true).open(&path) {
        let ts = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0);
        let _ = writeln!(f, "[{ts}] {msg}");
    }
}

/// 后端 Nitro 服务进程句柄；应用退出时自动终止子进程
struct Backend(Arc<Mutex<Option<Child>>>);

impl Drop for Backend {
    fn drop(&mut self) {
        if let Ok(mut guard) = self.0.lock() {
            if let Some(mut child) = guard.take() {
                let _ = child.kill();
            }
        }
    }
}

/// 轮询指定地址端口，直到可连接或超时
fn wait_for_port(addr: &str, port: u16, timeout: Duration) -> bool {
    let start = Instant::now();
    loop {
        if TcpStream::connect((addr, port)).is_ok() {
            return true;
        }
        if start.elapsed() > timeout {
            return false;
        }
        std::thread::sleep(Duration::from_millis(200));
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // 仅在生产构建中拉起本地 Nitro 后端；开发模式由 `npm run dev` 提供
            #[cfg(not(debug_assertions))]
            {
                let res_raw = app
                    .path()
                    .resource_dir()
                    .expect("无法定位应用资源目录");
                // Node 的模块解析不支持 \\?\ verbatim 路径，必须转为普通路径
                let res_str = res_raw.to_string_lossy().to_string();
                let simplified = if let Some(rest) = res_str.strip_prefix(r"\\?\UNC\") {
                    format!(r"\\{rest}")
                } else {
                    res_str
                        .strip_prefix(r"\\?\")
                        .unwrap_or(&res_str)
                        .to_string()
                };
                let res = std::path::PathBuf::from(simplified);
                log_msg(&format!("资源目录: {}", res.display()));
                let node = res.join("node.exe");
                let entry = res.join("server").join("index.mjs");

                if node.exists() && entry.exists() {
                    log_msg(&format!(
                        "资源齐全 node={} entry={}",
                        node.display(),
                        entry.display()
                    ));
                    match Command::new(&node)
                        .arg(&entry)
                        .current_dir(&res)
                        .env("PORT", "3000")
                        .env("HOST", "127.0.0.1")
                        .env("NODE_ENV", "production")
                        .stdout(Stdio::piped())
                        .stderr(Stdio::piped())
                        .spawn()
                    {
                        Ok(mut child) => {
                            log_msg("sidecar 进程已启动");
                            let out = child.stdout.take();
                            let err = child.stderr.take();
                            std::thread::spawn(move || {
                                if let Some(s) = out {
                                    for line in BufReader::new(s)
                                        .lines()
                                        .map_while(Result::ok)
                                    {
                                        log_msg(&format!("[node:out] {line}"));
                                    }
                                }
                            });
                            std::thread::spawn(move || {
                                if let Some(s) = err {
                                    for line in BufReader::new(s)
                                        .lines()
                                        .map_while(Result::ok)
                                    {
                                        log_msg(&format!("[node:err] {line}"));
                                    }
                                }
                            });
                            let child_slot = Arc::new(Mutex::new(Some(child)));
                            app.manage(Backend(child_slot.clone()));
                            let ready =
                                wait_for_port("127.0.0.1", 3000, Duration::from_secs(30));
                            log_msg(&format!("端口就绪: {ready}"));
                            if !ready {
                                let status = child_slot
                                    .lock()
                                    .ok()
                                    .and_then(|mut g| {
                                        g.as_mut().and_then(|c| c.try_wait().ok())
                                    });
                                log_msg(&format!("sidecar 退出状态: {status:?}"));
                            }
                        }
                        Err(e) => log_msg(&format!("启动后端失败: {e}")),
                    }
                } else {
                    log_msg(&format!(
                        "缺少后端资源: node={} entry={}",
                        node.display(),
                        entry.display()
                    ));
                }
            }

            // 窗口统一加载本地 Nitro 服务（开发=localhost:3000，生产=127.0.0.1:3000）
            let _window = WebviewWindowBuilder::new(
                app,
                "main",
                WebviewUrl::External(Url::parse("http://localhost:3000").unwrap()),
            )
            .title("千鸟热点看板")
            .inner_size(1280.0, 800.0)
            .min_inner_size(360.0, 640.0)
            .build()?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
