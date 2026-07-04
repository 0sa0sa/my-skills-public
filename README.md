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

スキルを使いたいマシンで、対象ディレクトリを `~/.claude/skills/` にコピーする:

```sh
cp -r skills/finding-unknowns ~/.claude/skills/
```

次のセッションから Claude Code が description を見て自動でロード候補にする。

## スキル一覧

| Skill | 用途 |
|---|---|
| [finding-unknowns](skills/finding-unknowns/SKILL.md) | 曖昧な依頼(「いい感じに」)や不慣れな領域で、unknowns を分類して適切なテクニック(教える/発散プロトタイプ/インタビュー/リファレンス)を選ぶ。長時間の自律実装では逸脱をその場で記録し、マージ前に説明+クイズを提案する |

## 運用メモ

- 新しいスキルは superpowers:writing-skills の TDD プロセス(スキルなしでベースライン挙動を観測 → スキルを書く → 再検証)を通してから追加する
- 個人情報・プロジェクト固有の秘匿情報は含めない
