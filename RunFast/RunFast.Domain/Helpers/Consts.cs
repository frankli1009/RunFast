using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RunFast.Domain.Helpers
{
    public static class Consts
    {
        public enum ScoreType : int
        {
            STGame = 0,
            STAward = -1,
            STAid = -2,
            STBuy = -3
        };
    }
}
