/****** Object: SqlProcedure [dbo].[usp_BattleDealReport] Script Date: 2017/10/27 17:29:21 ******/
USE [C:\USERS\ADMINISTRATOR\DOCUMENTS\VISUAL STUDIO 2015\PROJECTS\RUNFAST\RUNFAST\APP_DATA\RUNFAST.MDF]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('[dbo].[usp_MakeAutoDeal]', 'P') IS NOT NULL
DROP PROC [dbo].[usp_MakeAutoDeal]
GO

CREATE PROCEDURE [dbo].[usp_MakeAutoDeal]
	@gameId int, 
	@dealTurn int, 
	@dealType smallint, 
	@dealTimes smallint,
	@dealResult smallint OUTPUT
AS
	DECLARE @playerId int, @dealCount smallint = 1, @dealRank smallint = 14
	DECLARE @dealSuit smallint = 0, @dealCards CardList
	SELECT @playerId = PlayerId FROM [dbo].[Game_Player] WHERE GameId = @gameId AND Turn = @dealTurn

	IF @dealType = 0
	BEGIN
		DECLARE @pipId int, @suitId int, @pipRank int, @suitRank smallint
		SET @dealType = 1
		SELECT TOP 1 @pipId = t1.PipId, @suitId = t1.SuitId, @pipRank = t2.Rank, @suitRank = t3.Rank 
			FROM [dbo].[Game_Card] t1, [dbo].[Pip] t2, [dbo].[Suit] t3
			WHERE GameId = @gameId AND Dispatched = @dealTurn AND (Dealt = 0 OR Dealt IS NULL)
				AND t1.PipId = t2.Id AND t1.SuitId = t3.Id
			ORDER BY t2.Rank DESC, t3.Rank DESC
		INSERT INTO @dealCards (Pip, PipRank, Suit, SuitRank) VALUES (@pipId, @pipRank, @suitId, @suitRank)
		SET @dealRank = @pipRank
		SET @dealSuit = @suitRank
	END
	ELSE
		SET @dealType = 0
	DECLARE @jsonRealDealCard varchar(200) 
	EXEC [dbo].[usp_BattleDealReport] @gameId, @playerId, @dealTimes, 
		@dealTurn, @dealType, @dealCount, @dealRank, @dealSuit, @dealCards, 
		@dealResult OUT, @jsonRealDealCard OUT

RETURN 0
