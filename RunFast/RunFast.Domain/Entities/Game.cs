namespace RunFast.Domain.Entities
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("Game")]
    public partial class Game
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        [Required]
        public bool Local { get; set; }

        public int? Owner { get; set; }

        public short ShuffleState { get; set; }
        public short ReadyState { get; set; }

        public DateTime CreateTime { get; set; }
    }
}
