// Excalidraw 保存到服务器 - 全新 UI 组件
// 替换原有的 SaveToServerCard.tsx

// 这个文件是示例代码，实际需要修改 TypeScript 文件

const newSaveToServerCard = `
import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@excalidraw/excalidraw/components/Card";
import { ToolButton } from "@excalidraw/excalidraw/components/ToolButton";
import { Dialog } from "@excalidraw/excalidraw/components/Dialog";
import { Button } from "@excalidraw/excalidraw/components/Button";

import type { NonDeletedExcalidrawElement } from "@excalidraw/element/types";
import type { BinaryFiles, UIAppState } from "@excalidraw/excalidraw/types";

import {
  saveToServer,
  getFolders,
  createFolder,
  type SaveToServerResult,
  type FolderInfo,
  type ServerFile,
} from "../data/serverStorage";

import "./SaveToServerCard.scss";

interface SaveToServerCardProps {
  elements: readonly NonDeletedExcalidrawElement[];
  appState: UIAppState;
  files: BinaryFiles;
}

export const SaveToServerCard: React.FC<SaveToServerCardProps> = ({
  elements,
  appState,
  files,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<SaveToServerResult | null>(null);
  const [filename, setFilename] = useState("");
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [files, setFiles] = useState<ServerFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [viewMode, setViewMode] = useState<"save" | "browse">("save");

  // 加载文件夹和文件列表
  const loadFolders = useCallback(async (path = "") => {
    setIsLoading(true);
    try {
      const result = await getFolders(path);
      if (result.success) {
        setFolders(result.folders || []);
        setFiles(result.files || []);
        setCurrentPath(result.currentPath || "");
      } else {
        setResult({ success: false, error: result.error || "加载失败" });
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message || "加载失败" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 打开对话框时加载数据
  const handleOpenDialog = () => {
    setFilename(appState.name || \`绘图-\${new Date().getTime()}\`);
    setSelectedFolder("");
    setCurrentPath("");
    setResult(null);
    setShowNewFolderInput(false);
    setNewFolderName("");
    setViewMode("save");
    setIsDialogOpen(true);
    loadFolders("");
  };

  const handleCloseDialog = () => {
    if (isSaving) return;
    setIsDialogOpen(false);
    setResult(null);
  };

  const handleSave = async () => {
    if (!filename.trim()) {
      setResult({ success: false, error: "请输入文件名" });
      return;
    }

    setIsSaving(true);
    setResult(null);

    try {
      const saveResult = await saveToServer(
        elements,
        appState,
        files,
        filename.trim(),
        selectedFolder
      );
      setResult(saveResult);

      if (saveResult.success) {
        // 保存成功后刷新文件列表
        await loadFolders(selectedFolder);
        setTimeout(() => {
          setIsDialogOpen(false);
        }, 1500);
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message || "保存失败" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setResult({ success: false, error: "请输入文件夹名称" });
      return;
    }

    setIsCreatingFolder(true);
    try {
      const result = await createFolder(newFolderName.trim(), currentPath);
      if (result.success) {
        await loadFolders(currentPath);
        setShowNewFolderInput(false);
        setNewFolderName("");
        setResult({ success: true, message: "文件夹创建成功" });
      } else {
        setResult({ success: false, error: result.error || "创建失败" });
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message || "创建失败" });
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleNavigateFolder = (folderPath: string) => {
    loadFolders(folderPath);
  };

  const handleBackToParent = () => {
    if (currentPath) {
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf("/"));
      loadFolders(parentPath);
    }
  };

  const handleViewFiles = async () => {
    setViewMode("browse");
    await loadFolders(selectedFolder);
  };

  // 服务器图标
  const ServerIcon = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
      <line x1="6" y1="6" x2="6.01" y2="6"></line>
      <line x1="6" y1="18" x2="6.01" y2="18"></line>
    </svg>
  );

  // 文件夹图标
  const FolderIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
  );

  // 文件图标
  const FileIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
      <polyline points="13 2 13 9 20 9"></polyline>
    </svg>
  );

  // 返回图标
  const BackIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  );

  return (
    <>
      <Card color="primary">
        <div className="Card-icon">{ServerIcon}</div>
        <h2>保存到服务器</h2>
        <div className="Card-details">
          将绘图保存到服务器，支持文件夹管理
        </div>
        <ToolButton
          className="Card-button"
          type="button"
          title="保存到服务器"
          aria-label="保存到服务器"
          showAriaLabel={true}
          onClick={handleOpenDialog}
        />
      </Card>

      {isDialogOpen && (
        <Dialog
          title="保存到服务器"
          onCloseRequest={handleCloseDialog}
          size="large"
          closeOnClickOutside={!isSaving}
        >
          <div className="SaveToServerDialog">
            {/* 模式切换 */}
            <div className="SaveToServerDialog__tabs">
              <button
                className={\`SaveToServerDialog__tab \${viewMode === "save" ? "active" : ""}\`}
                onClick={() => setViewMode("save")}
              >
                💾 保存绘图
              </button>
              <button
                className={\`SaveToServerDialog__tab \${viewMode === "browse" ? "active" : ""}\`}
                onClick={handleViewFiles}
              >
                📁 浏览文件
              </button>
            </div>

            {/* 保存模式 */}
            {viewMode === "save" && (
              <>
                {/* 文件夹选择 */}
                <div className="SaveToServerDialog__section">
                  <label className="SaveToServerDialog__label">
                    选择保存目录 <span className="required">*</span>
                  </label>
                  <div className="SaveToServerDialog__folder-row">
                    <select
                      className="SaveToServerDialog__select"
                      value={selectedFolder}
                      onChange={(e) => setSelectedFolder(e.target.value)}
                      disabled={isSaving || isLoading}
                    >
                      <option value="">根目录</option>
                      {folders.map((folder) => (
                        <option key={folder.path} value={folder.path}>
                          📁 {folder.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="SaveToServerDialog__folder-btn"
                      onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                      disabled={isSaving}
                      title="新建文件夹"
                    >
                      ➕
                    </button>
                  </div>

                  {showNewFolderInput && (
                    <div className="SaveToServerDialog__new-folder">
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="输入文件夹名称..."
                        className="SaveToServerDialog__input"
                        disabled={isCreatingFolder}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleCreateFolder();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="SaveToServerDialog__create-btn"
                        onClick={handleCreateFolder}
                        disabled={isCreatingFolder || !newFolderName.trim()}
                      >
                        {isCreatingFolder ? "创建中..." : "创建"}
                      </button>
                    </div>
                  )}
                </div>

                {/* 文件名 */}
                <div className="SaveToServerDialog__section">
                  <label className="SaveToServerDialog__label">文件名</label>
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    placeholder="输入文件名..."
                    className="SaveToServerDialog__input"
                    disabled={isSaving}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSave();
                      }
                    }}
                  />
                </div>

                {/* 结果提示 */}
                {result && (
                  <div
                    className={\`SaveToServerDialog__result \${
                      result.success
                        ? "SaveToServerDialog__result--success"
                        : "SaveToServerDialog__result--error"
                    }\`}
                  >
                    {result.success ? \`✅ \${result.message}\` : \`❌ \${result.error}\`}
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="SaveToServerDialog__actions">
                  <Button
                    onSelect={handleCloseDialog}
                    onClick={handleCloseDialog}
                    disabled={isSaving}
                  >
                    取消
                  </Button>
                  <Button
                    onSelect={handleSave}
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "⏳ 保存中..." : "💾 保存"}
                  </Button>
                </div>
              </>
            )}

            {/* 浏览模式 */}
            {viewMode === "browse" && (
              <>
                {/* 路径导航 */}
                <div className="SaveToServerDialog__breadcrumb">
                  <button
                    className="SaveToServerDialog__back-btn"
                    onClick={handleBackToParent}
                    disabled={!currentPath}
                    title="返回上级"
                  >
                    {BackIcon}
                  </button>
                  <span className="SaveToServerDialog__path">
                    📁 {currentPath || "根目录"}
                  </span>
                </div>

                {/* 文件列表 */}
                <div className="SaveToServerDialog__file-list">
                  {isLoading ? (
                    <div className="SaveToServerDialog__loading">加载中...</div>
                  ) : folders.length === 0 && files.length === 0 ? (
                    <div className="SaveToServerDialog__empty">
                      📭 此目录为空
                    </div>
                  ) : (
                    <>
                      {/* 文件夹列表 */}
                      {folders.map((folder) => (
                        <div
                          key={folder.path}
                          className="SaveToServerDialog__file-item"
                          onClick={() => handleNavigateFolder(folder.path)}
                        >
                          <span className="SaveToServerDialog__file-icon">
                            {FolderIcon}
                          </span>
                          <span className="SaveToServerDialog__file-name">
                            {folder.name}
                          </span>
                        </div>
                      ))}

                      {/* 文件列表 */}
                      {files.map((file) => (
                        <div
                          key={file.path}
                          className="SaveToServerDialog__file-item"
                        >
                          <span className="SaveToServerDialog__file-icon">
                            {FileIcon}
                          </span>
                          <span className="SaveToServerDialog__file-name">
                            {file.name}
                          </span>
                          <span className="SaveToServerDialog__file-meta">
                            {(file.size / 1024).toFixed(1)} KB · {file.modifiedAtStr}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* 关闭按钮 */}
                <div className="SaveToServerDialog__actions">
                  <Button onSelect={handleCloseDialog} onClick={handleCloseDialog}>
                    关闭
                  </Button>
                </div>
              </>
            )}
          </div>
        </Dialog>
      )}
    </>
  );
};
`;

console.log("新 UI 组件代码已生成，请查看 /opt/apps/excalidraw-agg/excalidraw-new-ui.js");
console.log("需要手动替换 SaveToServerCard.tsx 文件");
