/****** Object: SqlTrigger [dbo].[utr_Game_Player_InsertUpdateTime] Script Date: 2017/10/28 18:29:21 ******/
USE [C:\USERS\ADMINISTRATOR\DOCUMENTS\VISUAL STUDIO 2015\PROJECTS\RUNFAST\RUNFAST\APP_DATA\RUNFAST.MDF]
GO

IF EXISTS (SELECT name FROM sys.objects  
      WHERE name = 'utr_Game_Player_InsertUpdateTime' AND type = 'TR')  
   DROP TRIGGER [dbo].[utr_Game_Player_InsertUpdateTime]  
GO  

CREATE TRIGGER [utr_Game_Player_InsertUpdateTime]
	ON [dbo].[Game_Player]
	FOR INSERT, UPDATE
AS
	BEGIN
		DECLARE @id INT, @lastActiveTime DATETIME
		SET NOCOUNT ON
		SELECT
			@id = inserted.Id, @lastActiveTime = inserted.LastActiveTime
		FROM
			inserted

		IF (NOT UPDATE(LastActiveTime)) OR (@lastActiveTime IS NULL)
			UPDATE [dbo].[Game_Player] 
				SET LastActiveTime = GetDate() 
				WHERE Id = @id
	END

GO  