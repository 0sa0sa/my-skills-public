# my-skills

Claude Code 用の自作スキル置き場。

## 構成

```
skills/
  <skill-name>/
    SKILL.md          # スキル本体(frontmatter: name / description)
    (supporting files) # 必要な場合のみ
```

## インストール

### npx(推奨 — clone 不要)

```sh
# 一覧
npx github:0sa0sa/my-skills-public list

# 個別インストール(~/.claude と ~/.codex の存在する方すべてに入る)
npx github:0sa0sa/my-skills-public sonnet-plus codex-plus

# 全部入り / ターゲット指定
npx github:0sa0sa/my-skills-public all
npx github:0sa0sa/my-skills-public codex-plus --codex   # Codex のみ
npx github:0sa0sa/my-skills-public sonnet-plus --claude # Claude Code のみ
```

デフォルトでは、そのマシンに存在するエージェント設定ディレクトリ(`~/.claude` → `~/.claude/skills/`、`~/.codex` → `~/.codex/skills/`)すべてにコピーされる。次のセッションから各エージェントが description を見て自動でロード候補にする。

### 手動コピー

```sh
cp -r skills/finding-unknowns ~/.claude/skills/
```

## スキル一覧

| Skill | 用途 |
|---|---|
| [finding-unknowns](skills/finding-unknowns/SKILL.md) | 曖昧な依頼(「いい感じに」)や不慣れな領域で、unknowns を分類して適切なテクニック(教える/発散プロトタイプ/インタビュー/リファレンス)を選ぶ。長時間の自律実装では逸脱をその場で記録し、マージ前に説明+クイズを提案する |
| [sonnet-plus](skills/sonnet-plus/SKILL.md) | 実装タスクを「Sonnet サブエージェント+検証済み4フェーズ品質ハーネス」で実行する。ブラインド審査5課題で最上位モデル(Fable 5)と同格(3勝2敗・全点差±0.6以内)をコスト56〜84%で達成。深い監査だけは最上位モデルのレビューを併用([実験リポジトリ](https://github.com/0sa0sa/sonnet-plus)) |
| [codex-plus](skills/codex-plus/SKILL.md) | 同じ4フェーズ品質ハーネスの **Codex ネイティブ版**。`~/.codex/skills/` に置けば Codex 単体で起動〜完結(Codex 自身が実装者としてハーネスを自己適用)。外部オーケストレータから `codex exec` で駆動する手順は ORCHESTRATION.md に分離。転移効果は未計測である旨を明記 |

## 運用メモ

- 新しいスキルは superpowers:writing-skills の TDD プロセス(スキルなしでベースライン挙動を観測 → スキルを書く → 再検証)を通してから追加する
- 個人情報・プロジェクト固有の秘匿情報は含めない
