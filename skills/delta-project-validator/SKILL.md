---
name: delta-project-validator
description: 「projectをvalidateして」「delta validatorを回して」「コードサイズを確認して」などの依頼で使用。delta/plan/archive 整合性とコードサイズ閾値を検証し、不良を後工程へ流さない。
---

# Delta Project Validator

## 目的
- `docs/plan.md` と `docs/delta/*.md` の整合性を確認する。
- 通常のソースコードが 500 / 800 / 1000 行ルールを超えていないか確認する。
- validator 用 script を skill の所有物として扱い、project 直下に雑多な script を生やさない。

## 所有物
- `scripts/validate_delta_links.js`
- `scripts/check_code_size.js`

これらは **この skill の所有物** であり、project bootstrap の一部ではない。

## 使う場面
- `delta verify`
- `review delta`
- archive 前の整合性確認
- 長大コードの検出

## 実行手順
1. `scripts/validate_delta_links.js --dir <projectDir>` を実行する。
2. `scripts/check_code_size.js --dir <projectDir>` を実行する。
3. FAIL や WARN を要約して返す。

## 判定ルール
- `validate_delta_links.js`
  - plan current/archive と delta archive PASS の整合を確認する。
- `check_code_size.js`
  - 500 行超: review 対象
  - 800 行超: 分割対象
  - 1000 行超: 例外扱い

## 出力
- validator ごとの結果
- 主な FAIL / WARN
- 必要な follow-up

