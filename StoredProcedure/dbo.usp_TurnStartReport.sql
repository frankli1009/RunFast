/****** Object: SqlProcedure [dbo].[usp_TurnStartReport] Script Date: 2017/10/28 15:29:21 ******/
USE [C:\USERS\ADMINISTRATOR\DOCUMENTS\VISUAL STUDIO 2015\PROJECTS\RUNFAST\RUNFAST\APP_DATA\RUNFAST.MDF]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('[dbo].[usp_TurnStartReport]', 'P') IS NOT NULL
DROP PROC [dbo].[usp_TurnStartReport]
GO

CREATE PROCEDURE [dbo].[usp_TurnStartReport]
	@gameId int,
	@playerId int, 
	@dealTimes smallint,
	@turn smallint,
	@result smallint OUTPUT
AS
	IF @gameId < 1
	BEGIN
		SET @result = 2
		RETURN
	END

	DECLARE @curPlayerId int, @curDealTimes smallint
	SELECT @curDealTimes = CASE WHEN DealTimes IS NULL THEN 1 ELSE DealTimes + 1 END, @curPlayerId = PlayerId 
		FROM [dbo].[Battle]
		WHERE GameId = @gameId
	IF @curDealTimes = @dealTimes AND @curPlayerId = @playerId
	BEGIN
		--The dealTimes reported has been passed (considering temporary internet breakdown)
		UPDATE [dbo].[Battle] 
			SET TurnTime = GetDate()
			WHERE GameId = @gameId
		SET @result = 0
	END
	ELSE
	BEGIN
		-- Current deal player has changed due to turn start reporter's network or what else
		SET @result = 1
	END

RETURN 0
