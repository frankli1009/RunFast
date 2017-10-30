namespace RunFast.Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddTableGuestPlayer : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.GuestPlayer",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UniqueId = c.String(maxLength: 50, unicode: false),
                        Score = c.Int(nullable: false),
                        CreateTime = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.GuestPlayer");
        }
    }
}
