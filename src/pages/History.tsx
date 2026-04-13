import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { HistoryArtifact } from "@/models";
import { API_URL, getHistoryBuild, MAX_HISTORY_ITEM_NUM } from "@/services/api";
import { ChevronLeft, DownloadIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
} from "@/components/ui/pagination";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function HistoryPage() {
    type HistoryPageState = "loading" | "error" | "empty" | "success"

    const navigate = useNavigate();

    const [pageNum, setPageNum] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [historyArtifact, setHistoryArtifact] =
        useState<HistoryArtifact | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null)

    const state = useMemo<HistoryPageState>(() => {
        if (loading) return "loading"
        else if (error) return "error"
        else if (!historyArtifact?.artifacts || historyArtifact.artifacts.length == 0) return "empty"
        else return "success"
    }, [loading, error, historyArtifact])

    let content: React.ReactNode;

    switch (state) {
        case "empty":
            content = (
                <CommonTip>
                    <p>暂无历史构建信息</p>
                </CommonTip>
            )
            break;
        case "loading":
            content = (
                <CommonTip>
                    <p>加载中...</p>
                </CommonTip>
            )
            break;
        case "error":
            content = (
                <CommonTip>
                    <p>获取历史构建信息失败</p>
                    <p>{error}</p>
                </CommonTip>
            )
            break;
        case "success":
            content = (
                <HistoryBuildList historyArtifact={historyArtifact!} />
            )
            break;
    }

    function fetchHistoryBuild(page: number = 1) {
        setLoading(true);

        getHistoryBuild(page)
            .then((data) => {
                const historyBuild: HistoryArtifact = data.data;
                setPageNum(
                    Math.ceil(historyBuild.total_count / MAX_HISTORY_ITEM_NUM)
                );
                setHistoryArtifact(historyBuild);
            })
            .catch((err) => {
                setError(err.message)
            })
            .finally(() => {
                setLoading(false);
            });
    }

    useEffect(() => {
        fetchHistoryBuild(currentPage);
    }, [currentPage]);

    function getPaginationRange(current: number, total: number) {
        const delta = 1;
        const range: (number | "...")[] = [];
        const left = Math.max(2, current - delta);
        const right = Math.min(total - 1, current + delta);
        range.push(1);
        if (left > 2) {
            range.push("...");
        }
        for (let i = left; i <= right; i++) {
            range.push(i);
        }
        if (right < total - 1) {
            range.push("...");
        }
        if (total > 1) {
            range.push(total);
        }
        return range;
    }

    const pages = getPaginationRange(currentPage, pageNum);

    return (
        <div className="h-dvh w-full box-border p-6 flex justify-center">
            <div className="w-full max-w-3xl flex flex-col">
                <div className="flex items-center">
                    <Button variant="ghost" onClick={() => navigate("/")}>
                        <ChevronLeft />
                        返回
                    </Button>
                </div>

                <h1 className="text-2xl m-0 p-0 tracking-wide font-medium">
                    History Build
                </h1>
                <AnimatePresence initial={false} mode="wait">
                    <motion.div className="mt-4 flex-1"
                        key={state}
                        initial={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        animate={{ transition: { duration: 0.1, ease: "easeInOut" }, opacity: 1 }}>
                        {content}
                    </motion.div>
                </AnimatePresence>

                {pageNum > 1 && (
                    <Pagination className="mt-6">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => {
                                        if (currentPage > 1) {
                                            setCurrentPage((p) => p - 1);
                                        }
                                    }}
                                    className={
                                        currentPage === 1
                                            ? "pointer-events-none opacity-50"
                                            : ""
                                    }
                                />
                            </PaginationItem>

                            {pages.map((page, index) => (
                                <PaginationItem key={index}>
                                    {page === "..." ? (
                                        <PaginationEllipsis />
                                    ) : (
                                        <PaginationLink
                                            isActive={page === currentPage}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </PaginationLink>
                                    )}
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => {
                                        if (currentPage < pageNum) {
                                            setCurrentPage((p) => p + 1);
                                        }
                                    }}
                                    className={
                                        currentPage === pageNum
                                            ? "pointer-events-none opacity-50"
                                            : ""
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </div>
    );
}
interface HistoryBuildListProps {
    historyArtifact: HistoryArtifact
}
function HistoryBuildList({ historyArtifact }: HistoryBuildListProps) {
    return (
        <div className="flex flex-col gap-3">
            {historyArtifact.artifacts.map((item) => (
                <div
                    key={item.id}
                    className="grid grid-cols-[80px_1fr_1fr_auto_auto] items-center gap-4 px-4 py-3 border rounded-xl transition hover:bg-muted/50"
                >
                    <div className="text-sm text-muted-foreground truncate">
                        #{item.id}
                    </div>

                    <div className="font-medium truncate">
                        {item.name}
                    </div>

                    <div className="text-sm text-muted-foreground truncate">
                        {item.workflow_run.head_branch}
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Badge
                                variant={item.expired ? "unavaliable" : "avaliable"}
                                className="cursor-pointer"
                            >
                                {item.expired ? "不可用" : "可用"}
                            </Badge>
                        </PopoverTrigger>

                        <PopoverContent>
                            <div className="flex flex-col gap-3 text-sm">
                                <div className="font-medium truncate">{item.name}</div>

                                <div className="flex justify-between text-muted-foreground">
                                    <span>Create at</span>
                                    <span className="font-mono truncate max-w-1/2">{getFormateDate(new Date(item.created_at))}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Updata at</span>
                                    <span className="font-mono truncate max-w-1/2">{getFormateDate(new Date(item.updated_at))}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Expires at</span>
                                    <span className="font-mono truncate max-w-1/2">{getFormateDate(new Date(item.expires_at))}</span>
                                </div>

                                <div className="flex justify-between text-muted-foreground">
                                    <span>Commit</span>
                                    <span className="font-mono truncate max-w-1/2">
                                        {item.workflow_run.head_sha.slice(0, 7)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Digest</span>
                                    <span className="font-mono truncate max-w-1/2 cursor-pointer" onClick={() => {
                                        if (!item.digest) {
                                            toast.error("Digest is null or undefined")
                                            return
                                        }
                                        copyToClipboard(item.digest)?.then(() => {
                                            toast.info("复制成功")
                                        }).catch(e => {
                                            toast.error(`复制失败：${e.message}`)
                                        })
                                    }}>
                                        {item.digest}
                                    </span>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button
                        size="icon"
                        variant="ghost"
                        disabled={item.expired}
                        onClick={() => {
                            if (item.expired) {
                                toast.error("此项目已过期");
                            } else {
                                window.open(
                                    `${API_URL}/artifact/${item.id}`
                                );
                            }
                        }}
                    >
                        <DownloadIcon className="w-4 h-4" />
                    </Button>
                </div>
            ))}
        </div>
    )
}
interface CommonTipProps {
    children: React.ReactNode
}
function CommonTip({ children }: CommonTipProps) {
    return (
        <div className="w-full h-full flex items-center justify-center box-border text-sm text-gray-500">
            {children}
        </div>
    )
}

function getFormateDate(date: Date) {
    return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`
}

function copyToClipboard(text: string) {
    if (!text) return;
    return navigator.clipboard.writeText(text)
}