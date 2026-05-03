#!/usr/bin/env python3
"""
junk_cleaner.py — Find and remove common junk / build-artifact directories.

Targets include: node_modules, .next, .open-next, .nuxt, __pycache__,
                 .cache, .turbo, coverage, and many more.

Usage:
    python junk_cleaner.py                       # scan current directory
    python junk_cleaner.py ~/projects            # scan specific directory
    python junk_cleaner.py --dry-run             # preview without deleting
    python junk_cleaner.py -y                    # skip confirmation prompt
    python junk_cleaner.py --only node_modules .next
    python junk_cleaner.py --aggressive          # include dist/, build/, etc.
    python junk_cleaner.py --list-targets        # show all known targets

Requires Python 3.9+
"""

from __future__ import annotations

import argparse
import os
import shutil
import stat
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path

# ═══════════════════════════════════════════════════════════════════════════════
# ANSI colors
# ═══════════════════════════════════════════════════════════════════════════════
RED     = "\033[91m"
GREEN   = "\033[92m"
YELLOW  = "\033[93m"
CYAN    = "\033[96m"
MAGENTA = "\033[95m"
BOLD    = "\033[1m"
DIM     = "\033[2m"
RESET   = "\033[0m"

_USE_COLOR = True


def _c(code: str, text: str) -> str:
    """Wrap *text* in ANSI *code* if color is enabled."""
    return f"{code}{text}{RESET}" if _USE_COLOR else str(text)


def _pad(text: str, width: int) -> str:
    """Left-align *text* in a field of *width*, safe to wrap with ANSI."""
    return text + " " * max(0, width - len(text))


# ═══════════════════════════════════════════════════════════════════════════════
# Junk directory registry
# ═══════════════════════════════════════════════════════════════════════════════
@dataclass(frozen=True)
class JunkDef:
    """Definition of a known junk directory."""
    name: str
    description: str
    aggressive: bool = False          # requires --aggressive or explicit --only


JUNK_DEFS: list[JunkDef] = [
    # ── JavaScript / TypeScript ────────────────────────────────────────────
    JunkDef("node_modules",    "JS/TS dependencies"),
    # ── Next.js ────────────────────────────────────────────────────────────
    JunkDef(".next",           "Next.js build cache"),
    JunkDef(".open-next",      "OpenNext build artifacts"),
    # ── Nuxt / Vue ─────────────────────────────────────────────────────────
    JunkDef(".nuxt",           "Nuxt build cache"),
    JunkDef(".output",         "Nuxt output"),
    # ── Svelte ─────────────────────────────────────────────────────────────
    JunkDef(".svelte-kit",     "SvelteKit generated files"),
    # ── Angular ────────────────────────────────────────────────────────────
    JunkDef(".angular",        "Angular CLI cache"),
    # ── Vite / bundler caches ──────────────────────────────────────────────
    JunkDef(".vite",           "Vite cache"),
    JunkDef(".vitest",         "Vitest cache"),
    JunkDef(".turbo",          "Turborepo cache"),
    JunkDef(".nx",             "Nx monorepo cache"),
    JunkDef(".parcel-cache",   "Parcel bundler cache"),
    JunkDef(".rollup.cache",   "Rollup cache"),
    JunkDef(".rswind",         "RSWind cache"),
    # ── Generic caches ─────────────────────────────────────────────────────
    JunkDef(".cache",          "Generic cache directory"),
    # ── Coverage / testing ─────────────────────────────────────────────────
    JunkDef("coverage",        "Test coverage reports"),
    # ── Infrastructure as code ─────────────────────────────────────────────
    JunkDef(".terraform",      "Terraform provider cache"),
    JunkDef(".serverless",     "Serverless Framework cache"),
    # ── Mobile ─────────────────────────────────────────────────────────────
    JunkDef(".expo",           "Expo dev-client cache"),
    # ── Python ─────────────────────────────────────────────────────────────
    JunkDef("__pycache__",     "Python bytecode cache"),
    JunkDef(".pytest_cache",   "pytest cache"),
    JunkDef(".mypy_cache",     "mypy type-checker cache"),
    JunkDef(".ruff_cache",     "ruff linter cache"),
    JunkDef(".tox",            "tox environments"),
    # ── Dart / Flutter ─────────────────────────────────────────────────────
    JunkDef(".dart_tool",      "Dart/Flutter tool cache"),
    # ── Gradle ─────────────────────────────────────────────────────────────
    JunkDef(".gradle",         "Gradle build cache"),
    # ── Aggressive (build outputs — opt-in) ────────────────────────────────
    JunkDef("dist",            "Build output (dist)",          aggressive=True),
    JunkDef("build",           "Build output (build)",         aggressive=True),
    JunkDef("out",             "Build output (out)",           aggressive=True),
    JunkDef("target",          "Rust/Cargo target",            aggressive=True),
    JunkDef(".venv",           "Python virtual environment",   aggressive=True),
    JunkDef("storybook-static","Storybook static build",       aggressive=True),
]

_JUNK_BY_NAME: dict[str, JunkDef] = {j.name: j for j in JUNK_DEFS}
_ALL_JUNK_NAMES: set[str]         = set(_JUNK_BY_NAME.keys())


# ═══════════════════════════════════════════════════════════════════════════════
# Utilities
# ═══════════════════════════════════════════════════════════════════════════════
def format_size(n: int) -> str:
    """Human-readable byte count."""
    for unit in ("B", "KB", "MB", "GB"):
        if abs(n) < 1024:
            return f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} TB"


def get_dir_size(path: Path) -> int:
    """Total bytes of all regular files under *path* (non-following symlinks)."""
    total = 0
    try:
        for entry in path.rglob("*"):
            try:
                if entry.is_file(follow_symlinks=False):
                    total += entry.stat(follow_symlinks=False).st_size
            except (OSError, PermissionError):
                pass
    except (PermissionError, OSError):
        pass
    return total


def _force_remove(func, path_str, exc_info):
    """shutil.rmtree *onerror* — clears read-only bit on Windows, then retries."""
    try:
        os.chmod(path_str, stat.S_IWRITE | stat.S_IREAD)
        func(path_str)
    except Exception as exc:
        print(_c(RED, f"    ⚠  Could not force-remove: {path_str}"))
        print(_c(DIM, f"       {exc}"))


def delete_tree(path: Path) -> tuple[bool, int]:
    """Remove *path* tree; returns ``(success, bytes_freed)``."""
    size = get_dir_size(path)
    try:
        shutil.rmtree(path, onerror=_force_remove)
        # Verify removal — sometimes Windows needs a second pass
        if path.exists():
            try:
                shutil.rmtree(path, onerror=_force_remove)
            except Exception:
                pass
        return (True, size) if not path.exists() else (False, 0)
    except Exception:
        return False, 0


# ═══════════════════════════════════════════════════════════════════════════════
# Scanner
# ═══════════════════════════════════════════════════════════════════════════════
@dataclass
class FoundDir:
    path: Path
    name: str
    size: int = 0


def scan(root: Path, target_names: set[str]) -> list[FoundDir]:
    """
    Walk *root* and collect every directory whose name is in *target_names*.

    For performance, descent into **any** directory named in ``_ALL_JUNK_NAMES``
    is skipped — regardless of whether it is a target — because junk directories
    are never expected to contain other interesting junk at deeper levels.
    """
    found: list[FoundDir] = []
    seen: set[Path] = set()

    for dirpath, dirnames, _filenames in os.walk(root, onerror=lambda _e: None):
        current = Path(dirpath)
        to_remove: list[int] = []

        for i, d in enumerate(dirnames):
            full = current / d

            if d in target_names:
                if full not in seen:
                    seen.add(full)
                    try:
                        if full.is_dir(follow_symlinks=False):
                            found.append(FoundDir(path=full, name=d))
                    except (OSError, PermissionError):
                        pass
                to_remove.append(i)
            elif d in _ALL_JUNK_NAMES:
                # Non-target junk — still skip descent for speed
                to_remove.append(i)

        # Pop in reverse order to keep indices valid
        for i in sorted(to_remove, reverse=True):
            dirnames.pop(i)

    return found


# ═══════════════════════════════════════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════════════════════════════════════
def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="junk_cleaner",
        description="Find and remove common junk / build-artifact directories.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""\
examples:
  %(prog)s                              scan & clean current directory
  %(prog)s ~/projects                   scan a specific directory
  %(prog)s --dry-run                    preview without deleting
  %(prog)s -y                           skip confirmation prompt
  %(prog)s --only node_modules .next    clean only these targets
  %(prog)s --exclude __pycache__        clean everything except __pycache__
  %(prog)s --aggressive                 also remove dist/, build/, out/, target/, .venv/
  %(prog)s --list-targets               show all known junk directory names
""",
    )
    p.add_argument("root", nargs="?", default=None,
                   help="root directory to scan (default: cwd)")
    p.add_argument("-y", "--yes", action="store_true",
                   help="skip confirmation prompt")
    p.add_argument("--dry-run", action="store_true",
                   help="preview only — nothing is deleted")
    p.add_argument("--aggressive", action="store_true",
                   help="include build outputs (dist, build, out, target, .venv)")
    p.add_argument("--only", nargs="+", metavar="NAME",
                   help="only look for these directory names")
    p.add_argument("--exclude", nargs="+", metavar="NAME",
                   help="exclude these directory names from the default set")
    p.add_argument("--list-targets", action="store_true",
                   help="list all known junk directory names and exit")
    p.add_argument("--no-color", action="store_true",
                   help="disable colored output")
    p.add_argument("-j", "--jobs", type=int, default=4,
                   help="threads for parallel size calculation (default: 4)")
    return p


def resolve_targets(args: argparse.Namespace) -> set[str]:
    """Determine which junk names are active given CLI flags."""
    if args.only:
        return set(args.only)
    names: set[str] = set()
    for j in JUNK_DEFS:
        if j.aggressive and not args.aggressive:
            continue
        names.add(j.name)
    if args.exclude:
        names -= set(args.exclude)
    return names


# ═══════════════════════════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════════════════════════
def main() -> None:
    global _USE_COLOR

    parser = build_parser()
    args = parser.parse_args()

    if args.jobs < 1:
        parser.error("--jobs must be at least 1")

    if args.no_color or os.getenv("NO_COLOR") is not None:
        _USE_COLOR = False

    # ── --list-targets ─────────────────────────────────────────────────────
    if args.list_targets:
        max_name = max(len(j.name) for j in JUNK_DEFS)
        print(f"\n{_c(BOLD, 'Known junk directory targets:')}\n")
        for j in JUNK_DEFS:
            tag = _c(DIM, " (aggressive)") if j.aggressive else ""
            print(f"  {_c(CYAN, _pad(j.name, max_name + 2))} {j.description}{tag}")
        print()
        return

    # ── Root validation ────────────────────────────────────────────────────
    root = Path(args.root).resolve() if args.root else Path.cwd()

    if not root.is_dir():
        print(_c(RED, f"✖  Not a directory: {root}"))
        sys.exit(1)

    # Safety guard: refuse to scan system roots
    if root == root.parent:
        print(_c(RED, f"✖  Refusing to scan filesystem root: {root}"))
        print(_c(DIM, "   Please specify a project directory."))
        sys.exit(1)

    # ── Resolve targets ────────────────────────────────────────────────────
    target_names = resolve_targets(args)
    if not target_names:
        print(_c(YELLOW, "No targets selected. Nothing to do."))
        return

    # ── Header ─────────────────────────────────────────────────────────────
    targets_display = ", ".join(sorted(target_names))
    if len(targets_display) > 80:
        targets_display = targets_display[:77] + "…"

    print(f"\n{_c(BOLD + CYAN, '─' * 66)}")
    print(_c(BOLD + CYAN, "  🧹 Junk Directory Cleaner"))
    print(_c(BOLD + CYAN, '─' * 66))
    print(_c(DIM, f"  Root    : {root}"))
    print(_c(DIM, f"  Targets : {targets_display}"))
    if args.aggressive:
        print(_c(MAGENTA, "  Mode    : AGGRESSIVE (build outputs included)"))
    if args.dry_run:
        print(_c(YELLOW, "  Mode    : DRY RUN (nothing will be deleted)"))
    print(_c(BOLD + CYAN, '─' * 66) + "\n")

    # ── Scan ───────────────────────────────────────────────────────────────
    print(_c(YELLOW, "⟳  Scanning ..."), end=" ", flush=True)
    t0 = time.perf_counter()
    found = scan(root, target_names)
    scan_secs = time.perf_counter() - t0
    print(_c(DIM, f"({scan_secs:.1f}s)"))

    if not found:
        print(_c(GREEN, "✔  No junk directories found. Nothing to do.") + "\n")
        return

    # ── Calculate sizes (parallel) ────────────────────────────────────────
    thread_count = min(args.jobs, len(found))
    print(_c(DIM, f"   Calculating sizes ({thread_count} thread(s)) …"),
          end=" ", flush=True)
    t1 = time.perf_counter()

    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futures = {pool.submit(get_dir_size, f.path): i
                   for i, f in enumerate(found)}
        for future in as_completed(futures):
            idx = futures[future]
            try:
                found[idx].size = future.result()
            except Exception:
                found[idx].size = 0

    calc_secs = time.perf_counter() - t1
    print(_c(DIM, f"({calc_secs:.1f}s)"))

    # Sort largest-first
    found.sort(key=lambda f: f.size, reverse=True)

    # ── Display ────────────────────────────────────────────────────────────
    total_size = sum(f.size for f in found)

    by_name: dict[str, list[FoundDir]] = {}
    for f in found:
        by_name.setdefault(f.name, []).append(f)

    sorted_groups = sorted(
        by_name.items(),
        key=lambda kv: sum(x.size for x in kv[1]),
        reverse=True,
    )

    dir_word = "directory" if len(found) == 1 else "directories"
    print(f"\n{_c(BOLD, f'Found {len(found)} {dir_word} ({format_size(total_size)} total):')}\n")

    MAX_SHOWN = 5  # max individual paths shown per group

    for name, items in sorted_groups:
        group_size = sum(f.size for f in items)
        desc = _JUNK_BY_NAME[name].description if name in _JUNK_BY_NAME else ""
        count_lbl = f"{len(items)} instance{'s' if len(items) != 1 else ''}"

        print(f"  {_c(CYAN, _pad(name, 22))}  "
              f"{_c(DIM, _pad(desc, 30))}  "
              f"{_c(DIM, f'({count_lbl}, {format_size(group_size)})')}")

        for i, f in enumerate(items):
            rel = (f.path.relative_to(root)
                   if f.path.is_relative_to(root) else f.path)
            print(f"    {_c(DIM, '↳')}  {rel}  {_c(DIM, f'({format_size(f.size)})')}")
            if i >= MAX_SHOWN - 1 and len(items) > MAX_SHOWN:
                remaining = len(items) - MAX_SHOWN
                print(f"    {_c(DIM, f'… and {remaining} more')}")
                break
        print()

    # ── Confirmation ───────────────────────────────────────────────────────
    if not args.dry_run and not args.yes:
        print(_c(BOLD + CYAN, '─' * 66))
        try:
            answer = input(
                _c(BOLD + YELLOW,
                   f"  Delete {len(found)} {dir_word}? [y/N] "))
        except (EOFError, KeyboardInterrupt):
            print(_c(DIM, "\n  Cancelled.") + "\n")
            return
        if answer.strip().lower() not in ("y", "yes"):
            print(_c(DIM, "  Cancelled.") + "\n")
            return
        print()

    # ── Delete ─────────────────────────────────────────────────────────────
    if not args.dry_run:
        print(f"{_c(BOLD + CYAN, '─' * 66)}")
        print(_c(BOLD + RED, "  Deleting …"))
        print(f"{_c(BOLD + CYAN, '─' * 66)}\n")

    total_freed = 0
    deleted = 0
    failed  = 0

    for idx, item in enumerate(found, 1):
        rel = (item.path.relative_to(root)
               if item.path.is_relative_to(root) else item.path)
        print(f"  [{idx}/{len(found)}] {_c(YELLOW, str(rel))}")

        if args.dry_run:
            print(f"         {_c(DIM, '⊘  Would delete')} "
                  f"{_c(DIM, f'({format_size(item.size)})')}")
            continue

        ok, freed = delete_tree(item.path)
        if ok:
            print(f"         {_c(GREEN, '✔  Deleted')}  "
                  f"{_c(DIM, f'({format_size(freed)} freed)')}")
            total_freed += freed
            deleted += 1
        else:
            print(f"         {_c(RED, '✖  Failed')}   "
                  f"{_c(DIM, '(close editors/terminals using this folder)')}")
            failed += 1

    # ── Summary ────────────────────────────────────────────────────────────
    print(f"\n{_c(BOLD + CYAN, '─' * 66)}")
    print(_c(BOLD, "  Summary"))
    print(_c(BOLD + CYAN, '─' * 66))

    if args.dry_run:
        print(f"  {_c(CYAN, '⊘  Would delete')}: {len(found)}  "
              f"{_c(DIM, f'({format_size(total_size)} would be freed)')}")
    else:
        print(f"  {_c(GREEN, '✔  Deleted')}: {deleted}")
        if failed:
            print(f"  {_c(RED, '✖  Failed')}:  {failed}")
        print(f"  {_c(CYAN, '💾  Freed')}:  {format_size(total_freed)}")

    elapsed = time.perf_counter() - t0
    print(f"  {_c(DIM, '⏱  Time')}:   {elapsed:.1f}s")
    print(f"{_c(BOLD + CYAN, '─' * 66)}\n")


if __name__ == "__main__":
    main()
