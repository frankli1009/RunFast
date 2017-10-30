using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RunFast.Domain.Entities
{
    public partial class Game_Card
    {
        public int Id { get; set; }

        public int GameId { get; set; }

        public int PipId { get; set; }

        public int SuitId { get; set; }

        // The turn of the player that this card has been despatched
        public short Dispatched { get; set; }

        // Whether this card has been dealt (taken out and placed to the centre of the table)
        public short Dealt { get; set; }

        [ForeignKey(nameof(PipId))]
        public virtual Pip Pip { get; set; }

        [ForeignKey(nameof(SuitId))]
        public virtual CardSuit CardSuit { get; set; }
    }
}
