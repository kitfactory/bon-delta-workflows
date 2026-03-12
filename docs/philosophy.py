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

    ![Proactive Delta Context の説明図](image/PDC_ja.png)

    ## 問い
    - LLM を使う開発で、過剰生成、文脈の混線、不良の流出、未確定の仕掛かりをどう減らすか。
    - 長時間の AI 支援作業でも、flow を止めずにレビュー可能な状態をどう維持するか。

    ## 定義
    - Proactive Delta Context とは、変更に必要な最小限の差分情報だけを先回りして整え、その差分に閉じた文脈で request/apply/verify/archive を回す運用である。
    - delta は単なる diff ではなく、スコープ、制約、受入条件、検証、確定履歴をまとめる実行単位である。

    ## なぜ必要か
    - 既存コード、既存ドキュメント、過去の plan、過去の会話は、新しい変更要求が入った時点で部分的に古い情報になる。
    - repo 全体をそのまま現在の真実として agent に与えると、古い前提と新しい要求が混ざり、過剰生成や矛盾が起きやすくなる。
    - したがって、実装前に「今回の変更でまだ有効な情報」を選び直し、不足する制約や受入条件を補って delta context を作り出す必要がある。
    - 食い違う情報は隠れた前提にせず、scope / constraint / follow-up delta として表に出す。

    ## 狙い
    - 大きな要求でも、最小差分の連続で安全に価値を届ける。
    - 実装と文書を同じ変更サイクルで同期し、正本の陳腐化を防ぐ。
    - verify を built-in quality のゲートとして使い、不良を後工程へ流さない。
    - archive によって仕掛かり在庫を残さず、次の変更をきれいに始める。

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

    ## リーンとの対応
    - 過剰生産を減らす: 1 delta で扱う範囲を狭く保つ。
    - 手待ちを減らす: request に scope / constraint / acceptance criteria を明示する。
    - 不良流出を防ぐ: verify を apply の直後に置く。
    - 余剰在庫を減らす: PASS した delta だけを archive し、未確定を残さない。
    - 情報分断を減らす: canonical docs を正本にし、delta から同期する。

    ## 実務ルール
    - `docs/plan.md` の実装アイテム1件を、`delta request` 1件の seed として扱う（原則1:1）。
    - 大きい実装アイテムは 1:N の delta に分割して順次処理する。
    - delta 記録は `docs/delta/*.md` を正本とし、JSON/YAML の副管理を要求しない。
    - 検証は `delta-project-validator` skill を使う。
    - 大機能や長時間作業では `REVIEW` delta を節目として挟む。
    - `plan.md` は薄く保ち、archive 詳細は monthly archive に逃がす。

    ## 成功条件
    - 変更理由、受入条件、実装、検証、確定履歴が Delta ID で追跡できる。
    - 仕様追加や設計変更が入っても、責務混在や過剰設計を増やさない。
    - 長時間の AI 支援作業でも、現在地、次の判断、未解決事項が読み取れる。
    """
).strip() + "\n"


PHILOSOPHY_EN = dedent(
    """
    # bon Philosophy (English)

    ![Proactive Delta Context infographic](image/PDC_en.png)

    ## Question
    - In LLM-assisted development, how do we reduce overproduction, context mixing, escaped defects, and unfinished change inventory?
    - How do we keep long-running AI work flowing while still making it reviewable?

    ## Definition
    - Proactive Delta Context is an operating model that prepares the minimum change context in advance and runs request/apply/verify/archive inside that closed scope.
    - A delta is not just a diff. It is the execution unit that carries scope, constraints, acceptance criteria, verification, and closure.

    ## Why it is needed
    - Existing code, docs, past plans, and prior conversation become partially stale as soon as a new change request appears.
    - If an agent treats the whole repository as current truth, old assumptions mix with new intent and produce over-generation, contradiction, and misleading confidence.
    - Therefore the valid context for the current change must be created in advance by selecting still-valid information and adding missing constraints and acceptance criteria.
    - Conflicting information should be surfaced as scope, constraints, or follow-up deltas instead of being left implicit.

    ## Goal
    - Deliver value safely, even for large requests, as a sequence of minimal deltas.
    - Keep implementation and documentation synchronized inside the same change cycle.
    - Treat verify as a built-in quality gate so defects do not flow downstream.
    - Use archive to avoid unfinished change inventory and start the next change cleanly.

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

    ## Lean mapping
    - Reduce overproduction: keep one delta tightly scoped.
    - Reduce waiting: make scope, constraints, and acceptance criteria explicit in request.
    - Prevent defect escape: put verify immediately after apply.
    - Reduce inventory: archive only verified deltas and leave no ambiguous in-flight state.
    - Reduce information fragmentation: treat canonical docs as source of truth and sync them from deltas.

    ## Working rules
    - Treat one implementation item in `docs/plan.md` as one delta-request seed (default 1:1).
    - If an item is too large, split it into multiple deltas (1:N) and process sequentially.
    - Keep delta records canonical in `docs/delta/*.md`; do not require JSON/YAML sidecars.
    - Use the `delta-project-validator` skill for consistency checks.
    - Insert `REVIEW` deltas at meaningful milestones in long-running work.
    - Keep `plan.md` thin and move detailed history into monthly archive files.

    ## Success criteria
    - Rationale, acceptance criteria, implementation, verification, and archive are traceable by Delta ID.
    - Spec additions or design changes do not increase mixed responsibilities or overdesign.
    - Even in long sessions, the current state, next decision, and unresolved items remain readable.
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


