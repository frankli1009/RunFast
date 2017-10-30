using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RunFast.Domain.Concrete
{
    public class BattleDeal_Ex
    {
        public short DealTimes { get; set; }
        public short DealTurn { get; set; }
        public short DealType { get; set; }
        public short DealRank { get; set; }
        public short DealSuit { get; set; }
        public int DealPipId { get; set; }
        public int DealPipRank { get; set; }
        public int DealSuitId { get; set; }
        public short DealSuitRank { get; set; }
    }
}
