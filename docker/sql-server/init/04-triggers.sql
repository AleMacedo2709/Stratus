USE PlanMP;
GO

-- Trigger para atualizar datas de modificação
CREATE TRIGGER TR_UpdateModifiedDate
ON Users, Tasks, AnnualInitiatives, StrategicActions, AnnualActionPlans, Indicators
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(UpdatedAt) RETURN;
    
    UPDATE t
    SET UpdatedAt = GETDATE(),
        UpdatedBy = SYSTEM_USER
    FROM inserted i
    INNER JOIN deleted d ON i.ID = d.ID
    INNER JOIN OBJECT_NAME(@@PROCID) t ON t.ID = i.ID
    WHERE 
        NOT UPDATE(UpdatedAt) 
        AND NOT UPDATE(UpdatedBy);
END;
GO

-- Trigger de auditoria
CREATE TRIGGER TR_Users_Audit ON Users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO AuditLogs (
        TableName,
        RecordID,
        Action,
        OldValues,
        NewValues,
        ModifiedBy,
        ModifiedAt
    )
    SELECT
        'Users',
        i.UserID,
        'UPDATE',
        (SELECT d.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
        (SELECT i.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
        SYSTEM_USER,
        GETDATE()
    FROM inserted i
    INNER JOIN deleted d ON i.UserID = d.UserID;
END;
GO

-- Triggers para logs de progresso
CREATE TRIGGER TR_Tasks_Progress ON Tasks
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(Progress) OR UPDATE(Status)
    BEGIN
        INSERT INTO TaskProgressLog (
            TaskID,
            OldProgress,
            NewProgress,
            OldStatus,
            NewStatus,
            LoggedBy
        )
        SELECT
            i.TaskID,
            d.Progress,
            i.Progress,
            d.Status,
            i.Status,
            SYSTEM_USER
        FROM inserted i
        INNER JOIN deleted d ON i.TaskID = d.TaskID;
    END
END;
GO

CREATE TRIGGER TR_Initiatives_Progress ON AnnualInitiatives
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(Progress) OR UPDATE(Status)
    BEGIN
        INSERT INTO InitiativeProgressLog (
            InitiativeID,
            OldProgress,
            NewProgress,
            OldStatus,
            NewStatus,
            LoggedBy
        )
        SELECT
            i.InitiativeID,
            d.Progress,
            i.Progress,
            d.Status,
            i.Status,
            SYSTEM_USER
        FROM inserted i
        INNER JOIN deleted d ON i.InitiativeID = d.InitiativeID;
    END
END;
GO

CREATE TRIGGER TR_Actions_Progress ON StrategicActions
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(Progress) OR UPDATE(Status)
    BEGIN
        INSERT INTO ActionProgressLog (
            ActionID,
            OldProgress,
            NewProgress,
            OldStatus,
            NewStatus,
            LoggedBy
        )
        SELECT
            i.ActionID,
            d.Progress,
            i.Progress,
            d.Status,
            i.Status,
            SYSTEM_USER
        FROM inserted i
        INNER JOIN deleted d ON i.ActionID = d.ActionID;
    END
END;
GO 