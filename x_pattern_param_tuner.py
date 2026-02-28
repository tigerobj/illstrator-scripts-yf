#!/usr/bin/env python3
"""Parameter tuner for white X pattern generation.

Desktop GUI (Tkinter + Matplotlib) with sliders + editable numeric fields.
Click "產生圖形" to preview pattern and verify parameter values.
"""

from __future__ import annotations

import math
import random
import tkinter as tk
from dataclasses import dataclass
from tkinter import ttk

import matplotlib
matplotlib.use("TkAgg")
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure


@dataclass
class Params:
    min_radius: int = 2
    max_radius: int = 5
    spacing: float = 1.55
    spread: float = 4.8
    jitter: float = 0.02


def equation_cells(eq_type: int, r: int) -> list[tuple[int, int]]:
    cells: list[tuple[int, int]] = []
    rr = r * r

    for y in range(-r, r + 1):
        for x in range(-r, r + 1):
            ax = abs(x)
            ay = abs(y)
            d2 = x * x + y * y
            on = False

            if eq_type == 0:
                man = ax + ay
                on = abs(man - r) <= 1 or (ax <= 1 and ay <= r - 1) or (ay <= 1 and ax <= r - 1)
            elif eq_type == 1:
                on = d2 <= rr and d2 >= max(1, int(rr * 0.46))
                if (ax <= 1 and ay <= r + 1) or (ay <= 1 and ax <= r + 1):
                    on = True
            elif eq_type == 2:
                th = math.atan2(y, x)
                rad = math.sqrt(d2) / max(1, r)
                rose = 0.56 + 0.33 * math.cos(4 * th)
                on = rose * 0.72 <= rad <= rose
            elif eq_type == 3:
                on = (ax <= 1 or ay <= 1 or abs(ax - ay) <= 1) and max(ax, ay) <= r
                on = on and (d2 >= max(1, int(rr * 0.06)))
            elif eq_type == 4:
                nx = x / max(1, r)
                ny = y / max(1, r)
                heart = (nx * nx + ny * ny - 1) ** 3 - nx * nx * ny * ny * ny
                on = -0.32 <= heart <= 0.18
            elif eq_type == 5:
                m = max(ax, ay)
                on = (m <= r and m >= max(1, r - 2) and ((x + y) % 2 == 0)) or (
                    (ax <= 1 or ay <= 1) and m <= r
                )
            else:
                md = ax + ay
                on = md <= r and ((x + y) % 2 == 0)
                if md <= 1:
                    on = True

            if on:
                cells.append((x, y))

    return cells


def remove_isolated(cells: list[tuple[int, int]], min_neighbors: int = 1) -> list[tuple[int, int]]:
    s = set(cells)
    kept: list[tuple[int, int]] = []
    for x, y in cells:
        n = 0
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                if dx == 0 and dy == 0:
                    continue
                if (x + dx, y + dy) in s:
                    n += 1
        if n >= min_neighbors:
            kept.append((x, y))
    return kept


def close_gaps(cells: list[tuple[int, int]], max_radius: int, min_neighbors_to_fill: int = 5) -> list[tuple[int, int]]:
    s = set(cells)
    r2 = max_radius * max_radius
    out = set(cells)

    for y in range(-max_radius, max_radius + 1):
        for x in range(-max_radius, max_radius + 1):
            if (x, y) in s or (x * x + y * y > r2):
                continue
            n = 0
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    if dx == 0 and dy == 0:
                        continue
                    if (x + dx, y + dy) in s:
                        n += 1
            if n >= min_neighbors_to_fill:
                out.add((x, y))

    return list(out)


def clamp_radius(cells: list[tuple[int, int]], max_radius: int) -> list[tuple[int, int]]:
    r2 = max_radius * max_radius
    return [(x, y) for x, y in cells if x * x + y * y <= r2]


def generate_points(params: Params, batch_count: int = 20, seed: int | None = None) -> tuple[list[float], list[float]]:
    rnd = random.Random(seed)

    cols = math.ceil(math.sqrt(batch_count))
    rows = math.ceil(batch_count / cols)
    center_gap = params.spread * 10.0

    xs: list[float] = []
    ys: list[float] = []

    for i in range(batch_count):
        row = i // cols
        col = i % cols
        cx = (col - (cols - 1) / 2.0) * center_gap + rnd.uniform(-center_gap * 0.22, center_gap * 0.22)
        cy = ((rows - 1) / 2.0 - row) * center_gap + rnd.uniform(-center_gap * 0.22, center_gap * 0.22)

        radius = rnd.randint(params.min_radius, params.max_radius)
        eq_type = rnd.randint(0, 6)

        cells = equation_cells(eq_type, radius)
        cells = remove_isolated(cells, 1)
        cells = close_gaps(cells, radius + 1, 5)
        cells = remove_isolated(cells, 1)
        cells = clamp_radius(cells, radius + 1)

        for gx, gy in cells:
            px = cx + gx * params.spacing + rnd.uniform(-params.spacing * params.jitter, params.spacing * params.jitter)
            py = cy + gy * params.spacing + rnd.uniform(-params.spacing * params.jitter, params.spacing * params.jitter)
            xs.append(px)
            ys.append(py)

    return xs, ys


class App:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("白色X圖樣 參數調整器")

        self.vars = {
            "min_radius": tk.DoubleVar(value=2),
            "max_radius": tk.DoubleVar(value=5),
            "spacing": tk.DoubleVar(value=1.55),
            "spread": tk.DoubleVar(value=4.8),
            "jitter": tk.DoubleVar(value=0.02),
        }

        control = ttk.Frame(root)
        control.pack(side=tk.LEFT, fill=tk.Y, padx=10, pady=10)

        self._build_slider(control, "每個圖案最小半徑（格數）", "min_radius", 1, 10, 1)
        self._build_slider(control, "每個圖案最大半徑（格數）", "max_radius", 2, 12, 1)
        self._build_slider(control, "X 間距倍率", "spacing", 0.8, 3.0, 0.01)
        self._build_slider(control, "圖案中心分散倍率", "spread", 1.5, 10.0, 0.01)
        self._build_slider(control, "抖動比例", "jitter", 0.0, 0.3, 0.001)

        btn = ttk.Button(control, text="產生圖形", command=self.generate)
        btn.pack(fill=tk.X, pady=(12, 4))

        self.info = ttk.Label(control, text="")
        self.info.pack(fill=tk.X)

        fig = Figure(figsize=(8, 6), dpi=100)
        self.ax = fig.add_subplot(111)
        self.ax.set_facecolor("#606060")
        fig.patch.set_facecolor("#606060")

        self.canvas = FigureCanvasTkAgg(fig, master=root)
        self.canvas.get_tk_widget().pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

        self.generate()

    def _build_slider(self, parent: ttk.Frame, label: str, key: str, minimum: float, maximum: float, step: float) -> None:
        ttk.Label(parent, text=label).pack(anchor="w")
        row = ttk.Frame(parent)
        row.pack(fill=tk.X, pady=(0, 8))

        scale = tk.Scale(
            row,
            from_=minimum,
            to=maximum,
            orient=tk.HORIZONTAL,
            resolution=step,
            variable=self.vars[key],
            length=220,
            showvalue=False,
            command=lambda _v, k=key: self._sync_entry(k),
        )
        scale.pack(side=tk.LEFT)

        entry = ttk.Entry(row, width=8)
        entry.pack(side=tk.LEFT, padx=6)
        entry.insert(0, str(self.vars[key].get()))

        def on_return(_event: tk.Event, k: str = key, e: ttk.Entry = entry, lo: float = minimum, hi: float = maximum) -> None:
            try:
                v = float(e.get())
            except ValueError:
                self._sync_entry(k, e)
                return
            v = max(lo, min(hi, v))
            self.vars[k].set(v)
            self._sync_entry(k, e)

        entry.bind("<Return>", on_return)
        entry.bind("<FocusOut>", on_return)
        setattr(self, f"entry_{key}", entry)

    def _sync_entry(self, key: str, entry: ttk.Entry | None = None) -> None:
        e = entry if entry else getattr(self, f"entry_{key}")
        e.delete(0, tk.END)
        v = self.vars[key].get()
        if key in ("min_radius", "max_radius"):
            e.insert(0, str(int(round(v))))
        else:
            e.insert(0, f"{v:.3f}".rstrip("0").rstrip("."))

    def generate(self) -> None:
        p = Params(
            min_radius=int(round(self.vars["min_radius"].get())),
            max_radius=int(round(self.vars["max_radius"].get())),
            spacing=float(self.vars["spacing"].get()),
            spread=float(self.vars["spread"].get()),
            jitter=float(self.vars["jitter"].get()),
        )
        if p.max_radius < p.min_radius:
            p.max_radius = p.min_radius
            self.vars["max_radius"].set(p.max_radius)
            self._sync_entry("max_radius")

        xs, ys = generate_points(p, batch_count=20)

        self.ax.clear()
        self.ax.set_facecolor("#606060")
        self.ax.scatter(xs, ys, marker="x", s=22, linewidths=1.4, c="white")
        self.ax.set_aspect("equal", adjustable="datalim")
        self.ax.set_xticks([])
        self.ax.set_yticks([])
        for spine in self.ax.spines.values():
            spine.set_visible(False)

        self.info.config(
            text=(
                f"min={p.min_radius}, max={p.max_radius}, spacing={p.spacing:.3f}, "
                f"spread={p.spread:.3f}, jitter={p.jitter:.3f}"
            )
        )
        self.canvas.draw_idle()


def main() -> None:
    root = tk.Tk()
    App(root)
    root.mainloop()


if __name__ == "__main__":
    main()
