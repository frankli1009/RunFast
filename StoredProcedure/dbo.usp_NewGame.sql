USE [C:\USERS\ADMINISTRATOR\DOCUMENTS\VISUAL STUDIO 2015\PROJECTS\RUNFAST\RUNFAST\APP_DATA\RUNFAST.MDF]
GO

/****** Object: SqlProcedure [dbo].[NewGame] Script Date: 2017/10/18 19:01:56 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('[dbo].[usp_NewGame]', 'P') IS NOT NULL
DROP PROC [dbo].[usp_NewGame]
GO

CREATE PROCEDURE [dbo].[usp_NewGame]
	@local int = 0,
	@owner int = 0,
	@name varchar(30) = '',
	@gameId int OUTPUT
AS
	DECLARE @gameCount int, @gameName varchar(30)
	IF @local = 1 
		SELECT @gameName = 'Table'
	ELSE IF @owner = 1
		SELECT @gameName = @name
	ELSE
	BEGIN
		SELECT @gameCount = COUNT(*) FROM [dbo].[Game] WHERE Local = 0 and Owner = 0
		SELECT @gameName = 'Table' + CONVERT(varchar(30), @gameCount+1)
	END
	INSERT INTO [dbo].[Game] (Name, Local, Owner, CreateTime) 
		VALUES (@gameName, @local, @owner, GETDATE())
	SELECT @gameId = SCOPE_IDENTITY()

RETURN 0

GO