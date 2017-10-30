namespace RunFast.Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class InitalWithoutPlayer : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Battle",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        GameId = c.Int(nullable: false),
                        PlayerId = c.Int(),
                        LastPlayerId = c.Int(),
                        Type = c.Short(),
                        Rank = c.String(maxLength: 2, unicode: false),
                        Kind = c.Short(),
                        Amount = c.Short(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.BillAddress",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        PlayerId = c.Int(nullable: false),
                        Mobile = c.String(maxLength: 50, unicode: false),
                        Telephone = c.String(maxLength: 50, unicode: false),
                        AddressLine1 = c.String(nullable: false, maxLength: 100, unicode: false),
                        AddressLine2 = c.String(maxLength: 100, unicode: false),
                        City = c.String(nullable: false, maxLength: 50, unicode: false),
                        Province = c.String(maxLength: 50, unicode: false),
                        Country = c.String(nullable: false, maxLength: 50, unicode: false),
                        PostCode = c.String(nullable: false, maxLength: 50, unicode: false),
                        CreateTime = c.DateTime(nullable: false),
                        ValidUntil = c.DateTime(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.BillType",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(nullable: false, maxLength: 50, unicode: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.Game_Card",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        GameId = c.Int(nullable: false),
                        PipId = c.Int(nullable: false),
                        SuitId = c.Int(nullable: false),
                        Dispatched = c.Int(nullable: false),
                        Dealt = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Suit", t => t.SuitId, cascadeDelete: true)
                .ForeignKey("dbo.Pip", t => t.PipId, cascadeDelete: true)
                .Index(t => t.PipId)
                .Index(t => t.SuitId);
            
            CreateTable(
                "dbo.Suit",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(nullable: false, maxLength: 50, unicode: false),
                        Rank = c.Short(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.Pip",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(nullable: false, unicode: false),
                        Rank = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.Game_Player",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        GameId = c.Int(nullable: false),
                        PlayerId = c.Int(nullable: false),
                        Turn = c.Short(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.Game",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(nullable: false, maxLength: 50, unicode: false),
                        Local = c.Boolean(nullable: false),
                        Owner = c.Int(),
                        CreateTime = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.LogBill",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        PlayerId = c.Int(nullable: false),
                        BillType = c.Short(nullable: false),
                        Amount = c.Decimal(nullable: false, precision: 10, scale: 2),
                        BillTime = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.LogGame",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        GameId = c.Int(nullable: false),
                        PlayerId1 = c.Int(nullable: false),
                        Score1 = c.Short(),
                        PlayerId2 = c.Int(nullable: false),
                        Score2 = c.Short(),
                        PlayerId3 = c.Int(nullable: false),
                        Score3 = c.Short(),
                        StartTime = c.DateTime(nullable: false),
                        EndTime = c.DateTime(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.Message",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        GameId = c.Int(nullable: false),
                        PlayerId = c.Int(nullable: false),
                        Message = c.String(nullable: false, unicode: false),
                        CreateTime = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.PlayerType",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(nullable: false, unicode: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.Type",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(nullable: false, maxLength: 50, unicode: false),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Game_Card", "PipId", "dbo.Pip");
            DropForeignKey("dbo.Game_Card", "SuitId", "dbo.Suit");
            DropIndex("dbo.Game_Card", new[] { "SuitId" });
            DropIndex("dbo.Game_Card", new[] { "PipId" });
            DropTable("dbo.Type");
            DropTable("dbo.PlayerType");
            DropTable("dbo.Message");
            DropTable("dbo.LogGame");
            DropTable("dbo.LogBill");
            DropTable("dbo.Game");
            DropTable("dbo.Game_Player");
            DropTable("dbo.Pip");
            DropTable("dbo.Suit");
            DropTable("dbo.Game_Card");
            DropTable("dbo.BillType");
            DropTable("dbo.BillAddress");
            DropTable("dbo.Battle");
        }
    }
}
