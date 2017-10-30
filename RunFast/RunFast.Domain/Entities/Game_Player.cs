namespace RunFast.Domain.Entities
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class Game_Player
    {
        public int Id { get; set; }

        public int GameId { get; set; }

        public int PlayerId { get; set; }

        public short PlayerType { get; set; }

        public short Turn { get; set; }

        public short Started { get; set; }

        public DateTime? LastActiveTime { get; set; }
    }
}
