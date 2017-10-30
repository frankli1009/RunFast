using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RunFast.Domain.Entities
{
    public class PlayerCards
    {
        private List<Card> _cards;

        public int PlayerId { get; set; }
        public string PlayerName { get; set; }
        public string Portrait { get; set; }
        public short Turn { get; set; }
        public int Score { get; set; }
        public string UniqueId { get; set; }
        public int GameCount { get; set; }
        public DateTime AidedTime { get; set; }
        public string PlayerType { get; set; }

        public List<Card> Cards { get { return _cards; } }

        public PlayerCards()
        {
            _cards = new List<Card>();
        }

        public string CardsString
        {
            get
            {
                string result = "";
                foreach (var card in Cards)
                {
                    result += card.CardString;
                }
                return result;
            }
        }
    }
}
