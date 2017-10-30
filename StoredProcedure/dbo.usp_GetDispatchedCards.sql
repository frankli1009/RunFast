/****** Object: SqlProcedure [dbo].[usp_GetDispatchedCards] Script Date: 2017/10/21 18:29:21 ******/
USE [C:\USERS\ADMINISTRATOR\DOCUMENTS\VISUAL STUDIO 2015\PROJECTS\RUNFAST\RUNFAST\APP_DATA\RUNFAST.MDF]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('[dbo].[usp_GetDispatchedCards]', 'P') IS NOT NULL
DROP PROC [dbo].[usp_GetDispatchedCards]
GO

CREATE PROCEDURE [dbo].[usp_GetDispatchedCards]
	@gameId int,
	@firstTurn smallint OUTPUT
AS
	IF @gameId < 1
		RETURN

	--Find the turn with spades 3 who will get the first turn to start a game
	SELECT @firstTurn = Dispatched 
		FROM [dbo].[Game_Card]
		WHERE GameId = @gameId AND PipId = 3 AND SuitId = 2
	--Return the game cards record
	SELECT t1.*, t2.Rank AS PipRank, t3.Rank AS SuitRank 
		FROM [dbo].[Game_Card] t1, [dbo].[Pip] t2, [dbo].[Suit] t3 
		WHERE t1.GameId = @gameId and t1.PipId = t2.Id and t1.SuitId = t3.Id 
		ORDER BY t1.Dispatched

RETURN 0
