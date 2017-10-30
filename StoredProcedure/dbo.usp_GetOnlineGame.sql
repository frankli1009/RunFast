USE [C:\USERS\ADMINISTRATOR\DOCUMENTS\VISUAL STUDIO 2015\PROJECTS\RUNFAST\RUNFAST\APP_DATA\RUNFAST.MDF]
GO

/****** Object: SqlProcedure [dbo].[GetOnlineGame] Script Date: 2017/10/19 19:19:21 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('[dbo].[usp_GetOnlineGame]', 'P') IS NOT NULL
DROP PROC [dbo].[usp_GetOnlineGame]
GO

CREATE PROCEDURE [dbo].[usp_GetOnlineGame]
	@playerId int,
	@playerType smallint,
	@changeTable int,
	@gameId int OUTPUT,
	@turn smallint OUTPUT
AS
	DECLARE @playerCount int, @foundGame int = 0
	SET @turn = 1
	--It doesn't matter whether the player is a VIP. The PlayerID will only be conflict with Guest player.
	IF @playerType > 1
		SET @playerType = 1

	BEGIN TRANSACTION
		-- Kick out non-active game players
		DELETE [dbo].[Game_Player] 
			FROM [dbo].[Game] t1, [dbo].[Game_Player] t2 
			WHERE t1.Id = t2.GameId AND t1.Local = 0 AND t1.Owner = 0 
				AND (DATEDIFF(minute, t2.LastActiveTime, GETDATE()) > 30 OR t2.LastActiveTime IS NULL)

		-- Find the original game to use, delete relative record if wants to change the game table
		SELECT @gameId = t2.GameId, @turn = t2.Turn 
			FROM [dbo].[Game] t1, [dbo].[Game_Player] t2 
			WHERE t1.Id = t2.GameId AND t1.Local = 0 AND t1.Owner = 0 
				AND t2.PlayerId = @playerId AND t2.PlayerType = @playerType
		IF @@ROWCOUNT > 0
		BEGIN
			IF @changeTable = 1
				DELETE [dbo].[Game_Player] WHERE PlayerId = @playerId AND GameId = @gameId AND PlayerType = @playerType
			ELSE
			BEGIN
				-- Found an old game and turn to use
				UPDATE [dbo].[Game_Player] 
					SET Started = 0 
					WHERE GameId = @gameId AND PlayerId = @playerId AND PlayerType = @playerType
				UPDATE [dbo].[Game] 
					SET ShuffleState=0, ReadyState=0 
					WHERE Id = @gameId
				DELETE [dbo].[Game_Card] WHERE GameId = @gameId
				SELECT @foundGame = 1
			END
		END
		ELSE
			SELECT @gameId = 0

		-- If there isn't an old game to use or wants to change the table, find a new game and turn
		IF @foundGame = 0
		BEGIN
			-- Find a game with one or more turns available
			SELECT TOP 1 @gameId = tt.Id, @playerCount = tt.PlayerCount 
				FROM (SELECT t.Id, COUNT(*) as PlayerCount 
					FROM (SELECT t1.Id, t2.PlayerId 
						FROM (SELECT * FROM [dbo].[Game] WHERE Id != @gameId AND Local = 0 AND Owner = 0) t1 LEFT JOIN [dbo].[Game_Player] t2 
						ON t1.Id = t2.GameId) t
					GROUP BY t.Id
					HAVING COUNT(*)<3) tt
				ORDER BY tt.PlayerCount DESC, tt.Id

			if @@ROWCOUNT = 0
			BEGIN
				/* Insert a new game record */
				EXEC [dbo].[usp_NewGame] 0, 0, '', @gameId OUTPUT
				SELECT @turn = 1
			END
			ELSE
			BEGIN
				/* Get the available turn */
				SELECT TOP 1 @turn = T1.Turn 
					FROM (SELECT 1 AS Turn UNION SELECT 2 AS Turn UNION SELECT 3 AS Turn) T1
					WHERE NOT EXISTS(SELECT Turn FROM [dbo].[Game_Player] T2
									 WHERE T2.GameId = @gameId AND T1.Turn = T2.Turn)
					ORDER BY T1.Turn 
				UPDATE [dbo].[Game] 
					SET ShuffleState=0, ReadyState=0 
					WHERE Id = @gameId
				DELETE [dbo].[Game_Card] WHERE GameId = @gameId
			END
			INSERT INTO [dbo].[Game_Player] (GameId, PlayerId, PlayerType, Turn, Started) VALUES (@gameId, @playerId, @playerType, @turn, 0)
		END
	COMMIT

RETURN 0

GO