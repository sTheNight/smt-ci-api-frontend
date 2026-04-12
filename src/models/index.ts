export interface WorkflowRun {
    id: number;
    repository_id: number;
    head_repository_id: number;
    head_branch: string;
    head_sha: string;
}

export interface GithubArtifact {
    id: number;
    node_id: string;
    name: string;
    size_in_bytes: number;
    url: string;
    archive_download_url: string;
    expired: boolean;
    digest?: string | null;
    created_at: Date;
    updated_at: Date;
    expires_at: Date;
    workflow_run: WorkflowRun;
}

export interface HistoryArtifact {
    artifacts: GithubArtifact[],
    total_count: number
}