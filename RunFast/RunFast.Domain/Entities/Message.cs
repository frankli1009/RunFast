namespace RunFast.Domain.Entities
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("Message")]
    public partial class Message
    {
        public int Id { get; set; }

        public int GameId { get; set; }

        public int PlayerId { get; set; }

        [Column("Message")]
        [Required]
        public string Message1 { get; set; }

        public DateTime CreateTime { get; set; }
    }
}
