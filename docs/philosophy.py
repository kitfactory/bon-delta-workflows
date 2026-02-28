#!/usr/bin/env python3
"""Delta-first philosophy reference (JA/EN).

This file is intentionally Python so the document can be rendered by language:
  python3 docs/philosophy.py --lang ja
  python3 docs/philosophy.py --lang en
  python3 docs/philosophy.py --lang both
"""

from __future__ import annotations

import argparse
from textwrap import dedent


PHILOSOPHY_JA = dedent(
    """
    # bon Philosophy (日本語)

    ## 目的
    - 大きな要求でも、最小差分の連続で安全に価値を届ける。
    - 変更時に実装と文書が拡散しないよう、delta を唯一の実行単位にする。

    ## 原則
    1. Delta-first
       - すべての要件は `delta request -> delta apply -> delta verify -> delta archive` で処理する。
    2. 最小差分
       - Delta は「小さく閉じる」。1件の要求で複数の unrelated 変更を混ぜない。
    3. 正本保護
       - 正本（`concept/spec/architecture/plan`）は `delta-archive=PASS` の差分のみ同期する。
    4. 境界維持
       - 文書スキルは正本整備用。要求実行は delta スキルで行う。
    5. 依存方向
       - 設計の依存方向は外→内（Adapter/Infrastructure -> UseCase -> Domain）に固定する。
    6. 優先順位
       - 衝突時は `spec.md > architecture.md > OVERVIEW/AGENTS > design-assist-guide` を優先する。
    7. 可観測性
       - 主要判断は根拠付きで残し、`plan <-> delta <-> archive` の整合を検証する。

    ## 実務ルール
    - `docs/plan.md` の実装アイテム1件を、`delta request` 1件の seed として扱う（原則1:1）。
    - 大きい実装アイテムは 1:N の delta に分割して順次処理する。
    - delta 記録は `docs/delta/*.md` を正本とし、JSON/YAML の副管理を要求しない。
    - 検証は `node scripts/validate_delta_links.js --dir .` を実行する。

    ## 成功条件
    - 変更理由、受入条件、実装、検証、確定履歴が Delta ID で追跡できる。
    - 仕様追加や設計変更が入っても、責務混在や過剰設計を増やさない。
    """
).strip() + "\n"


PHILOSOPHY_EN = dedent(
    """
    # bon Philosophy (English)

    ## Goal
    - Deliver value safely, even for large requests, as a sequence of minimal deltas.
    - Prevent implementation and documentation drift by treating delta as the only execution unit.

    ## Principles
    1. Delta-first
       - Process every requirement via `delta request -> delta apply -> delta verify -> delta archive`.
    2. Minimal delta
       - Keep each delta small and closed; never mix unrelated changes in one delta.
    3. Canonical protection
       - Sync canonical docs (`concept/spec/architecture/plan`) only from `delta-archive=PASS`.
    4. Boundary clarity
       - Document skills maintain canonical docs; delta skills execute requirement changes.
    5. Dependency direction
       - Fix dependency direction outside-in (Adapter/Infrastructure -> UseCase -> Domain).
    6. Conflict priority
       - Resolve conflicts with `spec.md > architecture.md > OVERVIEW/AGENTS > design-assist-guide`.
    7. Observability
       - Record major decisions with rationale and validate `plan <-> delta <-> archive` consistency.

    ## Working rules
    - Treat one implementation item in `docs/plan.md` as one delta-request seed (default 1:1).
    - If an item is too large, split it into multiple deltas (1:N) and process sequentially.
    - Keep delta records canonical in `docs/delta/*.md`; do not require JSON/YAML sidecars.
    - Run `node scripts/validate_delta_links.js --dir .` for consistency checks.

    ## Success criteria
    - Rationale, acceptance criteria, implementation, verification, and archive are traceable by Delta ID.
    - Spec additions or design changes do not increase mixed responsibilities or overdesign.
    """
).strip() + "\n"


def get_philosophy(lang: str) -> str:
    """Return philosophy document in Japanese, English, or both."""
    if lang == "ja":
        return PHILOSOPHY_JA
    if lang == "en":
        return PHILOSOPHY_EN
    return f"{PHILOSOPHY_JA}\n{PHILOSOPHY_EN}"


def main() -> None:
    parser = argparse.ArgumentParser(description="Render bon philosophy in JA/EN.")
    parser.add_argument(
        "--lang",
        choices=("ja", "en", "both"),
        default="both",
        help="Language output: ja, en, or both (default).",
    )
    args = parser.parse_args()
    print(get_philosophy(args.lang))


if __name__ == "__main__":
    main()
