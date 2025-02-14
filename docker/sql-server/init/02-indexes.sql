USE PlanMP;
GO

-- Índices para usuários
CREATE INDEX IX_Users_Email ON Users(Email) WHERE IsDeleted = 0;
CREATE INDEX IX_Users_Profile ON Users(ProfileID) INCLUDE (Name, Email, Status) WHERE IsDeleted = 0;

-- Índices para iniciativas
CREATE INDEX IX_Initiatives_Action ON AnnualInitiatives(ActionID) INCLUDE (Name, Status, Progress) WHERE IsDeleted = 0;
CREATE INDEX IX_Initiatives_Plan ON AnnualInitiatives(PlanID) WHERE IsDeleted = 0;
CREATE INDEX IX_Initiatives_Unit ON AnnualInitiatives(UnitID) WHERE IsDeleted = 0;
CREATE INDEX IX_Initiatives_Status ON AnnualInitiatives(Status) WHERE IsDeleted = 0;

-- Índices para tarefas
CREATE INDEX IX_Tasks_Initiative ON Tasks(InitiativeID) INCLUDE (Name, Status, Progress) WHERE IsDeleted = 0;
CREATE INDEX IX_Tasks_AssignedTo ON Tasks(AssignedTo) WHERE IsDeleted = 0;
CREATE INDEX IX_Tasks_Status ON Tasks(Status) WHERE IsDeleted = 0;

-- Índices para logs
CREATE INDEX IX_TaskProgressLog_Task ON TaskProgressLog(TaskID, LogDate) WHERE IsDeleted = 0;
CREATE INDEX IX_InitiativeProgressLog_Initiative ON InitiativeProgressLog(InitiativeID, LogDate) WHERE IsDeleted = 0;
CREATE INDEX IX_ActionProgressLog_Action ON ActionProgressLog(ActionID, LogDate) WHERE IsDeleted = 0;

-- Índices para busca por data
CREATE INDEX IX_TaskProgressLog_Date ON TaskProgressLog(LogDate) WHERE IsDeleted = 0;
CREATE INDEX IX_InitiativeProgressLog_Date ON InitiativeProgressLog(LogDate) WHERE IsDeleted = 0;
CREATE INDEX IX_ActionProgressLog_Date ON ActionProgressLog(LogDate) WHERE IsDeleted = 0;
CREATE INDEX IX_IndicatorMeasurements_Date ON IndicatorMeasurements(IndicatorID, MeasurementDate) WHERE IsDeleted = 0;

-- Índices para metas e indicadores
CREATE INDEX IX_IndicatorGoals_Cycle ON IndicatorGoals(CycleID) WHERE IsDeleted = 0 AND GoalType = 'Ciclo';
CREATE INDEX IX_IndicatorGoals_Action ON IndicatorGoals(ActionID) WHERE IsDeleted = 0 AND GoalType = 'Anual';
CREATE INDEX IX_IndicatorGoals_Initiative ON IndicatorGoals(InitiativeID) WHERE IsDeleted = 0 AND GoalType = 'Anual';
CREATE INDEX IX_IndicatorMeasurements_Indicator ON IndicatorMeasurements(IndicatorID, MeasurementDate) WHERE IsDeleted = 0;

-- Índices para Unidades
CREATE INDEX IX_Units_Parent ON OrganizationalUnits(ParentUnitID) WHERE IsDeleted = 0;
CREATE INDEX IX_Units_Name ON OrganizationalUnits(Name) WHERE IsDeleted = 0;

-- Índices para Auditoria
CREATE INDEX IX_AuditLogs_UserAction ON AuditLogs(UserID, Action, Resource, Timestamp) WHERE IsDeleted = 0;
CREATE INDEX IX_AuditLogs_Timestamp ON AuditLogs(Timestamp) WHERE IsDeleted = 0;
GO 