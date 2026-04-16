import type { GithubArtifact } from "@/models"
import { DialogContent, DialogDescription, DialogTitle } from "./ui/dialog"
import { toast } from "sonner"

export interface ArtifactInfoDialogProps {
    artifact: GithubArtifact
}

export function ArtifactInfoDialog({ artifact }: ArtifactInfoDialogProps) {
    const artifactInfos = artifactToList(artifact)

    return (
        <DialogContent className="max-w-lg w-full">
            <DialogTitle className="truncate">
                {artifact.name}
            </DialogTitle>

            <DialogDescription>
                <div className="w-full grid grid-cols-[1fr_1fr] gap-x-3 gap-y-1 overflow-hidden">
                    {artifactInfos.map((item, index) => (
                        <div key={index} className="contents">
                            <span className="min-w-0 truncate text-muted-foreground">
                                {item.name}
                            </span>
                            <span
                                className="min-w-0 truncate text-right font-mono cursor-pointer hover:underline"
                                onClick={() => {
                                    copyToClipboard(String(item.value))?.then(() => {
                                        toast.success("Copied")
                                    }).catch(() => {
                                        toast.error("Copy failed")
                                    })
                                }}
                            >
                                {String(item.value)}
                            </span>
                        </div>
                    ))}
                </div>
            </DialogDescription>
        </DialogContent>
    )
}

interface ArtifactInfoItem {
    name: string
    value: string | number | boolean
}

function artifactToList(artifact: GithubArtifact): ArtifactInfoItem[] {
    return [
        {
            name: "ID",
            value: artifact.id,
        },
        {
            name: "Created",
            value: getFormateDate(artifact.created_at),
        },
        {
            name: "Updated",
            value: getFormateDate(artifact.updated_at),
        },
        {
            name: "Expires",
            value: getFormateDate(artifact.expires_at),
        },
        {
            name: "Branch",
            value: artifact.workflow_run.head_branch,
        },
        {
            name: "Commit",
            value: artifact.workflow_run.head_sha.slice(0, 7),
        },
        {
            name: "Size",
            value: `${((artifact?.size_in_bytes ?? 0) / 1024 / 1024).toFixed(2)} MB`,
        },
        {
            name: "Digest",
            value: artifact.digest ?? "null",
        },
    ]
}

function getFormateDate(date: string | number | Date) {
    const d = new Date(date)
    if (isNaN(d.getTime())) return "Invalid Date"

    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")

    return `${y}/${m}/${day}`
}

function copyToClipboard(text: string) {
    if (!text) return
    return navigator.clipboard.writeText(text)
}