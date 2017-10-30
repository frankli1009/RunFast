USE [C:\USERS\ADMINISTRATOR\DOCUMENTS\VISUAL STUDIO 2015\PROJECTS\RUNFAST\RUNFAST\APP_DATA\RUNFAST.MDF]
GO

/****** Object: SqlProcedure [dbo].[GetLocalGame] Script Date: 2017/10/18 19:29:21 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('[dbo].[usp_GetLocalGame]', 'P') IS NOT NULL
DROP PROC [dbo].[usp_GetLocalGame]
GO

CREATE PROCEDURE [dbo].[usp_GetLocalGame]
	@playerId int,
	@playerType smallint
AS
	DECLARE @gameId int, @playerCount int
	DECLARE @turn smallint = 1
	--It doesn't matter whether the player is a VIP. The PlayerID will only be conflict with Guest player.
	IF @playerType > 1
		SET @playerType = 1

	SELECT @gameId = t2.GameId 
		FROM [dbo].[Game] t1, [dbo].[Game_Player] t2 
		WHERE t1.Id = t2.GameId AND t1.Local = 1 AND t1.Owner = 0 AND t2.PlayerId = @playerId AND t2.PlayerType = @playerType
	IF @@ROWCOUNT > 0 AND @playerId > 0
	BEGIN
		BEGIN TRANSACTION
			UPDATE [dbo].[Game_Player] SET Started = 0 WHERE GameId = @gameId AND PlayerId = @playerId AND PlayerType = @playerType
			UPDATE [dbo].[Game] 
				SET ShuffleState=0, ReadyState=0 
				WHERE Id = @gameId
			DELETE [dbo].[Game_Card] WHERE GameId = @gameId
		COMMIT
		SELECT @gameId AS GameId, @turn AS Turn
	END
	ELSE
	BEGIN
		BEGIN TRANSACTION
			-- Kick out non-active game players
			DELETE [dbo].[Game_Player] 
				FROM [dbo].[Game] t1, [dbo].[Game_Player] t2 
				WHERE t1.Id = t2.GameId AND t1.Local = 1 AND t1.Owner = 0 
					AND t2.PlayerId > -1 
					AND (DATEDIFF(minute, t2.LastActiveTime, GETDATE()) > 30 OR t2.LastActiveTime IS NULL)

			-- Find the games have at least one empty place and get the one with the smallest GameId
			SELECT TOP 1 @gameId = t.GameId, @playerCount = t.PlayerCount FROM
				(SELECT t2.GameId, count(*) as PlayerCount 
				 FROM [dbo].[Game] t1, [dbo].[Game_Player] t2 
				 WHERE t1.Id = t2.GameId AND t1.Local = 1 AND t1.Owner = 0
				 GROUP BY t2.GameId) t
			WHERE t.PlayerCount<3
			ORDER BY t.GameId

			if @@ROWCOUNT = 0
			BEGIN
				/* Insert a new game record */
				EXEC [dbo].[usp_NewGame] 1, 0, '', @gameId OUTPUT
			END
			IF NOT EXISTS(SELECT * FROM [dbo].[Game_Player] t2 WHERE t2.GameId = @gameId AND t2.Turn = 2) 
			BEGIN
				INSERT INTO [dbo].[Game_Player] (GameId, PlayerId, PlayerType, Turn, Started) VALUES (@gameId, -1, 0, 3, 1)
				INSERT INTO [dbo].[Game_Player] (GameId, PlayerId, PlayerType, Turn, Started) VALUES (@gameId, -2, 0, 2, 1)
				UPDATE [dbo].[Game] 
					SET ShuffleState=0, ReadyState=0 
					WHERE Id = @gameId
				DELETE [dbo].[Game_Card] WHERE GameId = @gameId
			END
			INSERT INTO [dbo].[Game_Player] (GameId, PlayerId, PlayerType, Turn, Started) VALUES (@gameId, @playerId, @playerType, 1, 0)
		COMMIT
		SELECT @gameId AS GameId, @turn AS Turn
	END

RETURN 0

GO