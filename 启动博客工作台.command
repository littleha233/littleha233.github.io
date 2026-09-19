#!/bin/zsh
set -e
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd -- "${0:A:h}"
if ! command -v node >/dev/null || ! command -v npm >/dev/null; then
  echo "请先安装 Node.js 22 或更新版本。"
  read "?按回车退出"
  exit 1
fi
if [[ ! -d node_modules ]]; then
  npm ci
fi
echo "打开浏览器访问 http://127.0.0.1:4313/"
echo "关闭此终端或按 Ctrl+C 将停止工作台。草稿仍会保留。"
npm run studio
