USE PlanMP;
GO

-- Views de Acesso
CREATE VIEW vw_ActiveUsers AS
SELECT 
    U.UserID,
    U.Name,
    U.Email,
    P.Name AS ProfileName,
    U.Status,
    U.LastLogin
FROM Users U
INNER JOIN Profiles P ON U.ProfileID = P.ProfileID
WHERE U.IsDeleted = 0 AND U.Status = 'Ativo';
GO

-- Views de Progresso
CREATE VIEW vw_GoalsProgress AS
SELECT 
    i.IndicatorID,
    i.Name AS IndicatorName,
    ig.GoalID,
    ig.GoalType,
    ig.TargetValue,
    ig.CycleID,
    ig.ActionID,
    ig.InitiativeID,
    COALESCE(
        (SELECT TOP 1 Value 
         FROM IndicatorMeasurements im 
         WHERE im.IndicatorID = i.IndicatorID 
         AND im.IsDeleted = 0
         ORDER BY MeasurementDate DESC),
        0
    ) AS CurrentValue,
    CASE 
        WHEN ig.TargetValue = 0 THEN 0
        ELSE (COALESCE(
            (SELECT TOP 1 Value 
             FROM IndicatorMeasurements im 
             WHERE im.IndicatorID = i.IndicatorID 
             AND im.IsDeleted = 0
             ORDER BY MeasurementDate DESC),
            0
        ) / ig.TargetValue) * 100
    END AS AchievementPercentage
FROM Indicators i
INNER JOIN IndicatorGoals ig ON i.IndicatorID = ig.IndicatorID
WHERE i.IsDeleted = 0 AND ig.IsDeleted = 0;
GO

CREATE VIEW vw_CycleGoalsProgress AS
SELECT 
    c.CycleID,
    c.Name AS CycleName,
    i.IndicatorID,
    i.Name AS IndicatorName,
    i.Type AS IndicatorType,
    i.Unit AS IndicatorUnit,
    ig.GoalID,
    ig.TargetValue,
    ig.StartDate,
    ig.EndDate,
    COALESCE(
        (SELECT TOP 1 Value 
         FROM IndicatorMeasurements im 
         WHERE im.IndicatorID = i.IndicatorID 
         AND im.IsDeleted = 0
         AND im.MeasurementDate <= ig.EndDate
         ORDER BY MeasurementDate DESC),
        0
    ) AS CurrentValue,
    CASE 
        WHEN ig.TargetValue = 0 THEN 0
        ELSE (COALESCE(
            (SELECT TOP 1 Value 
             FROM IndicatorMeasurements im 
             WHERE im.IndicatorID = i.IndicatorID 
             AND im.IsDeleted = 0
             AND im.MeasurementDate <= ig.EndDate
             ORDER BY MeasurementDate DESC),
            0
        ) / ig.TargetValue) * 100
    END AS AchievementPercentage
FROM StrategicPlanningCycles c
INNER JOIN IndicatorGoals ig ON c.CycleID = ig.CycleID
INNER JOIN Indicators i ON ig.IndicatorID = i.IndicatorID
WHERE c.IsDeleted = 0 
    AND ig.IsDeleted = 0 
    AND i.IsDeleted = 0
    AND ig.GoalType = 'Ciclo';
GO

-- View para metas anuais por ação estratégica
CREATE VIEW vw_ActionGoalsProgress AS
SELECT 
    sa.ActionID,
    sa.Name AS ActionName,
    sa.Progress AS ActionProgress,
    i.IndicatorID,
    i.Name AS IndicatorName,
    i.Type AS IndicatorType,
    i.Unit AS IndicatorUnit,
    ig.GoalID,
    ig.TargetValue,
    ig.StartDate,
    ig.EndDate,
    COALESCE(
        (SELECT TOP 1 Value 
         FROM IndicatorMeasurements im 
         WHERE im.IndicatorID = i.IndicatorID 
         AND im.IsDeleted = 0
         AND im.MeasurementDate <= ig.EndDate
         ORDER BY MeasurementDate DESC),
        0
    ) AS CurrentValue,
    CASE 
        WHEN ig.TargetValue = 0 THEN 0
        ELSE (COALESCE(
            (SELECT TOP 1 Value 
             FROM IndicatorMeasurements im 
             WHERE im.IndicatorID = i.IndicatorID 
             AND im.IsDeleted = 0
             AND im.MeasurementDate <= ig.EndDate
             ORDER BY MeasurementDate DESC),
            0
        ) / ig.TargetValue) * 100
    END AS AchievementPercentage
FROM StrategicActions sa
INNER JOIN IndicatorGoals ig ON sa.ActionID = ig.ActionID
INNER JOIN Indicators i ON ig.IndicatorID = i.IndicatorID
WHERE sa.IsDeleted = 0 
    AND ig.IsDeleted = 0 
    AND i.IsDeleted = 0
    AND ig.GoalType = 'Anual';
GO

-- View para metas anuais por iniciativa
CREATE VIEW vw_InitiativeGoalsProgress AS
SELECT 
    ai.InitiativeID,
    ai.Name AS InitiativeName,
    ai.Type AS InitiativeType,
    ai.Progress AS InitiativeProgress,
    sa.ActionID,
    sa.Name AS ActionName,
    i.IndicatorID,
    i.Name AS IndicatorName,
    i.Type AS IndicatorType,
    i.Unit AS IndicatorUnit,
    ig.GoalID,
    ig.TargetValue,
    ig.StartDate,
    ig.EndDate,
    COALESCE(
        (SELECT TOP 1 Value 
         FROM IndicatorMeasurements im 
         WHERE im.IndicatorID = i.IndicatorID 
         AND im.IsDeleted = 0
         AND im.MeasurementDate <= ig.EndDate
         ORDER BY MeasurementDate DESC),
        0
    ) AS CurrentValue,
    CASE 
        WHEN ig.TargetValue = 0 THEN 0
        ELSE (COALESCE(
            (SELECT TOP 1 Value 
             FROM IndicatorMeasurements im 
             WHERE im.IndicatorID = i.IndicatorID 
             AND im.IsDeleted = 0
             AND im.MeasurementDate <= ig.EndDate
             ORDER BY MeasurementDate DESC),
            0
        ) / ig.TargetValue) * 100
    END AS AchievementPercentage,
    CASE 
        WHEN ai.Type = 'Planejada' THEN 1
        ELSE 0
    END AS ContribuiParaMeta
FROM AnnualInitiatives ai
INNER JOIN StrategicActions sa ON ai.ActionID = sa.ActionID
INNER JOIN IndicatorGoals ig ON ai.InitiativeID = ig.InitiativeID
INNER JOIN Indicators i ON ig.IndicatorID = i.IndicatorID
WHERE ai.IsDeleted = 0 
    AND sa.IsDeleted = 0 
    AND ig.IsDeleted = 0 
    AND i.IsDeleted = 0
    AND ig.GoalType = 'Anual';
GO

-- View para consolidação do progresso do ciclo estratégico
CREATE VIEW vw_CycleOverallProgress AS
SELECT 
    c.CycleID,
    c.Name AS CycleName,
    c.StartDate,
    c.EndDate,
    c.Status,
    -- Progresso geral do ciclo baseado nas ações estratégicas
    AVG(sa.Progress) AS OverallProgress,
    -- Contagem de ações e iniciativas
    COUNT(DISTINCT sa.ActionID) AS TotalActions,
    COUNT(DISTINCT ai.InitiativeID) AS TotalInitiatives,
    COUNT(DISTINCT CASE WHEN ai.Type = 'Planejada' THEN ai.InitiativeID END) AS PlannedInitiatives,
    -- Progresso das metas
    AVG(CASE 
        WHEN ig.GoalType = 'Ciclo' AND ig.TargetValue > 0
        THEN (COALESCE(
            (SELECT TOP 1 Value 
             FROM IndicatorMeasurements im 
             WHERE im.IndicatorID = i.IndicatorID 
             AND im.IsDeleted = 0
             AND im.MeasurementDate <= GETDATE()
             ORDER BY MeasurementDate DESC),
            0
        ) / ig.TargetValue) * 100
        ELSE NULL
    END) AS CycleGoalsProgress,
    -- Progresso das metas anuais
    AVG(CASE 
        WHEN ig.GoalType = 'Anual' AND ai.Type = 'Planejada' AND ig.TargetValue > 0
        THEN (COALESCE(
            (SELECT TOP 1 Value 
             FROM IndicatorMeasurements im 
             WHERE im.IndicatorID = i.IndicatorID 
             AND im.IsDeleted = 0
             AND im.MeasurementDate <= GETDATE()
             ORDER BY MeasurementDate DESC),
            0
        ) / ig.TargetValue) * 100
        ELSE NULL
    END) AS AnnualGoalsProgress
FROM StrategicPlanningCycles c
INNER JOIN StrategicActions sa ON c.CycleID = sa.CycleID
LEFT JOIN AnnualInitiatives ai ON sa.ActionID = ai.ActionID
LEFT JOIN IndicatorGoals ig ON (
    (ig.CycleID = c.CycleID) OR 
    (ig.ActionID = sa.ActionID) OR 
    (ig.InitiativeID = ai.InitiativeID)
)
INNER JOIN Indicators i ON ig.IndicatorID = i.IndicatorID
WHERE c.IsDeleted = 0 
    AND sa.IsDeleted = 0 
    AND (ai.IsDeleted = 0 OR ai.IsDeleted IS NULL)
    AND ig.IsDeleted = 0 
    AND i.IsDeleted = 0
GROUP BY 
    c.CycleID,
    c.Name,
    c.StartDate,
    c.EndDate,
    c.Status;
GO

-- View para progresso por unidade organizacional
CREATE VIEW vw_UnitProgress AS
SELECT 
    u.UnitID,
    u.Name AS UnitName,
    c.CycleID,
    c.Name AS CycleName,
    COUNT(DISTINCT sa.ActionID) AS TotalActions,
    COUNT(DISTINCT ai.InitiativeID) AS TotalInitiatives,
    COUNT(DISTINCT CASE WHEN ai.Type = 'Planejada' THEN ai.InitiativeID END) AS PlannedInitiatives,
    AVG(CASE WHEN ai.Type = 'Planejada' THEN ai.Progress ELSE NULL END) AS PlannedProgress,
    AVG(CASE WHEN ai.Type = 'Contínua' THEN ai.Progress ELSE NULL END) AS ContinuousProgress,
    AVG(CASE WHEN ai.Type = 'Não Planejada' THEN ai.Progress ELSE NULL END) AS UnplannedProgress,
    -- Progresso das metas da unidade
    AVG(CASE 
        WHEN ai.Type = 'Planejada' AND ig.TargetValue > 0
        THEN (COALESCE(
            (SELECT TOP 1 Value 
             FROM IndicatorMeasurements im 
             WHERE im.IndicatorID = i.IndicatorID 
             AND im.IsDeleted = 0
             ORDER BY MeasurementDate DESC),
            0
        ) / ig.TargetValue) * 100
        ELSE NULL
    END) AS UnitGoalsProgress
FROM OrganizationalUnits u
INNER JOIN StrategicActions sa ON u.UnitID = sa.UnitID
INNER JOIN StrategicPlanningCycles c ON sa.CycleID = c.CycleID
LEFT JOIN AnnualInitiatives ai ON sa.ActionID = ai.ActionID AND ai.UnitID = u.UnitID
LEFT JOIN IndicatorGoals ig ON ai.InitiativeID = ig.InitiativeID
LEFT JOIN Indicators i ON ig.IndicatorID = i.IndicatorID
WHERE u.IsDeleted = 0 
    AND sa.IsDeleted = 0 
    AND c.IsDeleted = 0
    AND (ai.IsDeleted = 0 OR ai.IsDeleted IS NULL)
    AND (ig.IsDeleted = 0 OR ig.IsDeleted IS NULL)
    AND (i.IsDeleted = 0 OR i.IsDeleted IS NULL)
GROUP BY 
    u.UnitID,
    u.Name,
    c.CycleID,
    c.Name;
GO

-- View para progresso por perspectiva estratégica
CREATE VIEW vw_PerspectiveProgress AS
SELECT 
    p.PerspectiveID,
    p.Name AS PerspectiveName,
    c.CycleID,
    c.Name AS CycleName,
    -- Objetivos e Ações
    COUNT(DISTINCT o.ObjectiveID) AS TotalObjectives,
    COUNT(DISTINCT sa.ActionID) AS TotalActions,
    COUNT(DISTINCT ai.InitiativeID) AS TotalInitiatives,
    COUNT(DISTINCT CASE WHEN ai.Type = 'Planejada' THEN ai.InitiativeID END) AS PlannedInitiatives,
    -- Progresso geral
    AVG(sa.Progress) AS ActionsProgress,
    AVG(CASE WHEN ai.Type = 'Planejada' THEN ai.Progress ELSE NULL END) AS PlannedInitiativesProgress,
    -- Progresso das metas do ciclo
    AVG(CASE 
        WHEN ig.GoalType = 'Ciclo' AND ig.TargetValue > 0
        THEN (COALESCE(
            (SELECT TOP 1 Value 
             FROM IndicatorMeasurements im 
             WHERE im.IndicatorID = i.IndicatorID 
             AND im.IsDeleted = 0
             AND im.MeasurementDate <= GETDATE()
             ORDER BY MeasurementDate DESC),
            0
        ) / ig.TargetValue) * 100
        ELSE NULL
    END) AS CycleGoalsProgress
FROM StrategicPerspectives p
INNER JOIN StrategicPlanningCycles c ON p.CycleID = c.CycleID
LEFT JOIN StrategicObjectives o ON p.PerspectiveID = o.PerspectiveID
LEFT JOIN StrategicActions sa ON o.ObjectiveID = sa.ObjectiveID
LEFT JOIN AnnualInitiatives ai ON sa.ActionID = ai.ActionID
LEFT JOIN IndicatorGoals ig ON (
    (ig.CycleID = c.CycleID) OR 
    (ig.ActionID = sa.ActionID)
)
LEFT JOIN Indicators i ON ig.IndicatorID = i.IndicatorID
WHERE p.IsDeleted = 0 
    AND c.IsDeleted = 0
    AND (o.IsDeleted = 0 OR o.IsDeleted IS NULL)
    AND (sa.IsDeleted = 0 OR sa.IsDeleted IS NULL)
    AND (ai.IsDeleted = 0 OR ai.IsDeleted IS NULL)
    AND (ig.IsDeleted = 0 OR ig.IsDeleted IS NULL)
    AND (i.IsDeleted = 0 OR i.IsDeleted IS NULL)
GROUP BY 
    p.PerspectiveID,
    p.Name,
    c.CycleID,
    c.Name;
GO

-- View para hierarquia de unidades
CREATE VIEW vw_UnitHierarchy AS
WITH UnitCTE AS (
    -- Unidades raiz (sem pai)
    SELECT 
        UnitID,
        Name,
        ParentUnitID,
        CAST(Name AS NVARCHAR(1000)) AS HierarchyPath,
        1 AS Level
    FROM OrganizationalUnits
    WHERE ParentUnitID IS NULL AND IsDeleted = 0
    
    UNION ALL
    
    -- Unidades filhas
    SELECT 
        u.UnitID,
        u.Name,
        u.ParentUnitID,
        CAST(uc.HierarchyPath + ' > ' + u.Name AS NVARCHAR(1000)),
        uc.Level + 1
    FROM OrganizationalUnits u
    INNER JOIN UnitCTE uc ON u.ParentUnitID = uc.UnitID
    WHERE u.IsDeleted = 0
)
SELECT 
    UnitID,
    Name,
    ParentUnitID,
    HierarchyPath,
    Level
FROM UnitCTE;
GO

-- View para relacionamento entre metas do ciclo e metas anuais
CREATE VIEW vw_GoalsRelationship AS
SELECT 
    c.CycleID,
    c.Name AS CycleName,
    sa.ActionID,
    sa.Name AS ActionName,
    ai.InitiativeID,
    ai.Name AS InitiativeName,
    ai.Type AS InitiativeType,
    -- Meta do Ciclo
    igc.GoalID AS CycleGoalID,
    igc.TargetValue AS CycleTargetValue,
    i_cycle.Name AS CycleIndicatorName,
    -- Meta Anual
    iga.GoalID AS AnnualGoalID,
    iga.TargetValue AS AnnualTargetValue,
    i_annual.Name AS AnnualIndicatorName,
    -- Progresso
    CASE 
        WHEN ai.Type = 'Planejada' THEN 
            COALESCE(
                (SELECT TOP 1 Value 
                 FROM IndicatorMeasurements im 
                 WHERE im.IndicatorID = i_annual.IndicatorID 
                 AND im.IsDeleted = 0
                 ORDER BY MeasurementDate DESC),
                0
            ) / iga.TargetValue * 100
        ELSE NULL
    END AS AnnualAchievementPercentage,
    CASE 
        WHEN ai.Type = 'Planejada' THEN 1
        ELSE 0
    END AS ContribuiParaMeta
FROM StrategicPlanningCycles c
INNER JOIN StrategicActions sa ON c.CycleID = sa.CycleID
INNER JOIN AnnualInitiatives ai ON sa.ActionID = ai.ActionID
-- Metas do Ciclo
INNER JOIN IndicatorGoals igc ON igc.CycleID = c.CycleID AND igc.GoalType = 'Ciclo'
INNER JOIN Indicators i_cycle ON igc.IndicatorID = i_cycle.IndicatorID
-- Metas Anuais
LEFT JOIN IndicatorGoals iga ON (iga.ActionID = sa.ActionID OR iga.InitiativeID = ai.InitiativeID) 
    AND iga.GoalType = 'Anual'
LEFT JOIN Indicators i_annual ON iga.IndicatorID = i_annual.IndicatorID
WHERE c.IsDeleted = 0 
    AND sa.IsDeleted = 0 
    AND ai.IsDeleted = 0
    AND igc.IsDeleted = 0
    AND i_cycle.IsDeleted = 0;
GO 