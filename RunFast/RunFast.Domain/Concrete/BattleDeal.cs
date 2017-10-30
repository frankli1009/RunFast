using RunFast.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RunFast.Domain.Concrete
{
    public class BattleDeal
    {
        private List<Card> _cards = new List<Card>();

        public int GameId { get; set; }
        public short DealTurn { get; set; }
        public int PlayerId { get; set; }
        public short DealTimes { get; set; }
        public short DealType { get; set; }
        public short DealCount { get; set; }
        public short DealRank { get; set; }
        public short DealSuit { get; set; }
        public List<Card> Cards { get { return _cards; } }
    }
}