namespace RunFast.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddPlayerToApplicationUser : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Player",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        FirstName = c.String(nullable: false),
                        LastName = c.String(nullable: false),
                        Type = c.Short(nullable: false),
                        UniqueId = c.String(),
                        Score = c.Int(),
                        CreateTime = c.DateTime(nullable: false),
                        ValidUntil = c.DateTime(),
                        QuitTime = c.DateTime(),
                        ApplicationUserId = c.String(maxLength: 128),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.AspNetUsers", t => t.ApplicationUserId)
                .Index(t => t.ApplicationUserId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Player", "ApplicationUserId", "dbo.AspNetUsers");
            DropIndex("dbo.Player", new[] { "ApplicationUserId" });
            DropTable("dbo.Player");
        }
    }
}
