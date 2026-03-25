#!/bin/bash

echo "=========================================="
echo "Excalidraw 保存到服务器功能修复"
echo "=========================================="
echo ""

# 1. 备份原文件
echo "📦 步骤 1: 备份原服务器文件..."
if [ -f /opt/apps/excalidraw-agg/server/server.js ]; then
    cp /opt/apps/excalidraw-agg/server/server.js /opt/apps/excalidraw-agg/server/server.js.bak
    echo "✅ 已备份：server.js.bak"
else
    echo "❌ 原文件不存在"
fi

# 2. 替换为新服务器
echo ""
echo "🔧 步骤 2: 安装新服务器..."
if [ -f /opt/apps/excalidraw-agg/server/server-new.js ]; then
    cp /opt/apps/excalidraw-agg/server/server-new.js /opt/apps/excalidraw-agg/server/server.js
    echo "✅ 已安装新服务器"
else
    echo "❌ 新服务器文件不存在"
    exit 1
fi

# 3. 重启服务
echo ""
echo "🔄 步骤 3: 重启服务..."
pkill -f "excalidraw-agg.*server.js" 2>/dev/null
sleep 2

cd /opt/apps/excalidraw-agg/server
nohup node server.js > /tmp/excalidraw-server.log 2>&1 &
sleep 3

# 4. 验证服务
echo ""
echo "✅ 步骤 4: 验证服务..."
if curl -s http://localhost:10514/api/health | grep -q "ok"; then
    echo "✅ 服务运行正常"
    curl -s http://localhost:10514/api/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:10514/api/health
else
    echo "❌ 服务启动失败，请查看日志："
    tail -20 /tmp/excalidraw-server.log
fi

echo ""
echo "=========================================="
echo "修复完成！"
echo "=========================================="
echo ""
echo "📋 新功能:"
echo "  ✅ 中文错误提示"
echo "  ✅ 更详细的日志"
echo "  ✅ 改进的错误处理"
echo "  ✅ 文件元数据增强"
echo ""
echo "🌐 访问地址：http://192.168.124.247:10514"
echo ""
echo "📝 下一步:"
echo "  1. 刷新浏览器页面"
echo "  2. 测试保存到服务器功能"
echo "  3. 如果 UI 需要更新，请查看 excalidraw-new-ui.js"
echo ""
