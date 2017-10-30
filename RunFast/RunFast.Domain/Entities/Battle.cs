namespace RunFast.Domain.Entities
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("Battle")]
    public partial class Battle
    {
        public int Id { get; set; }

        public int GameId { get; set; }

        public int PlayerId { get; set; }

        public int? LastPlayerId { get; set; }

        public short? LastDealTimes { get; set; }

        public short? Type { get; set; }

        public short? Rank { get; set; }

        public short? Suit { get; set; }

        public short? Amount { get; set; }

        public short? DealTimes { get; set; }

        public DateTime TurnTime { get; set; }
    }
}
