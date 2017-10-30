using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RunFast.Domain.Entities
{
    public class Card
    {
        public int Suit { get; set; }
        public short SuitRank { get; set; }
        public int Pip { get; set; }
        public int PipRank { get; set; }

        public string CardString
        {
            get
            {
                return String.Format("{0},{1},{2},{3}|", Pip, PipRank, Suit, SuitRank);
            }
        }
    }
}
