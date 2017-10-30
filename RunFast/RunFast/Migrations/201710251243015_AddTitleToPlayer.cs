namespace RunFast.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddTitleToPlayer : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Player", "Title", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Player", "Title");
        }
    }
}
