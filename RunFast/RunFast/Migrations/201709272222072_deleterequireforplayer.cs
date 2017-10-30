namespace RunFast.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class deleterequireforplayer : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.Player", "FirstName", c => c.String());
            AlterColumn("dbo.Player", "LastName", c => c.String());
        }
        
        public override void Down()
        {
            AlterColumn("dbo.Player", "LastName", c => c.String(nullable: false));
            AlterColumn("dbo.Player", "FirstName", c => c.String(nullable: false));
        }
    }
}
