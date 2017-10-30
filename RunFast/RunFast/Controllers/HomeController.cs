using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using RunFast.Domain.Abstract;
using RunFast.Domain.Concrete;
using RunFast.Domain.Entities;
using RunFast.Domain.Helpers;
using RunFast.Infrastructure;
using RunFast.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;

namespace RunFast.Controllers
{
    public class HomeController: Controller
    {
        private IGameRepository _gameRepository;
        private ApplicationDbContext _dbcontext;
        private HttpContextBase _httpContextBase;

        public HomeController(IGameRepository repository, HttpContextBase httpContextBase)
        {
            this._gameRepository = repository;
            this._dbcontext = new ApplicationDbContext();
            this._httpContextBase = httpContextBase;

            InitPlayerTypes(repository);
        }

        private static void InitPlayerTypes(IGameRepository repository)
        {
            if (PlayerTypes.Types.Count == 0)
            {
                PlayerTypes.Types.Add(0, "Guest");
                foreach (var playerType in repository.PlayerTypes)
                {
                    PlayerTypes.Types.Add((short)playerType.Id, playerType.Name);
                }
            }
        }

        public ActionResult Index()
        {
            // Rerun the Configuration.Seed
            // But the following codes do not work
            // It works by PM>Get-Migrations + PM>update-database -TargetMigration:"lastMigrationName"

            //Domain.Migrations.Configuration configuration = new Domain.Migrations.Configuration();
            //configuration.ContextType = typeof(RunFastDbContext);
            //var migrator = new System.Data.Entity.Migrations.DbMigrator(configuration);

            ////This will get the SQL script which will update the DB and write it to debug
            //var scriptor = new System.Data.Entity.Migrations.Infrastructure.MigratorScriptingDecorator(migrator);
            //string script = scriptor.ScriptUpdate(sourceMigration: null, targetMigration: null).ToString();
            //System.Diagnostics.Debug.Write(script);

            ////This will run the migration update script and will run Seed() method
            //migrator.Update();

            // End of rerun the Configuration.Seed

            var loggedIn = 0;
            //if (System.Web.HttpContext.Current.User != null && System.Web.HttpContext.Current.User.Identity.IsAuthenticated)
            if (_httpContextBase.User != null && _httpContextBase.User.Identity.IsAuthenticated)
                loggedIn = 1;
            ViewBag.LoggedIn = loggedIn;

            return View();
        }

        public ActionResult LocalGame(string uniqueId)
        {
            DomainPlayer player = GetCurPlayer(uniqueId);

            GameProcessor gameProcessor = new GameProcessor(this._gameRepository, _dbcontext, player);
            gameProcessor.NewLocalGame();
            return View(gameProcessor);
        }

        // Receive the game over report to save the new points that a player gets and reset the environment for new game
        public JsonResult GameOver(GameReportModel gameReportModel)
        {
            if(gameReportModel != null && gameReportModel.GameId != 0)
            {
                int score = 0;
                DomainPlayer player = GetCurPlayer(gameReportModel.UniqueId);
                if(player.ApplicationUserId != "") // Registered or VIP Player
                {
                    // Update score from current game
                    Player curPlayer = _dbcontext.Players.First(p => p.ApplicationUserId == player.ApplicationUserId);
                    curPlayer.Score += gameReportModel.Score;
                    // Log score from current game
                    LogGame_Player curGamePlayer = _gameRepository.LogGame_Players.First(
                        p => p.GameId == gameReportModel.GameId && p.PlayerId == curPlayer.Id && p.Score == null);
                    curGamePlayer.Score = gameReportModel.Score;
                    curGamePlayer.UpdateTime = DateTime.Now;

                    // Update score from award
                    var gameCount = (curPlayer.GameCount ?? 0) + 1;
                    curPlayer.GameCount = gameCount;
                    string playerType = "";
                    if(PlayerTypes.Types.TryGetValue(curPlayer.Type, out playerType))
                    {
                        if (gameCount % 6 == 0)
                        {
                            int awardScore = (playerType == "VIP" ? 50 : 30);
                            curPlayer.Score += awardScore;
                            // Log award
                            _gameRepository.LogOtherScore(curPlayer.Id, Consts.ScoreType.STAward, awardScore);
                        }
                    }
                    _dbcontext.SaveChanges();
                    _gameRepository.SaveChanges();
                    score = (int)curPlayer.Score;
                }
                else
                {
                    GuestPlayer curPlayer = _gameRepository.GuestPlayers.First(p => p.UniqueId == gameReportModel.UniqueId);
                    curPlayer.Score += gameReportModel.Score;
                    var gameCount = (curPlayer.GameCount ?? 0) + 1;
                    curPlayer.GameCount = gameCount;
                    if (gameCount % 10 == 0) curPlayer.Score += 30;
                    _gameRepository.SaveChanges();
                    score = curPlayer.Score;
                }
                // Change to trigger on Game.State changing from 2 to 0
                //this._gameRepository.ExecSqlCommand("DELETE FROM dbo.Game_Card WHERE GameId={0}", gameReportModel.GameId);
                //this._gameRepository.ExecSqlCommand("UPDATE dbo.Game_Player set Started = 0 WHERE GameId={0} and PlayerId>=0", gameReportModel.GameId);
                var game = _gameRepository.Games.First(g => g.Id == gameReportModel.GameId);
                if(game.ReadyState == 1)
                {
                    game.ReadyState = 0;
                    _gameRepository.SaveChanges();
                }

                return Json(new { State = 0, Desc = "Success.", Score = score }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { State = 1, Desc = "An error has occured." }, JsonRequestBehavior.AllowGet);
            }
        }

        // Reveive leaving table action
        public JsonResult LeaveTable(int gameId, string uniqueId)
        {
            DomainPlayer player = GetCurPlayer(uniqueId);
            var gamePlayer = _gameRepository.Game_Players.First(p => p.GameId == gameId && p.PlayerId == player.Id && p.PlayerType == player.Type);
            _gameRepository.DeleteRecord(gamePlayer);
            return Json(new { State = 0, Message = "success" }, JsonRequestBehavior.AllowGet);
        }

        // Receive changing table action
        [Authorize]
        public JsonResult ChangeTable(int oldGameId, string uniqueId)
        {
            DomainPlayer player = GetCurPlayer(uniqueId);
            int gameId;
            short turn;
            _gameRepository.GetOnlineGame(player.Id, player.Type, 1, out gameId, out turn);

            var gamePlayer = _gameRepository.Game_Players.First(p => p.GameId == gameId && p.PlayerId == player.Id);
            var gamePlayers = _gameRepository.Game_Players.Where(g => g.GameId == gameId);
            return innerGetTableState(gameId, true, player, gamePlayer, gamePlayers);
        }

        // Receive all the players starting game action and then return the dispatched cards to the front
        [Authorize]
        public JsonResult GetTableState(int gameId, string uniqueId)
        {
            DomainPlayer player = GetCurPlayer(uniqueId);

            var gamePlayer = this._gameRepository.Game_Players.First(p => p.GameId == gameId && p.PlayerId == player.Id);
            var gamePlayers = this._gameRepository.Game_Players.Where(g => g.GameId == gameId);
            return innerGetTableState(gameId, false, player, gamePlayer, gamePlayers);
        }

        private JsonResult innerGetTableState(int gameId, bool changeTable, DomainPlayer player, Game_Player gamePlayer, IEnumerable<Game_Player> gamePlayers)
        {
            PlayerCards pc1 = null;
            PlayerCards pc2 = null;
            int state = 0;

            switch (gamePlayers.Count())
            {
                case 1:
                    // Need two players to join
                    state = 1;
                    break;
                case 2:
                    // Only need another player to join, need return one joined player's info
                    state = 2;
                    var anotherPlayer = gamePlayers.First(g => g.PlayerId != player.Id);
                    GameProcessor gameProcessor2 = new GameProcessor(this._gameRepository, _dbcontext, player);
                    PlayerCards anotherPlayerCards = gameProcessor2.GetPlayercardsById(anotherPlayer.PlayerId, anotherPlayer.Turn);
                    if (anotherPlayer.Turn == gamePlayer.Turn + 1 || (anotherPlayer.Turn == 1 && gamePlayer.Turn == 3))
                    {
                        pc2 = anotherPlayerCards;
                    }
                    else
                    {
                        pc1 = anotherPlayerCards;
                    }
                    break;
                default:
                    var otherPlayers = gamePlayers.Where(g => g.PlayerId != player.Id);
                    GameProcessor gameProcessorD = new GameProcessor(this._gameRepository, _dbcontext, player);
                    foreach (var p in otherPlayers)
                    {
                        if (p.Turn == gamePlayer.Turn + 1 || (p.Turn == 1 && gamePlayer.Turn == 3))
                        {
                            pc2 = gameProcessorD.GetPlayercardsById(p.PlayerId, p.Turn);
                        }
                        else
                        {
                            pc1 = gameProcessorD.GetPlayercardsById(p.PlayerId, p.Turn);
                        }
                    }
                    switch (gamePlayers.Where(p => p.Started == 0).Count())
                    {
                        case 1:
                            state = 3;
                            break;
                        case 2:
                            state = 4;
                            break;
                        case 3:
                            // Current player must haven't started game yet
                            state = 6;
                            break;
                        default:
                            var game = _gameRepository.Games.First(g => g.Id == gameId);
                            if(game.ShuffleState == 0)
                            {
                                game.ShuffleState = 1;
                                _gameRepository.SaveChanges();
                            }
                            if(game.ReadyState == 0)
                            {
                                state = 7;
                            }
                            else
                            {
                                state = 5;
                                GameProcessor gameProcessor5 = new GameProcessor(this._gameRepository, _dbcontext, player);
                                gameProcessor5.StartGame(gameId);
                                var results5 = new
                                {
                                    gameId = gameId,
                                    changeTable = changeTable ? 1 : 0,
                                    state = state,
                                    playerTurn = gamePlayer.Turn,
                                    player1 = pc1,
                                    player2 = pc2,
                                    curTurn = gameProcessor5.CurrentTurn,
                                    players = new[]
                                    {
                                        new
                                        {
                                            turn = gameProcessor5.PlayerCardsList[0].Turn,
                                            cards = gameProcessor5.PlayerCardsList[0].Cards,
                                            cardsString = gameProcessor5.PlayerCardsList[0].CardsString
                                        },
                                        new
                                        {
                                            turn = gameProcessor5.PlayerCardsList[1].Turn,
                                            cards = gameProcessor5.PlayerCardsList[1].Cards,
                                            cardsString = gameProcessor5.PlayerCardsList[1].CardsString
                                        },
                                        new
                                        {
                                            turn = gameProcessor5.PlayerCardsList[2].Turn,
                                            cards = gameProcessor5.PlayerCardsList[2].Cards,
                                            cardsString = gameProcessor5.PlayerCardsList[2].CardsString
                                        }
                                    }.ToList()
                                };
                                return Json(results5, JsonRequestBehavior.AllowGet);
                            }
                            break;
                    }
                    break;
            }
            if(pc1 == null)
            {
                pc1 = GameProcessor.GetPrevToJoinPlayerCards(gamePlayer.Turn);
            }
            if (pc2 == null)
            {
                pc2 = GameProcessor.GetNextToJoinPlayerCards(gamePlayer.Turn);
            }
            var results = new
            {
                gameId = gameId,
                changeTable = changeTable ? 1 : 0,
                state = state,
                playerTurn = gamePlayer.Turn,
                player1 = pc1,
                player2 = pc2
            };
            return Json(results, JsonRequestBehavior.AllowGet);
        }

        // Receive all the players starting game action and then return the dispatched cards to the front
        public JsonResult StartGame(int gameId, string uniqueId)
        {
            DomainPlayer player = GetCurPlayer(uniqueId);

            var gamePlayer = this._gameRepository.Game_Players.First(p => p.GameId == gameId && p.PlayerId == player.Id);
            if (gamePlayer.Started == 0)
            {
                gamePlayer.Started = 1;
                this._gameRepository.SaveChanges();
            }
            var gamePlayers = this._gameRepository.Game_Players.Where(g => g.GameId == gameId);
            return innerGetTableState(gameId, false, player, gamePlayer, gamePlayers);
        }

        // Process a player's leaving game message and deduct the relative points
        public JsonResult LeaveGame(string uniqueId)
        {
            bool otherUsers = false; // Only for Registered and VIP players
            string userId = "";
            DomainPlayer player = null;
            var curPlayers = _dbcontext.Players.Where(p => p.ApplicationUserId == uniqueId);
            if(curPlayers.Count() > 0)
            {
                player = GetDomainPlayerFromPlayer(curPlayers.First());
                //if (System.Web.HttpContext.Current.User != null && System.Web.HttpContext.Current.User.Identity.IsAuthenticated)
                if (_httpContextBase.User != null && _httpContextBase.User.Identity.IsAuthenticated)
                {
                    //userId = System.Web.HttpContext.Current.User.Identity.GetUserId();
                    userId = _httpContextBase.User.Identity.GetUserId();
                    if (userId != uniqueId) otherUsers = true;
                }
            }
            else
            {
                player = GetCurPlayer(uniqueId);
            }
            int score = 0;
            int canGetAid = 0;
            if (player.ApplicationUserId != "") // Registered or VIP Player
            {
                Player curPlayer = _dbcontext.Players.First(p => p.ApplicationUserId == player.ApplicationUserId);
                curPlayer.Score -= 50;
                _dbcontext.SaveChanges();
                if(otherUsers)
                {
                    curPlayer = _dbcontext.Players.First(p => p.ApplicationUserId == userId);
                }
                score = (int)curPlayer.Score;
                canGetAid = (curPlayer.AidedTime == null ? 1 : 
                    (DateTime.Now.Subtract(curPlayer.AidedTime ?? DateTime.MinValue).Days >= 7 ? 1 : 0));
            }
            else
            {
                GuestPlayer curPlayer = this._gameRepository.GuestPlayers.First(p => p.UniqueId == uniqueId);
                curPlayer.Score -= 50;
                this._gameRepository.SaveChanges();
                score = curPlayer.Score;
                canGetAid = (curPlayer.AidedTime == null ? 1 :
                    (DateTime.Now.Subtract(curPlayer.AidedTime ?? DateTime.MinValue).Days >= 7 ? 1 : 0));
            }

            return Json(new { State = 0, Desc = "Success.", Score = score, CanGetAid = canGetAid }, JsonRequestBehavior.AllowGet);
        }

        // A player has made a deal
        [Authorize]
        public JsonResult MakeDealReport(BattleDeal battleDeal)
        {
            RunFast.Infrastructure.LogHelper.Log.Debug(Request.Browser);
            RunFast.Infrastructure.LogHelper.Log.Debug(battleDeal);
            Card card;
            var dealResult = _gameRepository.MakeDeal(battleDeal, out card);
            return Json(new {
                State = dealResult,
                Desc = (dealResult == 0 ? "Success" : 
                       (dealResult == 1 ? "Failed" : "Wrong gameId")),
                Card = card
            }, JsonRequestBehavior.AllowGet);
        }

        // A player has started his/her turn
        [Authorize]
        public JsonResult TurnStartReport(int gameId, short dealTimes, int playerId, short turn)
        {
            RunFast.Infrastructure.LogHelper.Log.Debug(Request.Browser);
            RunFast.Infrastructure.LogHelper.Log.Debug(gameId);
            RunFast.Infrastructure.LogHelper.Log.Debug(dealTimes);
            var result = _gameRepository.TurnStart(gameId, playerId, dealTimes, turn);
            return Json(new
            {
                State = result,
                Desc = (result == 0 ? "Success" :
                       (result == 1 ? "Failed" : "Wrong gameId"))
            }, JsonRequestBehavior.AllowGet);
        }

        // Get other players' deals
        [Authorize]
        public JsonResult GetDeal(int gameId, short dealTimes)
        {
            DomainPlayer player = GetCurPlayer("");
            RunFast.Infrastructure.LogHelper.Log.Debug(Request.Browser);
            RunFast.Infrastructure.LogHelper.Log.Debug(new { gameId = gameId, dealTimes = dealTimes });
            short dealTurn, dealType;
            List<BattleDeal> battleDealList = new List<BattleDeal>();
            var dealAmount = _gameRepository.GetDeal(gameId, player.Id, dealTimes, out dealTurn, out dealType, battleDealList);
            return Json(new {
                DealAmount = dealAmount,
                DealTurn = dealTurn,
                DealType = dealType,
                BattleDealList = battleDealList
            }, JsonRequestBehavior.AllowGet);
        }

        // Process a player's aid application and add the relative points
        public JsonResult GetAid(string uniqueId)
        {
            DomainPlayer player = GetCurPlayer(uniqueId);
            int score = 0;
            int canGetAid = 0;
            if (player.ApplicationUserId != "") // Registered or VIP Player
            {
                Player curPlayer = _dbcontext.Players.First(p => p.ApplicationUserId == player.ApplicationUserId);
                int aidScore = (PlayerTypes.Types[curPlayer.Type] == "VIP" ? 300 : 200);
                curPlayer.Score += aidScore;
                curPlayer.AidedTime = DateTime.Now;
                _dbcontext.SaveChanges();

                // Log aid
                _gameRepository.LogOtherScore(curPlayer.Id, Consts.ScoreType.STAid, aidScore);
                _gameRepository.SaveChanges();

                score = (int)curPlayer.Score;
            }
            else
            {
                GuestPlayer curPlayer = this._gameRepository.GuestPlayers.First(p => p.UniqueId == uniqueId);
                curPlayer.Score += 100;
                curPlayer.AidedTime = DateTime.Now;
                this._gameRepository.SaveChanges();
                score = curPlayer.Score;
            }

            return Json(new { State = 0, Desc = "Success.", Score = score, CanGetAid = canGetAid }, JsonRequestBehavior.AllowGet);
        }
        
        // Retrieve score
        public JsonResult GetScore(string uniqueId)
        {
            int score = 100;
            int canGetAid = 0;
            //if (uniqueId != "" || (System.Web.HttpContext.Current.User != null && System.Web.HttpContext.Current.User.Identity.IsAuthenticated))
            if (uniqueId != "" || (_httpContextBase.User != null && _httpContextBase.User.Identity.IsAuthenticated))
            {
                DomainPlayer player = GetCurPlayer(uniqueId);
                if (player.ApplicationUserId != "") // Registered or VIP Player
                {
                    Player curPlayer = _dbcontext.Players.First(p => p.ApplicationUserId == player.ApplicationUserId);
                    score = (int)curPlayer.Score;
                    canGetAid = (curPlayer.AidedTime == null ? 1 :
                        (DateTime.Now.Subtract(curPlayer.AidedTime ?? DateTime.MinValue).Days >= 7 ? 1 : 0));
                }
                else
                {
                    GuestPlayer curPlayer = this._gameRepository.GuestPlayers.First(p => p.UniqueId == uniqueId);
                    score = curPlayer.Score;
                    canGetAid = (curPlayer.AidedTime == null ? 1 :
                        (DateTime.Now.Subtract(curPlayer.AidedTime ?? DateTime.MinValue).Days >= 7 ? 1 : 0));
                }
            }

            return Json(new { State = 0, Desc = "Success.", Score = score, CanGetAid = canGetAid }, JsonRequestBehavior.AllowGet);
        }

        // Get current player info. 
        // Retrieve it from Application User and Player table for a registered and VIP player.
        // Or from guest player table for a guest player.
        private DomainPlayer GetCurPlayer(string uniqueId)
        {
            DomainPlayer player;
            //if (System.Web.HttpContext.Current.User != null && System.Web.HttpContext.Current.User.Identity.IsAuthenticated)
            if (_httpContextBase.User != null && _httpContextBase.User.Identity.IsAuthenticated)
            {
                //string userId = System.Web.HttpContext.Current.User.Identity.GetUserId();
                string userId = _httpContextBase.User.Identity.GetUserId();
                Player curPlayer = _dbcontext.Players.Where(p => p.ApplicationUserId == userId).First();
                player = GetDomainPlayerFromPlayer(curPlayer);
            }
            else
            {
                Regex rgx = new Regex(@"^[a-zA-Z0-9]{8}(-[a-zA-Z0-9]{4}){4}[A-Za-z0-9]{8}$"); //"1117d0ab-20ca-4873-8ba4-be1f5108c88d"
                if (uniqueId == "" || !rgx.IsMatch(uniqueId))
                {
                    var guid = Guid.NewGuid();
                    uniqueId = guid.ToString();
                    this._gameRepository.NewGuestPlayer(uniqueId, 100);
                }
                var guestPlayers = this._gameRepository.GuestPlayers.Where(p => p.UniqueId == uniqueId);
                if (guestPlayers.Count() == 0)
                {
                    this._gameRepository.NewGuestPlayer(uniqueId, 100);
                }
                var guestPlayer = guestPlayers.ElementAt(0);
                player = GetDomainPlayerFromGuestPlayer(guestPlayer);
            }

            return player;
        }

        private static DomainPlayer GetDomainPlayerFromGuestPlayer(GuestPlayer player)
        {
            return new DomainPlayer
            {
                Id = player.Id,
                ApplicationUserId = "",
                Score = player.Score,
                GameCount = player.GameCount,
                AidedTime = player.AidedTime,
                Type = PlayerTypes.Types.FirstOrDefault(t => t.Value == "Guest").Key,
                UniqueId = player.UniqueId
            };
        }

        private static DomainPlayer GetDomainPlayerFromPlayer(Player curPlayer)
        {
            DomainPlayer player;
            player = new DomainPlayer
            {
                ApplicationUserId = curPlayer.ApplicationUserId,
                Id = curPlayer.Id,
                Score = curPlayer.Score,
                GameCount = curPlayer.GameCount,
                AidedTime = curPlayer.AidedTime,
                Type = curPlayer.Type == PlayerTypes.Types.FirstOrDefault(t => t.Value == "VIP").Key ?
                    (curPlayer.ValidUntil > DateTime.Now.AddDays(-15) ?
                        curPlayer.Type : PlayerTypes.Types.FirstOrDefault(t => t.Value == "Registered").Key) :
                    curPlayer.Type, // VIP will still be valid in 15 days after expired
                // UniqueId = curPlayer.UniqueId
                UniqueId = curPlayer.ApplicationUserId
            };
            return player;
        }

        [Authorize]
        public ActionResult OnlineGame()
        {
            DomainPlayer player = GetCurPlayer("");

            GameProcessor gameProcessor = new GameProcessor(this._gameRepository, _dbcontext, player);
            gameProcessor.GetOnlineGame();
            return View(gameProcessor);
        }

        [Authorize]
        public ActionResult BuyPoint()
        {
            Player curPlayer = null;
            //if (System.Web.HttpContext.Current.User != null && System.Web.HttpContext.Current.User.Identity.IsAuthenticated)
            if (_httpContextBase.User != null && _httpContextBase.User.Identity.IsAuthenticated)
            {
                //string userId = System.Web.HttpContext.Current.User.Identity.GetUserId();
                string userId = _httpContextBase.User.Identity.GetUserId();
                curPlayer = _dbcontext.Players.Where(p => p.ApplicationUserId == userId).First();
            }
            return View(curPlayer);
        }

        [Authorize]
        public ActionResult ViewStatement()
        {
            List<LogGame_Player> logGame_Players = null;
            //if (System.Web.HttpContext.Current.User != null && System.Web.HttpContext.Current.User.Identity.IsAuthenticated)
            if (_httpContextBase.User != null && _httpContextBase.User.Identity.IsAuthenticated)
            {
                //string userId = System.Web.HttpContext.Current.User.Identity.GetUserId();
                string userId = _httpContextBase.User.Identity.GetUserId();
                Player curPlayer = _dbcontext.Players.Where(p => p.ApplicationUserId == userId).First();
                logGame_Players = _gameRepository.LogGame_Players.Where(p => p.PlayerId == curPlayer.Id)
                    .OrderByDescending(p => p.UpdateTime).ToList();
            }
            return View(logGame_Players);
        }

        public ActionResult About()
        {
            ViewBag.Message = "RUNS FAST is a card game created with C#, ASP.NET, MVC5, HTML5, CSS3 and JAVASCRIPT.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Frank Li";

            return View();
        }
    }
}