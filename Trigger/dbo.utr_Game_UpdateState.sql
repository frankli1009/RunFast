/****** Object: SqlTrigger [dbo].[utr_Game_UpdateState] Script Date: 2017/10/21 18:29:21 ******/
USE [C:\USERS\ADMINISTRATOR\DOCUMENTS\VISUAL STUDIO 2015\PROJECTS\RUNFAST\RUNFAST\APP_DATA\RUNFAST.MDF]
GO

IF EXISTS (SELECT name FROM sys.objects  
      WHERE name = 'utr_Game_UpdateState' AND type = 'TR')  
   DROP TRIGGER [dbo].[utr_Game_UpdateState]  
GO  

CREATE TRIGGER [utr_Game_UpdateState]
	ON [dbo].[Game]
	FOR UPDATE
AS
	BEGIN
		DECLARE @id INT, @newState SMALLINT, @oldState SMALLINT
		SET NOCOUNT ON
		IF (UPDATE(ShuffleState))
		BEGIN
			-- It's an update if the record is in BOTH inserted AND deleted
			SELECT
				@id = inserted.Id, @newState = inserted.ShuffleState, @oldState = deleted.ShuffleState
			FROM
				inserted
			INNER JOIN
				deleted
			ON inserted.Id = deleted.Id

			IF (@newState = 1 and @oldState = 0)
			BEGIN
				-- Log this game and its players
				DECLARE @logGameId int, @playerType smallint
				SELECT TOP 1 @playerType = PlayerType 
					FROM [dbo].[Game_Player]
					WHERE GameId = @id
					ORDER BY PlayerId DESC
				IF @playerType = 1
				BEGIN
					INSERT INTO [dbo].[LogGame] (GameId, StartTime)
						VALUES (@id, GetDate())
					SET @logGameId = SCOPE_IDENTITY() 

					INSERT INTO [dbo].[LogGame_Player] (LogGameId, GameId, PlayerId)
						SELECT @logGameId, @id, PlayerId
						FROM [dbo].[Game_Player]
						WHERE GameId = @id AND PlayerId > 0
				END

				--Start a new game
				EXEC usp_ShuffleAndDispatchCardsEx @id
				UPDATE [dbo].[Game] SET ReadyState = 1 WHERE Id = @id
			END
		END
		IF (UPDATE(ReadyState))
		BEGIN
			-- It's an update if the record is in BOTH inserted AND deleted
			SELECT
				@id = inserted.Id, @newState = inserted.ReadyState, @oldState = deleted.ReadyState
			FROM
				inserted
			INNER JOIN
				deleted
				ON inserted.Id = deleted.Id

			IF (@newState = 0 and @oldState = 1)
			BEGIN
				--Game over
				PRINT @id
				UPDATE [dbo].[Game_Player] set Started = 0 WHERE GameId=@id and PlayerId>=0
				UPDATE [dbo].[Game] SET ShuffleState = 0 WHERE Id = @id
				UPDATE [dbo].[LogGame] SET EndTime = GetDate() WHERE GameId=@id and EndTime IS NULL
			END
		END
	END

GO  