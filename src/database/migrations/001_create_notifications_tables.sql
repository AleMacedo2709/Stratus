-- Tabela de Templates de Notificação
CREATE TABLE NotificationTemplates (
    TemplateID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Subject NVARCHAR(200),
    Body NVARCHAR(MAX) NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,
    CreatedBy INT NOT NULL,
    CONSTRAINT FK_NotificationTemplates_Users FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

-- Tabela de Canais de Notificação por Usuário
CREATE TABLE UserNotificationChannels (
    UserID INT NOT NULL,
    ChannelType NVARCHAR(50) NOT NULL,
    Value NVARCHAR(255) NOT NULL,
    IsEnabled BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT PK_UserNotificationChannels PRIMARY KEY (UserID, ChannelType),
    CONSTRAINT FK_UserNotificationChannels_Users FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Tabela de Preferências de Notificação
CREATE TABLE NotificationPreferences (
    UserID INT NOT NULL,
    NotificationType NVARCHAR(50) NOT NULL,
    IsEnabled BIT NOT NULL DEFAULT 1,
    Frequency NVARCHAR(20) NOT NULL DEFAULT 'immediate',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT PK_NotificationPreferences PRIMARY KEY (UserID, NotificationType),
    CONSTRAINT FK_NotificationPreferences_Users FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Tabela de Notificações
CREATE TABLE Notifications (
    NotificationID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'unread',
    Priority NVARCHAR(20) NOT NULL DEFAULT 'normal',
    RelatedEntityType NVARCHAR(50),
    RelatedEntityID NVARCHAR(50),
    Metadata NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    ReadAt DATETIME2 NULL,
    ExpiresAt DATETIME2 NULL,
    CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Tabela de Histórico de Envio de Notificações
CREATE TABLE NotificationDeliveryHistory (
    DeliveryID INT PRIMARY KEY IDENTITY(1,1),
    NotificationID INT NOT NULL,
    ChannelType NVARCHAR(50) NOT NULL,
    Status NVARCHAR(20) NOT NULL,
    ErrorMessage NVARCHAR(MAX),
    SentAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    DeliveredAt DATETIME2 NULL,
    CONSTRAINT FK_NotificationDeliveryHistory_Notifications FOREIGN KEY (NotificationID) REFERENCES Notifications(NotificationID)
);

-- Índices
CREATE INDEX IX_Notifications_UserID_Status ON Notifications(UserID, Status);
CREATE INDEX IX_Notifications_Type ON Notifications(Type);
CREATE INDEX IX_NotificationDeliveryHistory_NotificationID ON NotificationDeliveryHistory(NotificationID);
CREATE INDEX IX_NotificationDeliveryHistory_Status ON NotificationDeliveryHistory(Status);

-- Triggers para UpdatedAt
GO
CREATE TRIGGER TR_NotificationTemplates_UpdatedAt
ON NotificationTemplates
AFTER UPDATE
AS
BEGIN
    UPDATE NotificationTemplates
    SET UpdatedAt = GETDATE()
    FROM NotificationTemplates t
    INNER JOIN inserted i ON t.TemplateID = i.TemplateID;
END;

GO
CREATE TRIGGER TR_UserNotificationChannels_UpdatedAt
ON UserNotificationChannels
AFTER UPDATE
AS
BEGIN
    UPDATE UserNotificationChannels
    SET UpdatedAt = GETDATE()
    FROM UserNotificationChannels c
    INNER JOIN inserted i ON c.UserID = i.UserID AND c.ChannelType = i.ChannelType;
END;

GO
CREATE TRIGGER TR_NotificationPreferences_UpdatedAt
ON NotificationPreferences
AFTER UPDATE
AS
BEGIN
    UPDATE NotificationPreferences
    SET UpdatedAt = GETDATE()
    FROM NotificationPreferences p
    INNER JOIN inserted i ON p.UserID = i.UserID AND p.NotificationType = i.NotificationType;
END; 