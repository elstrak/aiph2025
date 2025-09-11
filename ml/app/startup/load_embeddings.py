from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

import numpy as np
import faiss  # type: ignore


# Resolve embeddings directory:
# 1) EMBEDDINGS_DIR env
# 2) Docker default: /app/embeddings
# 3) Local fallback: ./data/embeddings (project ml directory)
_env_dir = os.environ.get("EMBEDDINGS_DIR")
if _env_dir:
    BASE_EMBED_DIR = Path(_env_dir)
else:
    docker_dir = Path('/app/embeddings')
    local_dir = Path(__file__).resolve().parents[2] / 'data' / 'embeddings'
    BASE_EMBED_DIR = docker_dir if docker_dir.exists() else local_dir
VAC_EMBED_DIR = BASE_EMBED_DIR / 'vacancies'
COURSE_EMBED_DIR = BASE_EMBED_DIR / 'courses'

faiss_index: Optional[faiss.Index] = None
faiss_index_courses: Optional[faiss.Index] = None


def _load_all_embeddings(dir_path: Path) -> np.ndarray:
    files = sorted(
        dir_path.glob("emb_*.npy"),
        key=lambda x: int(x.stem.split("_")[1].split("-")[0])
    )
    if not files:
        raise FileNotFoundError(f"No embedding files found in {dir_path}")
    arrays = []
    for f in files:
        arr = np.load(f).astype("float32")
        arrays.append(arr)
    X = np.vstack(arrays)
    return X


def build_faiss() -> None:
    global faiss_index, faiss_index_courses
    # Vacancies
    try:
        vac_dir = VAC_EMBED_DIR 
        X = _load_all_embeddings(vac_dir)
        norms = np.linalg.norm(X, axis=1, keepdims=True) + 1e-12
        Xn = X / norms
        dim = Xn.shape[1]
        index = faiss.IndexHNSWFlat(dim, 32)
        index.hnsw.efConstruction = 200
        index.add(Xn)
        faiss_index = index
    except Exception:
        faiss_index = None

    # Courses
    try:
        XC = _load_all_embeddings(COURSE_EMBED_DIR)
        norms = np.linalg.norm(XC, axis=1, keepdims=True) + 1e-12
        XCn = XC / norms
        dimc = XCn.shape[1]
        index_c = faiss.IndexHNSWFlat(dimc, 32)
        index_c.hnsw.efConstruction = 200
        index_c.add(XCn)
        faiss_index_courses = index_c
    except Exception:
        faiss_index_courses = None


def search_top_k(query_vec: np.ndarray, k: int = 100) -> np.ndarray:
    if faiss_index is None:
        raise RuntimeError("FAISS index not built")
    q = query_vec.astype("float32")
    q = q / (np.linalg.norm(q) + 1e-12)
    _, idx_rows = faiss_index.search(q[None, :], k)
    rows = idx_rows[0]
    return rows.astype(np.int64)


def search_top_k_courses(query_vec: np.ndarray, k: int = 100) -> np.ndarray:
    if faiss_index_courses is None:
        raise RuntimeError("FAISS courses index not built")
    q = query_vec.astype("float32")
    q = q / (np.linalg.norm(q) + 1e-12)
    _, idx_rows = faiss_index_courses.search(q[None, :], k)
    rows = idx_rows[0]
    return rows.astype(np.int64)


