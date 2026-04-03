#!/usr/bin/env python3
"""Browse installed CJK fonts and copy Illustrator-friendly font names.

This tool is designed for Windows and uses only the Python standard library.
It scans the installed system fonts, keeps the fonts that advertise CJK glyph
coverage, previews user-entered text, and lets the user copy a font name for
use in Illustrator.
"""

from __future__ import annotations

import argparse
import os
import re
import struct
import sys
import tkinter as tk
import winreg
from dataclasses import dataclass
from pathlib import Path
from tkinter import font as tkfont
from tkinter import ttk


FONT_REGISTRY_KEY = r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts"
FONT_EXTENSIONS = {".ttf", ".otf", ".ttc", ".otc"}
CJK_RANGES = (
    (0x3400, 0x4DBF),
    (0x4E00, 0x9FFF),
    (0xF900, 0xFAFF),
    (0x20000, 0x2A6DF),
    (0x2A700, 0x2EBEF),
)
ILLUSTRATOR_FONT_LIST = Path(__file__).with_name("系統字型名稱.txt")
DEFAULT_PREVIEW_TEXT = "王小明 測試字體 ABC 123"


@dataclass(frozen=True)
class NameRecord:
    name_id: int
    platform_id: int
    language_id: int
    text: str


@dataclass
class IllustratorMatch:
    name: str
    family_style: str


@dataclass
class FontFace:
    file_path: Path
    face_index: int
    family: str
    style: str
    full_name: str
    postscript_name: str
    display_name: str
    family_style: str
    intervals: list[tuple[int, int]]
    name_candidates: tuple[str, ...]
    illustrator_name: str | None = None
    illustrator_family_style: str | None = None
    tk_family: str | None = None

    def supports_text(self, text: str) -> bool:
        codepoints = [ord(char) for char in text if not char.isspace()]
        return all(self.supports_codepoint(codepoint) for codepoint in codepoints)

    def supports_codepoint(self, codepoint: int) -> bool:
        for start, end in self.intervals:
            if codepoint < start:
                return False
            if start <= codepoint <= end:
                return True
        return False


def read_uint16(data: bytes, offset: int) -> int:
    return struct.unpack_from(">H", data, offset)[0]


def read_uint32(data: bytes, offset: int) -> int:
    return struct.unpack_from(">I", data, offset)[0]


def iter_font_paths() -> list[Path]:
    paths: dict[str, Path] = {}
    font_dirs = [
        Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts",
        Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft" / "Windows" / "Fonts",
    ]

    def add_path(path: Path) -> None:
        if path.suffix.lower() not in FONT_EXTENSIONS:
            return
        if path.is_file():
            paths[str(path).lower()] = path

    for hive in (winreg.HKEY_LOCAL_MACHINE, winreg.HKEY_CURRENT_USER):
        try:
            key = winreg.OpenKey(hive, FONT_REGISTRY_KEY)
        except OSError:
            continue

        index = 0
        while True:
            try:
                _, raw_value, _ = winreg.EnumValue(key, index)
            except OSError:
                break
            index += 1

            if not isinstance(raw_value, str) or not raw_value:
                continue

            candidate = Path(raw_value)
            if candidate.is_absolute():
                add_path(candidate)
                continue

            for font_dir in font_dirs:
                resolved = font_dir / raw_value
                if resolved.exists():
                    add_path(resolved)
                    break

    for font_dir in font_dirs:
        if not font_dir.exists():
            continue
        for entry in font_dir.iterdir():
            if entry.is_file() and entry.suffix.lower() in FONT_EXTENSIONS:
                add_path(entry)

    return sorted(paths.values(), key=lambda item: item.name.lower())


def parse_illustrator_font_list(path: Path) -> tuple[dict[str, IllustratorMatch], dict[str, IllustratorMatch]]:
    by_name: dict[str, IllustratorMatch] = {}
    by_family_style: dict[str, IllustratorMatch] = {}

    if not path.exists():
        return by_name, by_family_style

    pattern = re.compile(
        r"fonts\[\d+\]\.name = (?P<name>.+?) ,fonts\[\d+\]\.family_style = (?P<family_style>.+)$"
    )

    for line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
        cleaned = line.strip().strip('"')
        match = pattern.search(cleaned)
        if not match:
            continue

        illustrator_name = match.group("name").strip()
        family_style = match.group("family_style").strip()
        info = IllustratorMatch(name=illustrator_name, family_style=family_style)

        by_name[illustrator_name.lower()] = info
        by_family_style[normalize_text(family_style)] = info

    return by_name, by_family_style


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip().lower()


def get_face_offsets(data: bytes) -> list[int]:
    if data[:4] == b"ttcf" and len(data) >= 12:
        font_count = read_uint32(data, 8)
        return [read_uint32(data, 12 + index * 4) for index in range(font_count)]
    return [0]


def read_table_directory(data: bytes, face_offset: int) -> dict[str, tuple[int, int]]:
    if face_offset + 12 > len(data):
        return {}

    try:
        num_tables = read_uint16(data, face_offset + 4)
    except struct.error:
        return {}

    directory: dict[str, tuple[int, int]] = {}
    table_offset = face_offset + 12

    for index in range(num_tables):
        entry_offset = table_offset + index * 16
        if entry_offset + 16 > len(data):
            break
        tag = data[entry_offset : entry_offset + 4].decode("ascii", errors="ignore")
        offset = read_uint32(data, entry_offset + 8)
        length = read_uint32(data, entry_offset + 12)
        directory[tag] = (offset, length)

    return directory


def decode_name_string(platform_id: int, raw: bytes) -> str:
    if platform_id in (0, 3):
        return raw.decode("utf-16-be", errors="ignore").replace("\x00", "").strip()
    if platform_id == 1:
        return raw.decode("mac_roman", errors="ignore").replace("\x00", "").strip()
    return raw.decode("latin-1", errors="ignore").replace("\x00", "").strip()


def read_name_records(data: bytes, offset: int, length: int) -> list[NameRecord]:
    end = offset + length
    if end > len(data) or offset + 6 > len(data):
        return []

    count = read_uint16(data, offset + 2)
    string_offset = read_uint16(data, offset + 4)
    records: list[NameRecord] = []

    for index in range(count):
        record_offset = offset + 6 + index * 12
        if record_offset + 12 > len(data):
            break

        platform_id = read_uint16(data, record_offset)
        name_id = read_uint16(data, record_offset + 6)
        length_value = read_uint16(data, record_offset + 8)
        text_offset = read_uint16(data, record_offset + 10)
        language_id = read_uint16(data, record_offset + 4)

        start = offset + string_offset + text_offset
        stop = start + length_value
        if stop > len(data):
            continue

        text = decode_name_string(platform_id, data[start:stop])
        if not text:
            continue

        records.append(
            NameRecord(
                name_id=name_id,
                platform_id=platform_id,
                language_id=language_id,
                text=text,
            )
        )

    return records


def preferred_name_score(record: NameRecord) -> tuple[int, int, int]:
    language_priority = {
        0x0404: 0,
        0x0C04: 1,
        0x0804: 2,
        0x0411: 3,
        0x0412: 4,
        0x0409: 5,
        0x0000: 6,
    }
    platform_priority = 0 if record.platform_id in (0, 3) else 1
    return (
        platform_priority,
        language_priority.get(record.language_id, 9),
        len(record.text),
    )


def pick_names(records: list[NameRecord], *name_ids: int) -> list[str]:
    selected = [record for record in records if record.name_id in name_ids and record.text.strip()]
    selected.sort(key=preferred_name_score)

    results: list[str] = []
    seen: set[str] = set()
    for record in selected:
        if record.text not in seen:
            seen.add(record.text)
            results.append(record.text)
    return results


def merge_intervals(intervals: list[tuple[int, int]]) -> list[tuple[int, int]]:
    if not intervals:
        return []

    intervals.sort()
    merged = [intervals[0]]

    for start, end in intervals[1:]:
        last_start, last_end = merged[-1]
        if start <= last_end + 1:
            merged[-1] = (last_start, max(last_end, end))
        else:
            merged.append((start, end))

    return merged


def read_cmap_intervals(data: bytes, offset: int, length: int) -> list[tuple[int, int]]:
    end = offset + length
    if end > len(data) or offset + 4 > len(data):
        return []

    subtable_count = read_uint16(data, offset + 2)
    intervals: list[tuple[int, int]] = []
    seen_offsets: set[int] = set()

    for index in range(subtable_count):
        record_offset = offset + 4 + index * 8
        if record_offset + 8 > len(data):
            break

        subtable_relative = read_uint32(data, record_offset + 4)
        subtable_offset = offset + subtable_relative
        if subtable_offset in seen_offsets or subtable_offset + 2 > len(data):
            continue

        seen_offsets.add(subtable_offset)
        fmt = read_uint16(data, subtable_offset)

        if fmt == 4:
            intervals.extend(read_cmap_format_4(data, subtable_offset))
        elif fmt == 12:
            intervals.extend(read_cmap_format_12(data, subtable_offset))

    return merge_intervals(intervals)


def read_cmap_format_4(data: bytes, offset: int) -> list[tuple[int, int]]:
    if offset + 16 > len(data):
        return []

    seg_count = read_uint16(data, offset + 6) // 2
    end_codes_offset = offset + 14
    start_codes_offset = end_codes_offset + seg_count * 2 + 2
    if start_codes_offset + seg_count * 2 > len(data):
        return []

    intervals: list[tuple[int, int]] = []
    for index in range(seg_count):
        start_code = read_uint16(data, start_codes_offset + index * 2)
        end_code = read_uint16(data, end_codes_offset + index * 2)
        if start_code == 0xFFFF and end_code == 0xFFFF:
            continue
        if start_code <= end_code:
            intervals.append((start_code, end_code))

    return intervals


def read_cmap_format_12(data: bytes, offset: int) -> list[tuple[int, int]]:
    if offset + 16 > len(data):
        return []

    group_count = read_uint32(data, offset + 12)
    groups_offset = offset + 16
    intervals: list[tuple[int, int]] = []

    for index in range(group_count):
        group_offset = groups_offset + index * 12
        if group_offset + 12 > len(data):
            break

        start_code = read_uint32(data, group_offset)
        end_code = read_uint32(data, group_offset + 4)
        if start_code <= end_code:
            intervals.append((start_code, end_code))

    return intervals


def has_cjk_coverage(intervals: list[tuple[int, int]]) -> bool:
    for start, end in intervals:
        for cjk_start, cjk_end in CJK_RANGES:
            if start <= cjk_end and end >= cjk_start:
                return True
    return False


def match_illustrator_font(
    postscript_name: str,
    family_style: str,
    full_name: str,
    by_name: dict[str, IllustratorMatch],
    by_family_style: dict[str, IllustratorMatch],
) -> IllustratorMatch | None:
    if postscript_name:
        match = by_name.get(postscript_name.lower())
        if match:
            return match

    for candidate in (family_style, full_name):
        if not candidate:
            continue
        match = by_family_style.get(normalize_text(candidate))
        if match:
            return match

    return None


def parse_font_file(
    path: Path,
    illustrator_by_name: dict[str, IllustratorMatch],
    illustrator_by_family_style: dict[str, IllustratorMatch],
) -> list[FontFace]:
    try:
        data = path.read_bytes()
    except OSError:
        return []

    faces: list[FontFace] = []

    for face_index, face_offset in enumerate(get_face_offsets(data)):
        table_directory = read_table_directory(data, face_offset)
        if "name" not in table_directory or "cmap" not in table_directory:
            continue

        name_offset, name_length = table_directory["name"]
        cmap_offset, cmap_length = table_directory["cmap"]

        records = read_name_records(data, name_offset, name_length)
        intervals = read_cmap_intervals(data, cmap_offset, cmap_length)
        if not records or not intervals or not has_cjk_coverage(intervals):
            continue

        family_names = pick_names(records, 16, 1)
        style_names = pick_names(records, 17, 2)
        full_names = pick_names(records, 4)
        postscript_names = pick_names(records, 6)
        candidate_names = tuple(dict.fromkeys(family_names + full_names))

        family = family_names[0] if family_names else (full_names[0] if full_names else path.stem)
        style = style_names[0] if style_names else "Regular"
        full_name = full_names[0] if full_names else (f"{family} {style}".strip())
        postscript_name = postscript_names[0] if postscript_names else full_name.replace(" ", "")
        family_style = f"{family} {style}".strip()
        display_name = full_name if full_name else family_style

        illustrator_match = match_illustrator_font(
            postscript_name=postscript_name,
            family_style=family_style,
            full_name=full_name,
            by_name=illustrator_by_name,
            by_family_style=illustrator_by_family_style,
        )

        faces.append(
            FontFace(
                file_path=path,
                face_index=face_index,
                family=family,
                style=style,
                full_name=full_name,
                postscript_name=postscript_name,
                display_name=display_name,
                family_style=family_style,
                intervals=intervals,
                name_candidates=candidate_names,
                illustrator_name=illustrator_match.name if illustrator_match else None,
                illustrator_family_style=illustrator_match.family_style if illustrator_match else None,
            )
        )

    return faces


def scan_cjk_fonts() -> list[FontFace]:
    illustrator_by_name, illustrator_by_family_style = parse_illustrator_font_list(ILLUSTRATOR_FONT_LIST)

    scanned: list[FontFace] = []
    seen_keys: set[tuple[str, str, str]] = set()

    for path in iter_font_paths():
        for face in parse_font_file(path, illustrator_by_name, illustrator_by_family_style):
            key = (
                normalize_text(face.illustrator_name or face.postscript_name or face.full_name),
                normalize_text(face.family_style),
                normalize_text(face.display_name),
            )
            if key in seen_keys:
                continue
            seen_keys.add(key)
            scanned.append(face)

    scanned.sort(
        key=lambda face: (
            0 if face.illustrator_name else 1,
            normalize_text(face.family),
            normalize_text(face.style),
            face.face_index,
        )
    )
    return scanned


class FontBrowserApp:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("中文字型預覽工具")
        self.root.geometry("1380x900")

        self.preview_text_var = tk.StringVar(value=DEFAULT_PREVIEW_TEXT)
        self.search_var = tk.StringVar()
        self.only_supported_var = tk.BooleanVar(value=False)
        self.only_illustrator_var = tk.BooleanVar(value=False)
        self.preview_size_var = tk.IntVar(value=22)
        self.summary_var = tk.StringVar(value="準備掃描系統字型...")
        self.status_var = tk.StringVar(value="啟動中...")

        self.all_fonts: list[FontFace] = []
        self.row_frames: list[tk.Widget] = []
        self.refresh_job: str | None = None
        self.tk_families: set[str] = set()

        self._build_ui()
        self.root.after(100, self.load_fonts)

    def _build_ui(self) -> None:
        controls = ttk.Frame(self.root, padding=12)
        controls.pack(fill=tk.X)

        ttk.Label(controls, text="輸入文字").grid(row=0, column=0, sticky="w")
        preview_entry = ttk.Entry(controls, textvariable=self.preview_text_var, width=48)
        preview_entry.grid(row=0, column=1, sticky="ew", padx=(8, 12))
        preview_entry.bind("<KeyRelease>", self.schedule_refresh)

        ttk.Label(controls, text="搜尋字型").grid(row=0, column=2, sticky="w")
        search_entry = ttk.Entry(controls, textvariable=self.search_var, width=28)
        search_entry.grid(row=0, column=3, sticky="ew", padx=(8, 12))
        search_entry.bind("<KeyRelease>", self.schedule_refresh)

        ttk.Label(controls, text="預覽大小").grid(row=0, column=4, sticky="w")
        size_spin = ttk.Spinbox(
            controls,
            from_=12,
            to=72,
            textvariable=self.preview_size_var,
            width=6,
            command=self.refresh_rows,
        )
        size_spin.grid(row=0, column=5, sticky="w", padx=(8, 12))
        size_spin.bind("<KeyRelease>", self.schedule_refresh)

        rescan_button = ttk.Button(controls, text="重新掃描", command=self.load_fonts)
        rescan_button.grid(row=0, column=6, sticky="e")

        ttk.Checkbutton(
            controls,
            text="只顯示完整支援目前文字",
            variable=self.only_supported_var,
            command=self.refresh_rows,
        ).grid(row=1, column=1, sticky="w", pady=(10, 0))

        ttk.Checkbutton(
            controls,
            text="只顯示 Illustrator 可用名稱",
            variable=self.only_illustrator_var,
            command=self.refresh_rows,
        ).grid(row=1, column=3, sticky="w", pady=(10, 0))

        ttk.Label(controls, textvariable=self.summary_var).grid(row=1, column=5, columnspan=2, sticky="e", pady=(10, 0))

        controls.columnconfigure(1, weight=2)
        controls.columnconfigure(3, weight=1)

        container = ttk.Frame(self.root, padding=(12, 0, 12, 0))
        container.pack(fill=tk.BOTH, expand=True)

        self.canvas = tk.Canvas(container, highlightthickness=0, background="#f7f7f7")
        self.scrollbar = ttk.Scrollbar(container, orient=tk.VERTICAL, command=self.canvas.yview)
        self.canvas.configure(yscrollcommand=self.scrollbar.set)

        self.canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        self.list_frame = ttk.Frame(self.canvas)
        self.canvas_window = self.canvas.create_window((0, 0), window=self.list_frame, anchor="nw")

        self.list_frame.bind("<Configure>", self.on_frame_configure)
        self.canvas.bind("<Configure>", self.on_canvas_configure)
        self.canvas.bind_all("<MouseWheel>", self.on_mousewheel)

        status = ttk.Label(self.root, textvariable=self.status_var, padding=12)
        status.pack(fill=tk.X)

    def on_mousewheel(self, event: tk.Event) -> None:
        if self.canvas.winfo_exists():
            self.canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")

    def on_frame_configure(self, _event: tk.Event) -> None:
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))

    def on_canvas_configure(self, event: tk.Event) -> None:
        self.canvas.itemconfigure(self.canvas_window, width=event.width)

    def schedule_refresh(self, _event: tk.Event | None = None) -> None:
        if self.refresh_job:
            self.root.after_cancel(self.refresh_job)
        self.refresh_job = self.root.after(180, self.refresh_rows)

    def load_fonts(self) -> None:
        self.status_var.set("掃描系統字型中，第一次啟動可能會稍慢...")
        self.summary_var.set("掃描中...")
        self.root.update_idletasks()

        self.tk_families = set(tkfont.families(self.root))
        self.all_fonts = scan_cjk_fonts()

        for face in self.all_fonts:
            face.tk_family = self.resolve_tk_family(face)

        self.status_var.set(f"已掃描完成，共找到 {len(self.all_fonts)} 套可顯示中文的字型。")
        self.refresh_rows()

    def resolve_tk_family(self, face: FontFace) -> str:
        for candidate in face.name_candidates:
            if candidate in self.tk_families:
                return candidate
        if face.family in self.tk_families:
            return face.family
        return face.family

    def filtered_fonts(self) -> list[FontFace]:
        preview_text = self.preview_text_var.get().strip() or DEFAULT_PREVIEW_TEXT
        keyword = normalize_text(self.search_var.get())

        results: list[FontFace] = []
        for face in self.all_fonts:
            haystack = normalize_text(
                " | ".join(
                    [
                        face.family,
                        face.style,
                        face.full_name,
                        face.postscript_name,
                        face.illustrator_name or "",
                        face.file_path.name,
                    ]
                )
            )

            if keyword and keyword not in haystack:
                continue
            if self.only_illustrator_var.get() and not face.illustrator_name:
                continue
            if self.only_supported_var.get() and not face.supports_text(preview_text):
                continue
            results.append(face)

        return results

    def refresh_rows(self) -> None:
        self.refresh_job = None
        for widget in self.row_frames:
            widget.destroy()
        self.row_frames.clear()

        preview_text = self.preview_text_var.get().strip() or DEFAULT_PREVIEW_TEXT
        fonts = self.filtered_fonts()
        self.summary_var.set(f"共 {len(self.all_fonts)} 套，顯示 {len(fonts)} 套")

        if not fonts:
            empty = ttk.Label(self.list_frame, text="沒有符合條件的字型。")
            empty.pack(fill=tk.X, pady=24)
            self.row_frames.append(empty)
            self.status_var.set("目前沒有符合條件的字型。")
            return

        preview_size = max(12, min(72, self.preview_size_var.get()))

        for index, face in enumerate(fonts):
            bg = "#ffffff" if index % 2 == 0 else "#f1f5f9"
            row = tk.Frame(self.list_frame, background=bg, highlightbackground="#d8dee9", highlightthickness=1)
            row.pack(fill=tk.X, pady=(0, 8))

            preview_label = tk.Label(
                row,
                text=preview_text,
                font=(face.tk_family or face.family, preview_size),
                anchor="w",
                justify="left",
                background=bg,
                padx=12,
                pady=10,
            )
            preview_label.pack(fill=tk.X)

            meta_1 = tk.Label(
                row,
                text=f"字型名稱: {face.display_name}    家族/樣式: {face.family_style}",
                anchor="w",
                background=bg,
                padx=12,
            )
            meta_1.pack(fill=tk.X)

            illustrator_text = face.illustrator_name or "未在系統字型名稱.txt 內找到對照"
            meta_2 = tk.Label(
                row,
                text=f"Illustrator 名稱: {illustrator_text}    PostScript: {face.postscript_name}",
                anchor="w",
                background=bg,
                padx=12,
                pady=0,
            )
            meta_2.pack(fill=tk.X, pady=(0, 8))

            button_bar = tk.Frame(row, background=bg, padx=12, pady=0)
            button_bar.pack(fill=tk.X, pady=(0, 10))

            copy_target = face.illustrator_name or face.postscript_name or face.family_style
            copy_label = "複製 Illustrator 名稱" if face.illustrator_name else "複製 PostScript 名稱"
            ttk.Button(
                button_bar,
                text=copy_label,
                command=lambda value=copy_target: self.copy_text(value),
            ).pack(side=tk.LEFT)

            ttk.Button(
                button_bar,
                text="複製家族/樣式",
                command=lambda value=face.family_style: self.copy_text(value),
            ).pack(side=tk.LEFT, padx=(8, 0))

            path_label = tk.Label(
                button_bar,
                text=str(face.file_path),
                anchor="w",
                background=bg,
                foreground="#475569",
            )
            path_label.pack(side=tk.LEFT, padx=(16, 0))

            self.row_frames.append(row)

        self.status_var.set(
            "點選按鈕即可把字型名稱放到剪貼簿，再貼到 Illustrator 或你的腳本裡使用。"
        )
        self.canvas.yview_moveto(0)

    def copy_text(self, value: str) -> None:
        self.root.clipboard_clear()
        self.root.clipboard_append(value)
        self.root.update()
        self.status_var.set(f"已複製: {value}")


def print_scan_result(limit: int) -> int:
    fonts = scan_cjk_fonts()
    print(safe_console_text(f"Found {len(fonts)} CJK-capable font faces."))

    for face in fonts[:limit]:
        illustrator_name = face.illustrator_name or "-"
        line = (
            f"{face.family_style} | PS={face.postscript_name} | AI={illustrator_name} | "
            f"FILE={face.file_path.name}"
        )
        print(safe_console_text(line))

    return 0


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Preview installed Chinese fonts on Windows.")
    parser.add_argument(
        "--scan-only",
        action="store_true",
        help="Scan the fonts and print a short summary instead of opening the GUI.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=20,
        help="How many rows to print with --scan-only.",
    )
    return parser.parse_args(argv)


def safe_console_text(text: str) -> str:
    encoding = getattr(sys.stdout, "encoding", None) or "utf-8"
    return text.encode(encoding, errors="backslashreplace").decode(encoding, errors="ignore")


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])

    if args.scan_only:
        return print_scan_result(limit=max(1, args.limit))

    root = tk.Tk()
    FontBrowserApp(root)
    root.mainloop()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
