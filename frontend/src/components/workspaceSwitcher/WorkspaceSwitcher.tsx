import React from 'react';
import type { Workspace } from '../../shared/types/workspace';

interface WorkspaceProps {
    workspaces: Workspace[];
    selectedId?: string;
    onChange: (id: string) => void;
}

const WorkspaceSwitcher: React.FC<WorkspaceProps> = ({workspaces, selectedId, onChange}) => {
    if (workspaces.length === 0) return null;

    return (
        <select
            value={selectedId}
            onChange={(e) => onChange(e.target.value)}
            style={{ marginBottom: 12 }}
        >
            {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                    {ws.name}
                </option>
            ))}
        </select>
    );
};

export default WorkspaceSwitcher;
