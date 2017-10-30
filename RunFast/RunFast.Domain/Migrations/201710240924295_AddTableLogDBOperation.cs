namespace RunFast.Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddTableLogDBOperation : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.LogDBOperation",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        GameId = c.Int(),
                        PlayerId = c.Int(),
                        Operation = c.String(unicode: false),
                        Parameters = c.String(unicode: false),
                        LogType = c.Short(nullable: false),
                        LogMessage = c.String(unicode: false),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.LogDBOperation");
        }
    }
}
