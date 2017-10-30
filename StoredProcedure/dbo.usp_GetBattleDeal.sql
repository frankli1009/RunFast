/****** Object: SqlProcedure [dbo].[usp_GetBattleDeal] Script Date: 2017/10/21 18:29:21 ******/
USE [C:\USERS\ADMINISTRATOR\DOCUMENTS\VISUAL STUDIO 2015\PROJECTS\RUNFAST\RUNFAST\APP_DATA\RUNFAST.MDF]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('[dbo].[usp_GetBattleDeal]', 'P') IS NOT NULL
DROP PROC [dbo].[usp_GetBattleDeal]
GO

CREATE PROCEDURE [dbo].[usp_GetBattleDeal]
	@gameId int,
	@playerId int,
	@dealTimes smallint,
	@dealAmount smallint OUTPUT,
	@dealTurn smallint OUTPUT,
	@dealType smallint OUTPUT
AS
	DECLARE @params NVARCHAR(MAX) = 
		(SELECT @dealTimes AS "DealTimes" FOR JSON PATH)
	INSERT INTO [dbo].[LogDBOperation] (GameId, PlayerId, Operation, Parameters, LogType)
		VALUES (@gameId, @playerId, '[dbo].[usp_GetBattleDeal]', @params, 1)

	SET @dealAmount = -1
	SET @dealTurn = 0
	SET @dealType = 0

	DECLARE @TableDealCards TABLE (
		DealTimes smallint,
		DealTurn smallint,
		DealType smallint,
		DealRank smallint,
		DealSuit smallint,
		DealPipId int,
		DealPipRank int,
		DealSuitId int,
		DealSuitRank smallint
	)
	IF @gameId > 0 AND @dealTimes > 0
	BEGIN
		DECLARE @currentDealTimes smallint, @lastDealTimes smallint, @turnTime DATETIME
		SELECT @currentDealTimes = (CASE WHEN t1.DealTimes IS NULL THEN 0 ELSE t1.DealTimes END),
			   @lastDealTimes = (CASE WHEN t1.LastDealTimes IS NULL THEN 0 ELSE t1.LastDealTimes END),
			   @dealTurn = t2.Turn, @dealType = (CASE WHEN t1.Type IS NULL THEN 0 ELSE t1.Type END),
			   @turnTime = TurnTime 
			FROM [dbo].[Battle] t1, [dbo].[Game_Player] t2
			WHERE t1.GameId = @gameId AND t2.GameId = @gameId AND t1.PlayerId = t2.PlayerId
		print 'After select from battle'
		print @currentDealTimes
		print @lastDealTimes
		print @dealTimes
		print @dealTurn
		print @dealType
		IF @currentDealTimes < @dealTimes
		BEGIN
			--The player with current turn has not made a deal
			DECLARE @timeLimit int
			IF @dealTimes = 1
				SET @timeLimit = 25 --20 seconds max for starting a game + 5 senconds dispatch
			ELSE 
				SET @timeLimit = 15 --15 seconds max for continuing a game
			IF DATEDIFF(SECOND, @turnTime, GETDATE()) > @timeLimit
			BEGIN
				DECLARE @dealResult smallint
				EXEC [dbo].[usp_MakeAutoDeal] @gameId, @dealTurn, @dealType, @dealTimes, @dealResult OUT
				SELECT @currentDealTimes = (CASE WHEN t1.DealTimes IS NULL THEN 0 ELSE t1.DealTimes END),
					   @lastDealTimes = (CASE WHEN t1.LastDealTimes IS NULL THEN 0 ELSE t1.LastDealTimes END),
					   @dealTurn = t2.Turn, @dealType = (CASE WHEN t1.Type IS NULL THEN 0 ELSE t1.Type END),
					   @turnTime = TurnTime 
					FROM [dbo].[Battle] t1, [dbo].[Game_Player] t2
					WHERE t1.GameId = @gameId AND t2.GameId = @gameId AND t1.PlayerId = t2.PlayerId
				print 'After re-select from battle'
				print @currentDealTimes
				print @lastDealTimes
				print @dealTimes
				print @dealTurn
				print @dealType
			END
		END
		IF @currentDealTimes < @dealTimes
			SET @dealAmount = 0
		ELSE 
		BEGIN
			--Add all deal info of passed deals from @dealTimes to @currentDealTimes (considering temporary internet breakdown)
			SET @dealAmount = @currentDealTimes - @dealTimes + 1
			DECLARE @times smallint = @dealTimes
			WHILE @times <= @currentDealTimes
			BEGIN
				IF @times = @lastDealTimes
					--Add last valid deal info (not a pass deal)
					INSERT INTO @TableDealCards
						SELECT @times, t1.Dispatched, t4.Type, t4.Rank, t4.Suit, t1.PipId, t2.Rank, t1.SuitId, t3.Rank
						FROM [dbo].[Game_Card] t1, [dbo].[Pip] t2, [dbo].[Suit] t3, [dbo].[Battle] t4
						WHERE t1.GameId = @gameId AND t4.GameId = t1.GameId AND t1.Dealt = @times AND
							t1.PipId = t2.Id AND t1.SuitId = t3.Id
				ELSE
					--Deal type and the highest rank are not important when the deal is not the last valid deal (not pass)
					 INSERT INTO @TableDealCards
						SELECT @times, t1.Dispatched, 0, 0, 0, t1.PipId, t2.Rank, t1.SuitId, t3.Rank
						FROM [dbo].[Game_Card] t1, [dbo].[Pip] t2, [dbo].[Suit] t3
						WHERE t1.GameId = @gameId AND t1.Dealt = @times AND
							t1.PipId = t2.Id AND t1.SuitId = t3.Id

				SET @times = @times + 1
			END
		END
	END
	SELECT * FROM @TableDealCards ORDER BY DealTimes, DealPipRank, DealSuitRank

RETURN 0
