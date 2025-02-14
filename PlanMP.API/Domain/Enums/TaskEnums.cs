namespace PlanMP.API.Domain.Enums;

public enum TaskStatus
{
    Nao_Iniciado,
    Em_Andamento,
    Concluido,
    Atrasado,
    Suspenso,
    Descontinuado
}

public enum TaskPriority
{
    Baixa,
    Media,
    Alta
}

public enum RiskLevel
{
    Baixo,
    Medio,
    Alto,
    Critico
}

public enum CostImpact
{
    Baixo,
    Medio,
    Alto
} 