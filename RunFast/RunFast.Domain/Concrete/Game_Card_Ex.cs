using RunFast.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RunsFast.Domain.Concrete
{
    public class Game_Card_Ex
    {
        public int Id { get; set; }
        public int GameId { get; set; }
        public int PipId { get; set; }
        public int SuitId { get; set; }
        // The turn of the player that this card has been despatched
        public short Dispatched { get; set; }
        // Whether this card has been dealt (taken out and placed to the centre of the table)
        public short Dealt { get; set; }

        public int PipRank { get; set; }
        public short SuitRank { get; set; }

        public Card FormCard()
        {
            return new Card
            {
                Pip = PipId,
                PipRank = PipRank,
                Suit = SuitId,
                SuitRank = SuitRank
            };
        }
    }
}
