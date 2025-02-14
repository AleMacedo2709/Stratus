USE PlanMP;
GO

-- Procedures com validação de segurança
CREATE PROCEDURE sp_CreateUser
    @Name NVARCHAR(200),
    @Email NVARCHAR(200),
    @PasswordHash NVARCHAR(500),
    @ProfileID INT,
    @CreatedBy NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validações
    IF EXISTS (SELECT 1 FROM Users WHERE Email = @Email AND IsDeleted = 0)
    BEGIN
        THROW 50000, 'Email já existe.', 1;
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM Profiles WHERE ProfileID = @ProfileID)
    BEGIN
        THROW 50000, 'Perfil inválido.', 1;
        RETURN;
    END

    -- Inserção com tratamento de erro
    BEGIN TRY
        INSERT INTO Users (
            Name,
            Email,
            PasswordHash,
            ProfileID,
            Status,
            LastLogin,
            CreatedBy
        )
        VALUES (
            @Name,
            @Email,
            @PasswordHash,
            @ProfileID,
            'Ativo',
            NULL,
            @CreatedBy
        );

        SELECT SCOPE_IDENTITY() AS UserID;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO 