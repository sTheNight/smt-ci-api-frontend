import { useEffect, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type GithubArtifact } from '@/models'
import { API_URL, getLatestBuild } from '@/services/api'
import { useState } from 'react'
import { toast } from 'sonner'
import { motion } from "motion/react"
import {
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenu,
    DropdownMenuGroup,
    DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { DownloadIcon, HistoryIcon, RefreshCwIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useNavigate } from 'react-router'
import { AnimatePresence } from "motion/react"
import { ArtifactInfoDialog } from '@/components/AtrifactInfoDialog'

type MainPageState = "error" | "success" | "loading" | "empty";
export function MainPage() {
    const [loading, setLoading] = useState(true)
    const [artifact, setArtifact] = useState<GithubArtifact | null>(null)
    const [error, setError] = useState<string | null>(null)

    const state = useMemo<MainPageState>(() => {
        if (loading) return "loading";
        if (error) return "error";
        return "success";
    }, [loading, error]);

    let content: React.ReactNode;
    function fetchLatestBuild() {
        setLoading(true)
        getLatestBuild().then((data) => {
            setArtifact(data.data)
        }).catch((err) => {
            toast.error('获取最新构建失败')
            setError(err.message || '未知错误')
        }).finally(() => {
            setLoading(false)
        })
        return () => {
            setArtifact(null)
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchLatestBuild()
    }, [])

    if (state == "loading") {
        content = (
            <LoadingTips />
        )
    } else if (state == "error") {
        content = (
            <NullOrErrorTip fetchLatestBuild={fetchLatestBuild} error={error!} />
        )
    } else {
        content = (
            <LatestBuildInfo artifact={artifact} fetchLatestBuild={fetchLatestBuild} />
        )
    }

    return (
        <div className='h-dvh w-full box-border flex items-center justify-center p-8'>
            <AnimatePresence initial={false} mode='wait'>
                <motion.div
                    key={state}
                    className='box-border h-full w-full max-w-2xl flex items-center justify-center flex-col'
                    initial={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    animate={{ transition: { duration: 0.1, ease: "easeInOut" }, opacity: 1 }}>
                    {content}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

interface NullOrErrorTipProps {
    error: string,
    fetchLatestBuild: () => void
}
function NullOrErrorTip({ error, fetchLatestBuild }: NullOrErrorTipProps) {
    return (
        <>
            <div className='h-dvh w-full box-border flex items-center justify-center p-8'>
                <div className='box-border h-full w-full max-w-2xl flex items-center justify-center flex-col'>
                    {error ? (
                        <div className='text-sm text-red-500 mt-4'>出现错误：{error}</div>
                    ) : (
                        <div className='text-sm text-gray-500 mt-4'>暂无构建信息</div>
                    )}
                    <Button variant='outline' size='lg' className='shrink-0 mt-4' onClick={fetchLatestBuild}>
                        点击重试
                    </Button>
                </div>
            </div>
        </>
    )
}

function LoadingTips() {
    return (
        <div className='h-dvh w-full box-border flex items-center justify-center p-8'>
            <div className='box-border h-full w-full max-w-2xl flex items-center justify-center flex-col'>
                <div className='text-sm text-gray-500 mt-4'>正在获取最新构建信息...</div>
            </div>
        </div>
    )
}

interface LatestBuildInfoProps {
    artifact: GithubArtifact | null,
    fetchLatestBuild: () => void
}
function LatestBuildInfo({ artifact, fetchLatestBuild }: LatestBuildInfoProps) {
    return (
        <>
            <div className='text-2xl flex justify-between items-center w-full'>
                <h2 className='m-0 p-0 tracking-wide font-medium h-full align-middle truncate'>SFS-MobileTools</h2>
                <div className='flex gap-1 items-center h-full'>
                    <GithubDropdownMenu />
                    <AboutDialog />
                </div>
            </div>
            <div className='font-semibold text-muted-foreground w-full text-xs mt-16'>Latest Build</div>
            <div className='h-px w-full bg-gray-200 my-4'></div>
            <div className='box-border w-full'>
                <div className='flex w-full justify-between items-center'>
                    <div>
                        <h1 className='text-3xl font-bold m-0 p-0'>{artifact?.name}</h1>
                        <p className='text-sm text-muted-foreground'>#{artifact?.id}</p>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Badge variant={artifact?.expired ? 'unavaliable' : 'avaliable'} className='cursor-pointer'>
                                {artifact?.expired ? '不可用' : '可用'}
                            </Badge>
                        </DialogTrigger>
                        <ArtifactInfoDialog artifact={artifact!} />
                    </Dialog>
                </div>
            </div>
            <div className='w-full mt-6'>
                <div className='grid grid-cols-2 border border-gray-200'>
                    {[
                        { label: '分支', value: artifact?.workflow_run.head_branch },
                        { label: '提交', value: artifact?.workflow_run.head_sha?.slice(0, 7), mono: true },
                        { label: '构建时间', value: new Date(artifact?.created_at || '').toLocaleString() },
                        { label: '文件大小', value: `${((artifact?.size_in_bytes ?? 0) / 1024 / 1024).toFixed(2)} MB` },
                    ].map((item, i) => (
                        <div
                            key={item.label}
                            className={`p-5 ${i % 2 === 0 ? 'border-r border-gray-200' : ''} ${i < 2 ? 'border-b border-gray-200' : ''}`}
                        >
                            <div className='text-[9px] font-semibold uppercase tracking-[1.5px] text-muted-foreground'>
                                {item.label}
                            </div>
                            <div className={`mt-1.5 text-sm font-medium text-muted-foreground ${item.mono ? 'font-mono text-xs' : ''}`}>
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <ActionButtonGroup artifact={artifact} fetchLatestBuild={fetchLatestBuild} />
        </>
    )
}

function GithubDropdownMenu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className='text-muted-foreground'>Github</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => window.open("https://github.com/youfeng11/SFS-MobileTools")}>
                        SFS-MobileTools
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open("https://github.com/sTheNight/SFS-MobileTools-CI-rs")}>
                        API Service
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function AboutDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" className='text-muted-foreground'>关于</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>About</DialogTitle>
                    <DialogDescription>
                        SFS-MobileTools 由<Button variant='link' onClick={() => window.open("https://github.com/youfeng11")}>youfeng11</Button>开发<br />
                        此页面由<Button variant='link' onClick={() => window.open("https://github.com/sTheNight")}>重鉻酸鈉</Button>开发<br />
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

interface ActionButtonGrupProps {
    artifact: GithubArtifact | null,
    fetchLatestBuild: () => void
}
function ActionButtonGroup({ artifact, fetchLatestBuild }: ActionButtonGrupProps) {
    const navigate = useNavigate()
    return (
        <div className='w-full mt-6 flex items-center gap-2'>
            <Button className='flex-1' size='lg' disabled={artifact?.expired} onClick={() => window.open(`${API_URL}/artifact/${artifact?.id}`)}>
                <DownloadIcon />下载
            </Button>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant='outline' size='lg' className='shrink-0' onClick={() => navigate("/history")}>
                        <HistoryIcon />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>历史构建</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant='outline' size='lg' className='shrink-0' onClick={(fetchLatestBuild)}>
                        <RefreshCwIcon />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>刷新</p>
                </TooltipContent>
            </Tooltip>
        </div>
    )
}