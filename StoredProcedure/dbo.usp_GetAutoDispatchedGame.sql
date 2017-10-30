USE [C:\USERS\ADMINISTRATOR\DOCUMENTS\VISUAL STUDIO 2015\PROJECTS\RUNFAST\RUNFAST\APP_DATA\RUNFAST.MDF]
GO

/****** Object: SqlProcedure [dbo].[GetAutoDispatchedGame] Script Date: 2017/10/18 19:12:03 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('[dbo].[usp_GetAutoDispatchedGame]', 'P') IS NOT NULL
DROP PROC [dbo].[usp_GetAutoDispatchedGame]
GO

CREATE PROCEDURE [dbo].[usp_GetAutoDispatchedGame]
	@playerId int
AS
	BEGIN TRANSACTION
		DECLARE @gameId int, @playerCount int
		SELECT TOP 1 @gameId = t.GameId, @playerCount = t.PlayerCount FROM
			(SELECT t2.GameId, count(*) as PlayerCount 
			 FROM [dbo].[Game] t1, [dbo].[Game_Player] t2 
			 WHERE t1.Id = t2.GameId AND t1.Local = 0 AND t1.Owner = 0
			 GROUP BY t2.GameId) t
		WHERE t.PlayerCount<3
		ORDER BY t.PlayerCount DESC, t.GameId

		if @@ROWCOUNT = 0
		BEGIN
			/* Insert a new game record */
			EXEC [dbo].[usp_NewGame] 0, 0, '', @gameId OUTPUT
		END
		DECLARE @turn int
		IF(NOT EXISTS(SELECT * FROM [dbo].[Game_Player] t2 WHERE t2.GameId = @gameId AND t2.Turn = 1)) SELECT @turn = 1
		ELSE IF(NOT EXISTS(SELECT * FROM [dbo].[Game_Player] t2 WHERE t2.GameId = @gameId AND t2.Turn = 2)) SELECT @turn = 2
		ELSE IF(NOT EXISTS(SELECT * FROM [dbo].[Game_Player] t2 WHERE t2.GameId = @gameId AND t2.Turn = 3)) SELECT @turn = 3
		INSERT INTO [dbo].[Game_Player] (GameId, PlayerId, Turn, Started) VALUES (@gameId, @playerId, @turn, 0)
		SELECT @gameId, @turn
	COMMIT

RETURN 0

GO