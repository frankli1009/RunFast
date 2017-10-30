namespace RunFast.Domain.Entities
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("PlayerType")]
    public partial class PlayerType
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }
    }
}
