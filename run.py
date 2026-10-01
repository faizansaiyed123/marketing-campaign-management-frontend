from __future__ import annotations

import os
import shutil
import signal
import subprocess
import sys
import time
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen


FRONTEND_DIR = Path(__file__).resolve().parent
BACKEND_DIR_NAME = "marketing-campaign-management-backend"
BACKEND_HEALTH_URL = "http://127.0.0.1:8000/health"
FRONTEND_URL = "http://127.0.0.1:5173"


def find_backend_dir() -> Path | None:
    configured = os.environ.get("BACKEND_DIR")
    candidates: list[Path] = []

    if configured:
        candidates.append(Path(configured).expanduser())

    for parent in [FRONTEND_DIR.parent, FRONTEND_DIR, *FRONTEND_DIR.parents]:
        candidates.append(parent / BACKEND_DIR_NAME)

    seen: set[Path] = set()
    for candidate in candidates:
        candidate = candidate.resolve()
        if candidate in seen:
            continue
        seen.add(candidate)
        if candidate.is_dir() and (candidate / "docker-compose.yml").is_file():
            return candidate

    return None


def npm_command() -> str:
    return "npm.cmd" if os.name == "nt" else "npm"


def require_command(command: str, message: str) -> None:
    if shutil.which(command) is None:
        raise SystemExit(message)


def wait_for_url(url: str, timeout: float, process: subprocess.Popen[bytes] | None = None) -> bool:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if process is not None:
            exit_code = process.poll()
            if exit_code is not None and exit_code != 0:
                return False
        try:
            with urlopen(url, timeout=2) as response:
                if 200 <= response.status < 400:
                    return True
        except (OSError, URLError):
            pass
        time.sleep(1)
    return False


def terminate_process(process: subprocess.Popen[bytes] | None, label: str) -> None:
    if process is None or process.poll() is not None:
        return

    try:
        process.send_signal(signal.SIGTERM)
        process.wait(timeout=8)
    except subprocess.TimeoutExpired:
        print(f"[{label}] did not stop promptly; terminating it.", flush=True)
        process.terminate()
        try:
            process.wait(timeout=3)
        except subprocess.TimeoutExpired:
            process.kill()
    except OSError:
        process.terminate()


def main() -> int:
    backend_dir = find_backend_dir()
    if backend_dir is None:
        raise SystemExit(
            "Backend repository was not found. Clone "
            f"'{BACKEND_DIR_NAME}' or set BACKEND_DIR to its path."
        )

    require_command(
        "docker",
        "Docker is required for the backend startup. Install Docker Desktop "
        "or Docker Engine with Compose v2, then run this script again.",
    )
    require_command(
        npm_command(),
        "Node.js/npm is required for the frontend startup. Install Node.js "
        "and npm, then run this script again.",
    )

    compose_check = subprocess.run(
        ["docker", "compose", "version"],
        cwd=backend_dir,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    if compose_check.returncode != 0:
        raise SystemExit(
            "Docker Compose v2 is not available. Confirm that 'docker compose' "
            "works in a terminal and run this script again."
        )

    backend_process: subprocess.Popen[bytes] | None = None
    frontend_process: subprocess.Popen[bytes] | None = None

    try:
        if wait_for_url(BACKEND_HEALTH_URL, timeout=0):
            print("[backend] already healthy; reusing the existing service.", flush=True)
        else:
            print("[backend] starting existing Docker Compose stack...", flush=True)
            backend_process = subprocess.Popen(
                ["docker", "compose", "up", "--build"],
                cwd=backend_dir,
            )
            if not wait_for_url(BACKEND_HEALTH_URL, timeout=120, process=backend_process):
                raise RuntimeError(
                    "Backend did not become healthy within 120 seconds. "
                    "Check the Docker Compose output above."
                )
            print("[backend] healthy.", flush=True)

        if wait_for_url(FRONTEND_URL, timeout=0):
            print("[frontend] already running on http://127.0.0.1:5173; reusing it.", flush=True)
        else:
            print("[frontend] starting Vite development server...", flush=True)
            frontend_process = subprocess.Popen(
                [npm_command(), "run", "dev", "--", "--host", "127.0.0.1", "--port", "5173"],
                cwd=FRONTEND_DIR,
                env=os.environ.copy(),
            )
            if not wait_for_url(FRONTEND_URL, timeout=60, process=frontend_process):
                raise RuntimeError(
                    "Frontend did not become available on port 5173 within 60 seconds. "
                    "Check the npm output above."
                )
            print("[frontend] ready at http://127.0.0.1:5173", flush=True)

        print("\nApplication is running. Press Ctrl+C to stop services started by this script.", flush=True)

        while True:
            for label, process in (
                ("backend", backend_process),
                ("frontend", frontend_process),
            ):
                if process is not None:
                    exit_code = process.poll()
                    if exit_code is not None:
                        raise RuntimeError(
                            f"{label.capitalize()} process exited with code {exit_code}."
                        )
            time.sleep(0.5)

    except KeyboardInterrupt:
        print("\nStopping services started by run.py...", flush=True)
        return 0
    finally:
        terminate_process(frontend_process, "frontend")
        terminate_process(backend_process, "backend")

        if backend_process is not None and backend_process.poll() is None:
            print(
                "[backend] Docker Compose is still running; stop it with "
                "'docker compose down' from the backend repository.",
                flush=True,
            )

    return 0


if __name__ == "__main__":
    sys.exit(main())
