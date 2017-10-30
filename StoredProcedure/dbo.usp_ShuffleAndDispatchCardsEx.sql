/****** Object: SqlProcedure [dbo].[usp_ShuffleAndDispatchCardsEx] Script Date: 2017/10/21 18:49:21 ******/
USE [C:\USERS\ADMINISTRATOR\DOCUMENTS\VISUAL STUDIO 2015\PROJECTS\RUNFAST\RUNFAST\APP_DATA\RUNFAST.MDF]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('[dbo].[usp_ShuffleAndDispatchCardsEx]', 'P') IS NOT NULL
DROP PROC [dbo].[usp_ShuffleAndDispatchCardsEx]
GO

CREATE PROCEDURE [dbo].[usp_ShuffleAndDispatchCardsEx]
	@gameId int
AS
	IF @gameId < 1
		RETURN

	--BEGIN TRANSACTION
		--Only called by trigger, so do not use begin transaction/commit
		--Prepare the cards and battle
		--Delete game cards if exist
		DELETE FROM [dbo].[Game_Card] where GameId = @gameId
		--Insert new records in random order
		INSERT INTO [dbo].[Game_Card] (GameId, PipId, SuitId, Dispatched, Dealt)
			SELECT @gameId, PipId, SuitId, 0, 0
			FROM [dbo].[Game_Card]
			WHERE GameId = 0
			ORDER BY NEWID()
		--Update dispatched to dispatch cards
		--TOP 16 dispatched to turn 1
		UPDATE [dbo].[Game_Card] 
			SET Dispatched = 1 
			WHERE GameId = @gameId AND Id IN 
				(SELECT TOP 16 Id FROM [dbo].[Game_Card]
					WHERE GameId = @gameId AND Dispatched = 0)
		--Second TOP 16 dispatched to turn 2
		UPDATE [dbo].[Game_Card] 
			SET Dispatched = 2 
			WHERE GameId = @gameId AND Id IN 
				(SELECT TOP 16 Id FROM [dbo].[Game_Card]
					WHERE GameId = @gameId AND Dispatched = 0)
		--The other 16 dispatched to turn 3
		UPDATE [dbo].[Game_Card] 
			SET Dispatched = 3 
			WHERE GameId = @gameId AND Dispatched = 0

		--Start the game from the player with the first turn
		DECLARE @firstPlayerId int
		--Find the turn with spades 3 who will get the first turn to start a game
		SELECT @firstPlayerId = t2.PlayerId 
			FROM [dbo].[Game_Card] t1, [dbo].[Game_Player] t2
			WHERE t1.GameId = @gameId AND t1.GameId = t2.GameId AND t1.Dispatched = t2.Turn 
				AND t1.PipId = 3 AND t1.SuitId = 2
		--Init the battle state
		IF EXISTS(SELECT Id FROM [dbo].[Battle] WHERE GameId = @gameId)
			UPDATE [dbo].[Battle] 
				SET PlayerId = @firstPlayerId, TurnTime = GetDate(), Type = NULL, LastPlayerId = NULL, 
					DealTimes = NULL, LastDealTimes = NULL 
				WHERE GameId = @gameId
		ELSE
			INSERT INTO [dbo].[Battle] (GameId, PlayerId, TurnTime) VALUES (@gameId, @firstPlayerId, GetDate())
	--COMMIT

RETURN 0
