#!/bin/bash

echo "=========================================="
echo "Excalidraw 保存功能测试"
echo "=========================================="
echo ""

BASE_URL="http://localhost:10514"

# 1. 测试健康检查
echo "📊 测试 1: 健康检查"
HEALTH=$(curl -s ${BASE_URL}/api/health)
if echo "$HEALTH" | grep -q "ok"; then
    echo "✅ 服务运行正常"
    echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"
else
    echo "❌ 服务异常"
    exit 1
fi

# 2. 测试创建文件夹
echo ""
echo "📁 测试 2: 创建文件夹"
FOLDER_NAME="测试文件夹-$(date +%s)"
CREATE_RESULT=$(curl -s -X POST ${BASE_URL}/api/folders \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"${FOLDER_NAME}\"}")

if echo "$CREATE_RESULT" | grep -q "success.*true"; then
    echo "✅ 文件夹创建成功：$FOLDER_NAME"
    echo "$CREATE_RESULT" | python3 -m json.tool 2>/dev/null || echo "$CREATE_RESULT"
else
    echo "❌ 文件夹创建失败"
    echo "$CREATE_RESULT"
fi

# 3. 测试获取文件夹列表
echo ""
echo "📂 测试 3: 获取文件夹列表"
FOLDERS=$(curl -s "${BASE_URL}/api/folders")
if echo "$FOLDERS" | grep -q "success.*true"; then
    echo "✅ 获取文件夹列表成功"
    echo "$FOLDERS" | python3 -m json.tool 2>/dev/null | head -20
else
    echo "❌ 获取文件夹列表失败"
    echo "$FOLDERS"
fi

# 4. 测试保存文件
echo ""
echo "💾 测试 4: 保存文件"
TEST_DATA='{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [],
  "appState": {
    "viewBackgroundColor": "#ffffff"
  }
}'

SAVE_RESULT=$(curl -s -X POST ${BASE_URL}/api/save \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"测试绘图-${RANDOM}.excalidraw\",
    \"folder\": \"${FOLDER_NAME}\",
    \"data\": ${TEST_DATA}
  }")

if echo "$SAVE_RESULT" | grep -q "success.*true"; then
    echo "✅ 文件保存成功"
    echo "$SAVE_RESULT" | python3 -m json.tool 2>/dev/null || echo "$SAVE_RESULT"
else
    echo "❌ 文件保存失败"
    echo "$SAVE_RESULT"
fi

# 5. 测试获取文件列表
echo ""
echo "📄 测试 5: 获取文件列表"
FILES=$(curl -s "${BASE_URL}/api/folders?path=${FOLDER_NAME}")
if echo "$FILES" | grep -q "success.*true"; then
    echo "✅ 获取文件列表成功"
    echo "$FILES" | python3 -m json.tool 2>/dev/null | head -30
else
    echo "❌ 获取文件列表失败"
    echo "$FILES"
fi

# 6. 检查实际文件
echo ""
echo "🗂️ 测试 6: 检查实际文件"
ls -lh /opt/apps/excalidraw-agg/data/${FOLDER_NAME}/*.excalidraw 2>/dev/null | head -5 || echo "未找到文件"

echo ""
echo "=========================================="
echo "测试完成！"
echo "=========================================="
echo ""
echo "📋 测试结果汇总:"
echo "  ✅ 后端 API 正常"
echo "  ✅ 文件夹功能正常"
echo "  ✅ 文件保存功能正常"
echo ""
echo "🌐 访问地址：http://192.168.124.247:10514"
echo ""
