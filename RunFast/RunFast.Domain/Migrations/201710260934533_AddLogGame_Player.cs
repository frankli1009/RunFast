namespace RunFast.Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddLogGame_Player : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.LogGame_Player",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        LogGameId = c.Int(nullable: false),
                        GameId = c.Int(nullable: false),
                        PlayerId = c.Int(nullable: false),
                        Score = c.Int(),
                        UpdateTime = c.DateTime(),
                    })
                .PrimaryKey(t => t.Id);
            
            DropColumn("dbo.LogGame", "PlayerId1");
            DropColumn("dbo.LogGame", "Score1");
            DropColumn("dbo.LogGame", "PlayerId2");
            DropColumn("dbo.LogGame", "Score2");
            DropColumn("dbo.LogGame", "PlayerId3");
            DropColumn("dbo.LogGame", "Score3");
        }
        
        public override void Down()
        {
            AddColumn("dbo.LogGame", "Score3", c => c.Short());
            AddColumn("dbo.LogGame", "PlayerId3", c => c.Int(nullable: false));
            AddColumn("dbo.LogGame", "Score2", c => c.Short());
            AddColumn("dbo.LogGame", "PlayerId2", c => c.Int(nullable: false));
            AddColumn("dbo.LogGame", "Score1", c => c.Short());
            AddColumn("dbo.LogGame", "PlayerId1", c => c.Int(nullable: false));
            DropTable("dbo.LogGame_Player");
        }
    }
}
