/****** Object: SqlProcedure [dbo].[usp_BattleDealReport] Script Date: 2017/10/21 18:29:21 ******/
USE [C:\USERS\ADMINISTRATOR\DOCUMENTS\VISUAL STUDIO 2015\PROJECTS\RUNFAST\RUNFAST\APP_DATA\RUNFAST.MDF]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('[dbo].[usp_BattleDealReport]', 'P') IS NOT NULL
DROP PROC [dbo].[usp_BattleDealReport]
GO

CREATE PROCEDURE [dbo].[usp_BattleDealReport]
	@gameId int,
	@playerId int, 
	@dealTimes smallint,
	@dealTurn smallint, 
	@dealType smallint, 
	@dealCount smallint, 
	@dealRank smallint, 
	@dealSuit smallint, 
	@dealCards CardList READONLY,
	@dealResult smallint OUTPUT,
	@jsonRealDealCard varchar(200) OUTPUT
AS
	DECLARE @params NVARCHAR(MAX) = 
		(SELECT @dealTimes AS "DealTimes", @dealTurn AS "DealTurn", @dealType AS "DealType",
		 @dealCount AS "DealCount", @dealRank AS "DealRank", @dealSuit AS "DealSuit",
		 (SELECT * FROM @dealCards FOR JSON PATH) AS "DealCards" FOR JSON PATH)
	INSERT INTO [dbo].[LogDBOperation] (GameId, PlayerId, Operation, Parameters, LogType)
		VALUES (@gameId, @playerId, '[dbo].[usp_BattleDealReport]', @params, 1)

	IF @gameId < 1
	BEGIN
		SET @dealResult = 2
		RETURN
	END

	DECLARE @nextTurn smallint, @lastPlayerId int, @nextPlayerId int, @curDealTimes smallint
	SELECT @nextTurn = CASE @dealTurn WHEN 3 THEN 1 ELSE @dealTurn + 1 END
	SELECT @nextPlayerId = PlayerId FROM [dbo].[Game_Player] WHERE GameId = @gameId AND TURN = @nextTurn
	SELECT @curDealTimes = CASE WHEN DealTimes IS NULL THEN 1 ELSE DealTimes + 1 END, @lastPlayerId = LastPlayerId 
		FROM [dbo].[Battle]
		WHERE GameId = @gameId
	IF @curDealTimes <> @dealTimes
	BEGIN
		--The dealTimes reported has been passed (considering temporary internet breakdown on the player's side)
		Set @params = (SELECT 'Current deal times is not the same as deal times.' AS ErrorMsg,
			@curDealTimes AS CurDealTimes, @dealTimes AS DealTimes FOR JSON PATH)
		INSERT INTO [dbo].[LogDBOperation] (GameId, PlayerId, Operation, LogType, LogMessage)
			VALUES (@gameId, @playerId, '[dbo].[usp_BattleDealReport]', 2, @params)

		SET @dealResult = 1
		SET @jsonRealDealCard = (SELECT t1.PipId AS Pip, t2.Rank AS PipRank, t1.SuitId AS Suit, t3.Rank AS SuitRank
			FROM [dbo].[Game_Card] t1, [dbo].[Pip] t2, [dbo].[Suit] t3
			WHERE t1.GameId = @gameId AND t1.Dealt = @dealTimes
				AND t1.PipId = t2.Id AND t1.SuitId = t3.Id
			FOR JSON PATH) 
		IF @jsonRealDealCard IS NULL
			SET @jsonRealDealCard = ''
	END
	ELSE
	BEGIN
		SET @dealResult = 0
		IF @dealType = 0
		BEGIN
			--Process PASS
			IF @lastPlayerId = @nextPlayerId
				--The next player is the previous dealing player, starting a new battle 
				UPDATE [dbo].[Battle] 
					SET PlayerId = @nextPlayerId, Type=NULL, LastPlayerId = NULL, LastDealTimes = NULL, 
						TurnTime = GetDate(), DealTimes = @dealTimes 
					WHERE GameId = @gameId
			ELSE
				UPDATE [dbo].[Battle] 
					SET PlayerId = @nextPlayerId, TurnTime = GetDate(), DealTimes = @dealTimes 
					WHERE GameId = @gameId
		END
		ELSE
		BEGIN
			BEGIN TRANSACTION
				--Process a deal, firstly update table Battle
				UPDATE [dbo].[Battle] 
					SET LastPlayerId = @playerId, LastDealTimes = @dealTimes, Type = @dealType,
						PlayerId = @nextPlayerId, Rank = @dealRank,
						Suit = @dealSuit, Amount = @dealCount,
						TurnTime = GetDate(), DealTimes = @dealTimes 
					WHERE GameId = @gameId

				--Then update table Game_Card
				--Change the way of using Cursor to using join
				/*
				--Update each row by using CURSOR
				DECLARE @pipId int, @suitId int
				DECLARE db_cursor CURSOR FOR  
					SELECT Pip, Suit
					FROM @dealCards 

				OPEN db_cursor
				FETCH NEXT FROM db_cursor INTO @pipId, @suitId

				WHILE @@FETCH_STATUS = 0
				BEGIN
					UPDATE [dbo].[Game_Card] 
						SET Dealt = @dealTimes
						WHERE GameId = @gameId AND PipId = @pipId AND SuitId = @suitId

					FETCH NEXT FROM db_cursor INTO @pipId, @suitId
				END

				CLOSE db_cursor
				DEALLOCATE db_cursor
				*/
				--Update all rows by join
				UPDATE [dbo].[Game_Card] 
						SET Dealt = @dealTimes
						FROM [dbo].[Game_Card] t1, @dealCards t2 
						WHERE t1.GameId = @gameId AND t1.PipId = t2.Pip AND t1.SuitId = t2.Suit
			COMMIT
		END
	END

RETURN 0
