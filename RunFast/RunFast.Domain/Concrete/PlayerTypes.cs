using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RunFast.Domain.Concrete
{
    public class PlayerTypes
    {
        private static Dictionary<short, string> _playerTypes = new Dictionary<short, string>();

        public static Dictionary<short, string> Types { get { return _playerTypes; } }
    }
}
