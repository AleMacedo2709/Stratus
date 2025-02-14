-- Seed para ambiente de desenvolvimento e testes
USE PlanMP;
GO

-- Inserir perfis básicos
INSERT INTO Profiles (Name, Description, CreatedBy)
VALUES 
('Administrador', 'Acesso total ao sistema', 'SYSTEM'),
('Planejamento', 'Gestão do planejamento estratégico', 'SYSTEM'),
('PAA', 'Gestão do plano de ação anual', 'SYSTEM'),
('Usuário', 'Acesso básico ao sistema', 'SYSTEM');

-- Inserir usuário administrador
INSERT INTO Users (Name, Email, PasswordHash, ProfileID, CreatedBy)
VALUES ('Admin', 'admin@planmp.org', 'HASH_TO_BE_GENERATED', 1, 'SYSTEM');

-- Inserir ciclo estratégico de exemplo
INSERT INTO StrategicPlanningCycles (
    Name, 
    StartDate, 
    EndDate, 
    Mission, 
    Vision, 
    Status,
    CreatedBy
)
VALUES (
    'Ciclo Estratégico 2024-2029',
    '2024-01-01',
    '2029-12-31',
    'Promover a justiça, a cidadania e o desenvolvimento social',
    'Ser reconhecido como instituição de excelência na promoção da justiça até 2029',
    'Active',
    'SYSTEM'
);

-- Inserir valores organizacionais
INSERT INTO OrganizationalValues (
    CycleID,
    Name,
    Description,
    OrderIndex,
    CreatedBy
)
VALUES 
(1, 'Ética', 'Atuação com integridade e transparência', 1, 'SYSTEM'),
(1, 'Eficiência', 'Busca contínua por resultados efetivos', 2, 'SYSTEM'),
(1, 'Inovação', 'Promoção de soluções criativas e transformadoras', 3, 'SYSTEM');

-- Inserir perspectivas estratégicas
INSERT INTO StrategicPerspectives (
    CycleID,
    Name,
    Description,
    OrderIndex,
    CreatedBy
)
VALUES 
(1, 'Sociedade', 'Impacto na sociedade e cidadania', 1, 'SYSTEM'),
(1, 'Processos', 'Eficiência operacional', 2, 'SYSTEM'),
(1, 'Aprendizado', 'Desenvolvimento institucional', 3, 'SYSTEM');

-- Inserir objetivos estratégicos
INSERT INTO StrategicObjectives (
    PerspectiveID,
    Name,
    Description,
    OrderIndex,
    CreatedBy
)
VALUES 
(1, 'Ampliar o acesso à justiça', 'Facilitar o acesso da população aos serviços jurídicos', 1, 'SYSTEM'),
(2, 'Otimizar processos internos', 'Melhorar a eficiência dos processos de trabalho', 1, 'SYSTEM'),
(3, 'Desenvolver competências', 'Capacitar e desenvolver o quadro funcional', 1, 'SYSTEM');

-- Inserir ações estratégicas
INSERT INTO StrategicActions (
    ObjectiveID,
    Name,
    Description,
    StartDate,
    EndDate,
    Status,
    CreatedBy
)
VALUES 
(1, 'Implementar atendimento digital', 'Criar canais digitais de atendimento ao cidadão', '2024-01-01', '2025-12-31', 'In_Progress', 'SYSTEM'),
(2, 'Automatizar processos críticos', 'Identificar e automatizar processos prioritários', '2024-01-01', '2026-12-31', 'In_Progress', 'SYSTEM'),
(3, 'Programa de capacitação contínua', 'Desenvolver programa de treinamento institucional', '2024-01-01', '2024-12-31', 'In_Progress', 'SYSTEM');

-- Inserir plano anual
INSERT INTO AnnualActionPlans (
    CycleID,
    Year,
    Status,
    StartDate,
    EndDate,
    CreatedBy
)
VALUES 
(1, 2024, 'Active', '2024-01-01', '2024-12-31', 'SYSTEM');

-- Inserir iniciativas anuais
INSERT INTO AnnualInitiatives (
    PlanID,
    ActionID,
    Name,
    Description,
    Type,
    Status,
    StartDate,
    EndDate,
    CreatedBy
)
VALUES 
(1, 1, 'Portal de Serviços Digitais', 'Desenvolvimento do portal de serviços online', 'Strategic', 'In_Progress', '2024-01-01', '2024-06-30', 'SYSTEM'),
(1, 2, 'Mapeamento de Processos', 'Identificação e documentação de processos críticos', 'Strategic', 'In_Progress', '2024-01-01', '2024-12-31', 'SYSTEM'),
(1, 3, 'Trilhas de Aprendizagem', 'Definição das trilhas de capacitação por área', 'Strategic', 'In_Progress', '2024-01-01', '2024-03-31', 'SYSTEM');

-- Inserir tarefas
INSERT INTO Tasks (
    InitiativeID,
    Name,
    Description,
    Status,
    Priority,
    StartDate,
    EndDate,
    CreatedBy
)
VALUES 
(1, 'Levantamento de Requisitos', 'Identificar requisitos do portal digital', 'In_Progress', 'High', '2024-01-01', '2024-02-28', 'SYSTEM'),
(1, 'Desenvolvimento Frontend', 'Implementar interface do usuário', 'Not_Started', 'Medium', '2024-03-01', '2024-04-30', 'SYSTEM'),
(2, 'Workshop com Áreas', 'Realizar workshops de mapeamento', 'In_Progress', 'Medium', '2024-01-15', '2024-03-15', 'SYSTEM'),
(3, 'Definir Competências', 'Mapear competências necessárias', 'In_Progress', 'High', '2024-01-01', '2024-01-31', 'SYSTEM');

-- Inserir indicadores
INSERT INTO Indicators (
    Name,
    Description,
    Type,
    Unit,
    Frequency,
    BaselineValue,
    BaselineDate,
    CreatedBy
)
VALUES 
('Taxa de Digitalização', 'Percentual de serviços disponíveis digitalmente', 'Quantitative', '%', 'Monthly', 10.0, '2023-12-31', 'SYSTEM'),
('Tempo Médio de Atendimento', 'Tempo médio de resposta ao cidadão', 'Quantitative', 'dias', 'Monthly', 15.0, '2023-12-31', 'SYSTEM'),
('Satisfação do Usuário', 'Índice de satisfação com os serviços', 'Quantitative', '%', 'Monthly', 75.0, '2023-12-31', 'SYSTEM');

-- Inserir metas dos indicadores
INSERT INTO IndicatorGoals (
    IndicatorID,
    ReferenceID,
    ReferenceType,
    TargetValue,
    StartDate,
    EndDate,
    CreatedBy
)
VALUES 
(1, 1, 'Strategic', 50.0, '2024-01-01', '2024-12-31', 'SYSTEM'),
(2, 1, 'Strategic', 5.0, '2024-01-01', '2024-12-31', 'SYSTEM'),
(3, 1, 'Strategic', 90.0, '2024-01-01', '2024-12-31', 'SYSTEM');

-- Inserir medições iniciais
INSERT INTO IndicatorMeasurements (
    IndicatorID,
    Value,
    MeasurementDate,
    CreatedBy
)
VALUES 
(1, 15.0, '2024-01-31', 'SYSTEM'),
(2, 12.0, '2024-01-31', 'SYSTEM'),
(3, 78.0, '2024-01-31', 'SYSTEM');

GO 