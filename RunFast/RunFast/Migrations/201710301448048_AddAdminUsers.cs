namespace RunFast.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddAdminUsers : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.AdminUsers",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserName = c.String(),
                        UserType = c.Short(nullable: false),
                        Password = c.String(),
                        PwdIndexes = c.String(),
                        ExtraInfo = c.String(),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.AdminUsers");
        }
    }
}
