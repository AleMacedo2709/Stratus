-- Criar banco de dados e configurações iniciais
CREATE DATABASE PlanMP
COLLATE Latin1_General_CI_AI;
GO

USE PlanMP;
GO

-- Configurações de segurança
ALTER DATABASE PlanMP SET TRUSTWORTHY ON;
GO

-- Tabelas de Suporte
CREATE TABLE Profiles (
    ProfileID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL,
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT NOT NULL DEFAULT 0
);

CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Email NVARCHAR(200) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL,
    ProfileID INT NOT NULL REFERENCES Profiles(ProfileID),
    Status NVARCHAR(20) NOT NULL DEFAULT 'Ativo' CHECK (Status IN ('Ativo', 'Inativo', 'Bloqueado')),
    LastLogin DATETIME2,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL,
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- Unidades Organizacionais
CREATE TABLE OrganizationalUnits (
    UnitID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    ParentUnitID INT NULL,
    OrderIndex INT,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL,
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_Units_ParentUnit FOREIGN KEY (ParentUnitID) 
        REFERENCES OrganizationalUnits(UnitID)
);

-- Tabelas Principais do Planejamento Estratégico

-- Ciclos Estratégicos (6 anos)
CREATE TABLE StrategicPlanningCycles (
    CycleID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Mission NVARCHAR(500),
    Vision NVARCHAR(500),
    Status NVARCHAR(20) NOT NULL DEFAULT 'Aguardando aprovação',
    Progress DECIMAL(5,2) DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL,
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT NOT NULL DEFAULT 0,
    CONSTRAINT CHK_CycleStatus CHECK (Status IN ('Aguardando aprovação', 'Não iniciado', 'Em andamento', 'Concluído', 'Suspenso', 'Descontinuada')),
    CONSTRAINT CHK_CycleDates CHECK (EndDate > StartDate)
);

-- Valores Organizacionais
CREATE TABLE OrganizationalValues (
    ValueID INT IDENTITY(1,1) PRIMARY KEY,
    CycleID INT REFERENCES StrategicPlanningCycles(CycleID),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    OrderIndex INT,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL,
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- Perspectivas Estratégicas
CREATE TABLE StrategicPerspectives (
    PerspectiveID INT IDENTITY(1,1) PRIMARY KEY,
    CycleID INT REFERENCES StrategicPlanningCycles(CycleID),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    OrderIndex INT,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL,
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- Objetivos Estratégicos
CREATE TABLE StrategicObjectives (
    ObjectiveID INT IDENTITY(1,1) PRIMARY KEY,
    PerspectiveID INT REFERENCES StrategicPerspectives(PerspectiveID),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    OrderIndex INT,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL,
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- Ações Estratégicas
CREATE TABLE StrategicActions (
    ActionID INT IDENTITY(1,1) PRIMARY KEY,
    CycleID INT NOT NULL,
    ObjectiveID INT NOT NULL,
    UnitID INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Aguardando aprovação'
        CHECK (Status IN ('Aguardando aprovação', 'Não iniciado', 'Em andamento', 
                         'Concluído', 'Suspenso', 'Descontinuada')),
    Progress DECIMAL(5,2) DEFAULT 0,
    Weight DECIMAL(5,2) DEFAULT 1.0,
    RiskLevel NVARCHAR(20) CHECK (RiskLevel IN ('Baixo', 'Médio', 'Alto')),
    CostImpact NVARCHAR(20) CHECK (CostImpact IN ('Baixo', 'Médio', 'Alto')),
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL,
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    CONSTRAINT FK_StrategicActions_Cycle FOREIGN KEY (CycleID) 
        REFERENCES StrategicPlanningCycles(CycleID),
    CONSTRAINT FK_StrategicActions_Objective FOREIGN KEY (ObjectiveID) 
        REFERENCES StrategicObjectives(ObjectiveID),
    CONSTRAINT FK_StrategicActions_Unit FOREIGN KEY (UnitID) 
        REFERENCES OrganizationalUnits(UnitID)
);

-- Planos Anuais de Ação (PAA)
CREATE TABLE AnnualActionPlans (
    PlanID INT IDENTITY(1,1) PRIMARY KEY,
    CycleID INT REFERENCES StrategicPlanningCycles(CycleID),
    Year INT NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Aguardando aprovação',
    Progress DECIMAL(5,2) DEFAULT 0,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL,
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT NOT NULL DEFAULT 0,
    CONSTRAINT CHK_PlanStatus CHECK (Status IN ('Aguardando aprovação', 'Não iniciado', 'Em andamento', 'Concluído', 'Suspenso', 'Descontinuada')),
    CONSTRAINT CHK_PlanDates CHECK (EndDate >= StartDate)
);

-- Iniciativas Anuais
CREATE TABLE AnnualInitiatives (
    InitiativeID INT IDENTITY(1,1) PRIMARY KEY,
    PlanID INT NOT NULL REFERENCES AnnualActionPlans(PlanID),
    ActionID INT NOT NULL REFERENCES StrategicActions(ActionID),
    UnitID INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    Type NVARCHAR(20) NOT NULL 
        CHECK (Type IN ('Planejada', 'Contínua', 'Não Planejada')),
    Status NVARCHAR(20) NOT NULL DEFAULT 'Aguardando aprovação'
        CHECK (Status IN ('Aguardando aprovação', 'Não iniciado', 'Em andamento', 
                         'Concluído', 'Suspenso', 'Descontinuada')),
    Progress DECIMAL(5,2) DEFAULT 0,
    Weight DECIMAL(5,2) DEFAULT 1.0,
    RiskLevel NVARCHAR(20) CHECK (RiskLevel IN ('Baixo', 'Médio', 'Alto')),
    CostImpact NVARCHAR(20) CHECK (CostImpact IN ('Baixo', 'Médio', 'Alto')),
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL,
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    CONSTRAINT FK_AnnualInitiatives_Unit FOREIGN KEY (UnitID) 
        REFERENCES OrganizationalUnits(UnitID)
);

-- Tarefas
CREATE TABLE Tasks (
    TaskID INT IDENTITY(1,1) PRIMARY KEY,
    InitiativeID INT REFERENCES AnnualInitiatives(InitiativeID),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    AssignedTo INT REFERENCES Users(UserID),
    Status NVARCHAR(20) NOT NULL DEFAULT 'Aguardando aprovação',
    Priority NVARCHAR(20) NOT NULL DEFAULT 'Média',
    Progress DECIMAL(5,2) DEFAULT 0,
    Weight DECIMAL(5,2) DEFAULT 1.0,
    RiskLevel NVARCHAR(20) CHECK (RiskLevel IN ('Baixo', 'Médio', 'Alto')),
    CostImpact NVARCHAR(20) CHECK (CostImpact IN ('Baixo', 'Médio', 'Alto')),
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL,
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT NOT NULL DEFAULT 0,
    CONSTRAINT CHK_TaskStatus CHECK (Status IN ('Aguardando aprovação', 'Não iniciado', 'Em andamento', 'Concluído', 'Suspenso', 'Descontinuada')),
    CONSTRAINT CHK_TaskPriority CHECK (Priority IN ('Baixa', 'Média', 'Alta')),
    CONSTRAINT CHK_TaskDates CHECK (EndDate >= StartDate)
);

-- Dependências entre Tarefas
CREATE TABLE TaskDependencies (
    TaskID INT REFERENCES Tasks(TaskID),
    DependsOnTaskID INT REFERENCES Tasks(TaskID),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL,
    CONSTRAINT PK_TaskDependencies PRIMARY KEY (TaskID, DependsOnTaskID)
);

-- Indicadores
CREATE TABLE Indicators (
    IndicatorID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    Type NVARCHAR(20) NOT NULL,
    Unit NVARCHAR(20) NOT NULL,
    Frequency NVARCHAR(20) NOT NULL,
    BaselineValue DECIMAL(18,2),
    BaselineDate DATE,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL,
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT NOT NULL DEFAULT 0,
    CONSTRAINT CHK_IndicatorType CHECK (Type IN ('Estratégico', 'Produtividade', 'Qualidade')),
    CONSTRAINT CHK_IndicatorFrequency CHECK (Frequency IN ('Diário', 'Semanal', 'Mensal', 'Trimestral', 'Semestral', 'Anual'))
);

-- Metas dos Indicadores
CREATE TABLE IndicatorGoals (
    GoalID INT IDENTITY(1,1) PRIMARY KEY,
    IndicatorID INT REFERENCES Indicators(IndicatorID),
    CycleID INT NULL REFERENCES StrategicPlanningCycles(CycleID),
    ActionID INT NULL REFERENCES StrategicActions(ActionID),
    InitiativeID INT NULL REFERENCES AnnualInitiatives(InitiativeID),
    GoalType NVARCHAR(20) NOT NULL CHECK (GoalType IN ('Ciclo', 'Anual')),
    TargetValue DECIMAL(18,2) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL,
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT NOT NULL DEFAULT 0,
    CONSTRAINT CHK_GoalDates CHECK (EndDate > StartDate),
    CONSTRAINT CHK_GoalReference CHECK (
        (GoalType = 'Ciclo' AND CycleID IS NOT NULL AND ActionID IS NULL AND InitiativeID IS NULL) OR
        (GoalType = 'Anual' AND CycleID IS NULL AND (ActionID IS NOT NULL OR InitiativeID IS NOT NULL))
    )
);

-- Medições dos Indicadores
CREATE TABLE IndicatorMeasurements (
    MeasurementID INT IDENTITY(1,1) PRIMARY KEY,
    IndicatorID INT REFERENCES Indicators(IndicatorID),
    Value DECIMAL(18,2) NOT NULL,
    MeasurementDate DATE NOT NULL,
    Comments NVARCHAR(500),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL,
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT NOT NULL DEFAULT 0
);

CREATE TABLE AuditLogs (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    UserID NVARCHAR(100) NOT NULL,
    Action NVARCHAR(100) NOT NULL,
    Resource NVARCHAR(200) NOT NULL,
    Details NVARCHAR(MAX) NOT NULL,
    IPAddress NVARCHAR(50) NOT NULL,
    UserAgent NVARCHAR(500) NOT NULL,
    Timestamp DATETIME2 NOT NULL DEFAULT GETDATE(),
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL,
    CreatedBy NVARCHAR(100) NOT NULL,
    UpdatedBy NVARCHAR(100) NULL
);

-- Adicionar tabelas de log
CREATE TABLE TaskProgressLog (
    LogID INT IDENTITY(1,1) PRIMARY KEY,
    TaskID INT NOT NULL,
    OldProgress DECIMAL(5,2),
    NewProgress DECIMAL(5,2),
    OldStatus NVARCHAR(20),
    NewStatus NVARCHAR(20),
    Comments NVARCHAR(500),
    LogDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    LoggedBy NVARCHAR(100) NOT NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_TaskProgressLog_Task FOREIGN KEY (TaskID) 
        REFERENCES Tasks(TaskID)
);

CREATE TABLE InitiativeProgressLog (
    LogID INT IDENTITY(1,1) PRIMARY KEY,
    InitiativeID INT NOT NULL,
    OldProgress DECIMAL(5,2),
    NewProgress DECIMAL(5,2),
    OldStatus NVARCHAR(20),
    NewStatus NVARCHAR(20),
    Comments NVARCHAR(500),
    LogDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    LoggedBy NVARCHAR(100) NOT NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_InitiativeProgressLog_Initiative FOREIGN KEY (InitiativeID) 
        REFERENCES AnnualInitiatives(InitiativeID)
);

CREATE TABLE ActionProgressLog (
    LogID INT IDENTITY(1,1) PRIMARY KEY,
    ActionID INT NOT NULL,
    OldProgress DECIMAL(5,2),
    NewProgress DECIMAL(5,2),
    OldStatus NVARCHAR(20),
    NewStatus NVARCHAR(20),
    Comments NVARCHAR(500),
    LogDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    LoggedBy NVARCHAR(100) NOT NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_ActionProgressLog_Action FOREIGN KEY (ActionID) 
        REFERENCES StrategicActions(ActionID)
);