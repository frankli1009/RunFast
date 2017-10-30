/****** Object: SqlProcedure [dbo].[GetLocalGame] Script Date: 2017/10/19 17:29:21 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('[dbo].[usp_ShuffleAndDispatchCards]', 'P') IS NOT NULL
DROP PROC [dbo].[usp_ShuffleAndDispatchCards]
GO

CREATE PROCEDURE [dbo].[usp_ShuffleAndDispatchCards]
	@gameId int,
	@firstTurn smallint OUTPUT
AS
	IF @gameId < 1
		RETURN

	BEGIN TRANSACTION
		--Delete records when game over
		--DELETE FROM [dbo].[Game_Card] where GameId = @gameId
		IF NOT EXISTS(SELECT Id FROM [dbo].[Game_Card] where GameId = @gameId)
		BEGIN
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
		END
		--Find the turn with spades 3 who will get the first turn to start a game
		SELECT @firstTurn = Dispatched 
			FROM [dbo].[Game_Card]
			WHERE GameId = @gameId AND PipId = 3 AND SuitId = 2
		--Return the game cards record
		SELECT t1.*, t2.Rank AS PipRank, t3.Rank AS SuitRank 
			FROM [dbo].[Game_Card] t1, [dbo].[Pip] t2, [dbo].[Suit] t3 
			WHERE GameId = @gameId and t1.PipId = t2.Id and t1.SuitId = t3.Id 
			ORDER BY Dispatched

RETURN 0
