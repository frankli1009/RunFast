/****** Object: SqlType [dbo].[CardList] Script Date: 2017/10/21 04:49:21 ******/
USE [C:\USERS\ADMINISTRATOR\DOCUMENTS\VISUAL STUDIO 2015\PROJECTS\RUNFAST\RUNFAST\APP_DATA\RUNFAST.MDF]
GO

IF TYPE_ID('[dbo].[CardList]') IS NOT NULL
DROP TYPE [dbo].[CardList]
GO

CREATE TYPE [dbo].[CardList]
AS TABLE (
	[Pip] [INT] NULL,
	[PipRank] [INT] NULL,
	[Suit] [INT] NULL,
	[SuitRank] [SMALLINT] NULL
);
