namespace RunFast.Domain.Entities
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("Pip")]
    public partial class Pip
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public int Rank { get; set; }
    }
}
