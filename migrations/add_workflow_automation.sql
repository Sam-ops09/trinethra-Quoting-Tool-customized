-- Migration: Add Workflow Automation Tables
-- This migration adds comprehensive workflow automation support including
-- workflows, triggers, actions, executions, and schedules

-- Create workflow status enum
DO $$ BEGIN                                                                                     
    CREATE TYPE workflow_status AS ENUM ('active', 'inactive', 'draft');                       
EXCEPTION                                                                                       
    WHEN duplicate_object THEN null;                                                           
END $$;

-- Create workflow trigger type enum
DO $$ BEGIN
    CREATE TYPE workflow_trigger_type AS ENUM (
        'status_change',
        'amount_threshold',
        'date_based',
        'field_change',
        'time_based',
        'manual'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create workflow action type enum
DO $$ BEGIN
    CREATE TYPE workflow_action_type AS ENUM (
        'send_email',
        'create_notification',
        'update_field',
        'assign_user',
        'create_task',
        'escalate',
        'webhook',
        'create_activity_log'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    entity_type TEXT NOT NULL,
    status workflow_status NOT NULL DEFAULT 'draft',
    priority INTEGER NOT NULL DEFAULT 0,
    trigger_logic TEXT DEFAULT 'AND',
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_by VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for workflows
CREATE INDEX IF NOT EXISTS idx_workflows_entity_type ON workflows(entity_type);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);

-- Create workflow_triggers table
CREATE TABLE IF NOT EXISTS workflow_triggers (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id VARCHAR NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    trigger_type workflow_trigger_type NOT NULL,
    conditions JSONB NOT NULL,
    condition_logic TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for workflow_triggers
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_workflow_id ON workflow_triggers(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_type ON workflow_triggers(trigger_type);

-- Create workflow_actions table
CREATE TABLE IF NOT EXISTS workflow_actions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id VARCHAR NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    action_type workflow_action_type NOT NULL,
    action_config JSONB NOT NULL,
    execution_order INTEGER NOT NULL DEFAULT 0,
    delay_minutes INTEGER DEFAULT 0,
    condition_expression TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for workflow_actions
CREATE INDEX IF NOT EXISTS idx_workflow_actions_workflow_id ON workflow_actions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_actions_execution_order ON workflow_actions(execution_order);

-- Create workflow_executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id VARCHAR NOT NULL REFERENCES workflows(id),
    entity_type TEXT NOT NULL,
    entity_id VARCHAR NOT NULL,
    status TEXT NOT NULL,
    triggered_by TEXT NOT NULL,
    triggered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    execution_log JSONB,
    error_message TEXT,
    error_stack TEXT,
    execution_time_ms INTEGER
);

-- Create indexes for workflow_executions
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_entity ON workflow_executions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_triggered_at ON workflow_executions(triggered_at);

-- Create workflow_schedules table
CREATE TABLE IF NOT EXISTS workflow_schedules (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id VARCHAR NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    cron_expression TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for workflow_schedules
CREATE INDEX IF NOT EXISTS idx_workflow_schedules_workflow_id ON workflow_schedules(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_schedules_next_run ON workflow_schedules(next_run_at);

-- Add helpful comments
COMMENT ON TABLE workflows IS 'Main workflow definitions with metadata and configuration';
COMMENT ON TABLE workflow_triggers IS 'Trigger conditions that activate workflows';
COMMENT ON TABLE workflow_actions IS 'Actions to execute when workflow is triggered';
COMMENT ON TABLE workflow_executions IS 'Audit trail of workflow executions with detailed logs';
COMMENT ON TABLE workflow_schedules IS 'Scheduled/recurring workflow execution times';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Workflow automation tables created successfully';
END $$;
