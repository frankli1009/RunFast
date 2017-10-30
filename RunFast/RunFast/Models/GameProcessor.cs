using RunFast.Domain.Abstract;
using RunFast.Domain.Entities;
using RunFast.Domain.Concrete;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RunFast.Domain.Helpers;
using System.Web;

namespace RunFast.Models
{
    public class GameProcessor
    {
        private IGameRepository _gameRepository;
        private ApplicationDbContext _context;
        private DomainPlayer _player;
        private Game _currentGame;
        private List<PlayerCards> _playerCardsList = new List<PlayerCards>();
        private static string[] _animalPortrait = {"bear", "civitcat", "deer", "dog", "donkey", "elephant", "fox",
            "kitty", "monkey", "ox", "panda", "pony", "rabbit", "sheep", "squirrel", "tiger"};
        private static string _whoPortrait = "Who";

        //public List<Card> GameCards
        //{
        //    get
        //    {
        //        List<Card> cards = new List<Card>();
        //        var game_cards = _gameRepository.Game_Cards.Where(g => g.GameId == _currentGame.Id).ToList();
        //        while(game_cards.Count > 0)
        //        {
        //            Card card = ExtractOneCard(game_cards);
        //            cards.Add(card);
        //        }
        //        return cards;
        //    }
        //}
        public Game CurrentGame { get { return _currentGame; } }
        public List<PlayerCards> PlayerCardsList { get { return _playerCardsList; } }
        public int CurrentTurn { get; set; }

        public GameProcessor(IGameRepository repository, ApplicationDbContext context, DomainPlayer player)
        {
            _gameRepository = repository;
            _context = context;
            _player = player;
        }

        public void NewLocalGame()
        {
            // Get a local game
            int gameId;
            short turn;
            if (_player.Score != null && _player.Score < 50)
            {
                gameId = 0;
                turn = 1;
                _currentGame = new Game { Id = 0, Local = true, Owner = 0, Name = "" };
            }
            else
            {
                _gameRepository.GetLocalGame(_player.Id, _player.Type, out gameId, out turn);
                _currentGame = _gameRepository.Games.First(g => g.Id == gameId);
            }

            // Add game players
            InitPlayerCardsList(gameId, turn);
        }

        private void InitPlayerCardsList(int gameId, short turn)
        {
            var playerType = "";
            PlayerTypes.Types.TryGetValue(_player.Type, out playerType);
            _playerCardsList.Add(new PlayerCards
            {
                PlayerId = _player.Id,
                UniqueId = _player.UniqueId,
                Turn = turn,
                Portrait = _animalPortrait[turn-1],
                PlayerName = "You",
                Score = _player.Score ?? 100,
                GameCount = _player.GameCount ?? 0,
                AidedTime = _player.AidedTime ?? DateTime.MinValue,
                PlayerType = playerType
            });
            PlayerCards p1 = null, p2 = null;
            if (gameId > 0)
            {
                // After add the current player, firstly add the prev one, then the next one
                var gamePlayers = _gameRepository.Game_Players.Where(p => p.GameId == gameId && p.Turn != turn);
                foreach (var p in gamePlayers)
                {
                    var pc = GetPlayercardsById(p.PlayerId, p.Turn);
                    if (p.Turn == turn + 1 || (turn == 3 && p.Turn == 1)) p2 = pc;
                    else p1 = pc;
                }
            }
            if (p1 == null)
            {
                p1 = GetPrevToJoinPlayerCards(turn);
            }
            _playerCardsList.Add(p1);
            if (p2 == null)
            {
                p2 = GetNextToJoinPlayerCards(turn);
            }
            _playerCardsList.Add(p2);
        }

        public static PlayerCards GetNextToJoinPlayerCards(short turn)
        {
            return new PlayerCards
            {
                PlayerId = 0,
                UniqueId = "",
                Turn = (short)(turn + 1 > 3 ? 1 : turn + 1),
                Portrait = _whoPortrait,
                PlayerName = "Joining",
                Score = 0,
                GameCount = 0,
                AidedTime = DateTime.MinValue,
                PlayerType = ""
            };
        }

        public static PlayerCards GetPrevToJoinPlayerCards(short turn)
        {
            return new PlayerCards
            {
                PlayerId = 0,
                UniqueId = "",
                Turn = (short)(turn - 1 > 0 ? turn - 1 : 3),
                Portrait = _whoPortrait,
                PlayerName = "Joining",
                Score = 0,
                GameCount = 0,
                AidedTime = DateTime.MinValue,
                PlayerType = ""
            };
        }

        public PlayerCards GetPlayercardsById(int playerId, short turn)
        {
            if(playerId < 1)
            {
                return new PlayerCards
                {
                    PlayerId = playerId,
                    UniqueId = "",
                    Turn = turn,
                    Portrait = _animalPortrait[turn-1],
                    PlayerName = turn == 3 ? "Dannil" : "Mary"
                };
            } else
            {
                var player = _context.Players.First(p => p.Id == playerId);
                var playerType = "";
                PlayerTypes.Types.TryGetValue(player.Type, out playerType);
                var user = _context.Users.First(u => u.Id == player.ApplicationUserId);
                string playerName = player.FirstName ?? user.Email.Substring(0, user.Email.IndexOf("@"));
                if (playerName.Length > 13) playerName = playerName.Substring(0, 10) + "...";
                return new PlayerCards
                {
                    PlayerId = player.Id,
                    UniqueId = player.UniqueId,
                    Turn = turn,
                    Portrait = _animalPortrait[turn-1],
                    PlayerName = playerName,
                    Score = player.Score ?? 100,
                    GameCount = player.GameCount ?? 0,
                    AidedTime = player.AidedTime ?? DateTime.MinValue,
                    PlayerType = playerType
                };
            }
        }

        public void StartGame(int gameId)
        {
            _currentGame = _gameRepository.Games.First(g => g.Id == gameId);
            var player = _gameRepository.Game_Players.First(p => p.GameId == gameId && p.PlayerId == _player.Id);
            InitPlayerCardsList(gameId, player.Turn);
            // Change to trigger on game.State changing from 0 to 1, and here change to get dispatched cards
            //ShuffleAndDispatchCards(gameId);
            GetDispatchedCards(gameId);
        }

        private void GetDispatchedCards(int gameId)
        {
            CurrentTurn = _gameRepository.GetDispatchedCards(gameId, _playerCardsList);
        }

        private void ShuffleAndDispatchCards(int gameId)
        {
            // Change to exec stored procedure

            //// Prepare game cards
            //InitGameCards();

            //// Current player will always take the index of 0 in _playerCardsList
            //// Dispatch cards
            //DispatchGameCards();

            CurrentTurn = _gameRepository.ShuffleAndDispatchCards(gameId, _playerCardsList);
        }

        // Randomly dispatch cards to all players
        //private void DispatchGameCards()
        //{
        //    List<Game_Card> gameCards = _gameRepository.Game_Cards.Where(g => g.GameId == _currentGame.Id).ToList();
        //    bool bAddSpades3 = false;
        //    Pip pip3 = _gameRepository.Pips.Where(p => p.Name == "3").First();
        //    CardSuit suitSpades = _gameRepository.Suits.Where(s => s.Name == "Spades").First();
        //    Card cardSpades3 = new Card { Pip = pip3.Id, Suit = suitSpades.Id };
        //    while (gameCards.Count > 0)
        //    {
        //        foreach(var playerCards in _playerCardsList)
        //        {
        //            if (bAddSpades3)
        //                playerCards.Cards.Add(ExtractOneCard(gameCards));
        //            else if (playerCards.Cards.AddCard(ExtractOneCard(gameCards), cardSpades3))
        //            {
        //                bAddSpades3 = true;
        //                CurrentTurn = playerCards.Turn;
        //            }
        //        }
        //    }
        //}

        // Form all cards of a game
        //private void InitGameCards()
        //{
        //    List<Card> cards = new List<Card>();
        //    var pipSuits = GetPipSuits();
        //    foreach(var pipSuit in pipSuits)
        //    {
        //        foreach(var suit in pipSuit.SuitIds)
        //        {
        //            Card card = new Card { Pip = pipSuit.PipId, Suit = suit };
        //            cards.Add(card);
        //        }
        //    }
        //    _gameRepository.InsertGameCards(_currentGame.Id, cards);
        //}

        // Extract a card by random
        //private Card ExtractOneCard(List<Game_Card> cards)
        //{
        //    int cardIndex = 0;
        //    Random random = new Random();
        //    if(cards.Count > 1)
        //    {
        //        cardIndex = random.Next(0, cards.Count);
        //    }

        //    // Create the card to return and remove the data of the card from the available list data
        //    Pip pip = _gameRepository.Pips.Where(p => p.Id == cards.ElementAt(cardIndex).PipId).First();
        //    CardSuit cardSuit = _gameRepository.Suits.Where(s => s.Id == cards.ElementAt(cardIndex).SuitId).First();
        //    Card card = new Card { Pip = pip.Id, PipRank = pip.Rank, Suit = cardSuit.Id, SuitRank = cardSuit.Rank };
        //    cards.RemoveAt(cardIndex);

        //    return card;
        //}

        // Form a pip suit collection of all cards of a game
        //private List<PipSuit> GetPipSuits()
        //{
        //    IEnumerable<Pip> pips = _gameRepository.Pips;
        //    IEnumerable<CardSuit> suits = _gameRepository.Suits;

        //    var pipSuits = new List<PipSuit>();
        //    foreach (var pip in pips)
        //    {
        //        var pipSuit = new PipSuit { PipId = pip.Id };
        //        switch (pip.Name)
        //        {
        //            case "A":
        //                IEnumerable<CardSuit> suitsA = suits.Where(s => s.Name != "Spades");
        //                foreach (var suit in suitsA)
        //                {
        //                    pipSuit.SuitIds.Add(suit.Id);
        //                }
        //                break;
        //            case "2":
        //                CardSuit suit1 = suits.First(s => s.Name == "Spades");
        //                pipSuit.SuitIds.Add(suit1.Id);
        //                break;
        //            default: // other pips
        //                foreach (var suit in suits)
        //                {
        //                    pipSuit.SuitIds.Add(suit.Id);
        //                }
        //                break;
        //        }
        //        pipSuits.Add(pipSuit);
        //    }

        //    return pipSuits;
        //}

        public void GetOnlineGame()
        {
            // Auto dispatch game tables for a online game
            int gameId;
            short turn;
            if (_player.Score != null && _player.Score < 50)
            {
                gameId = 0;
                turn = 1;
                _currentGame = new Game { Id = 0, Local = false, Owner = 0, Name = "" };
            }
            else
            {
                _gameRepository.GetOnlineGame(_player.Id, _player.Type, 0, out gameId, out turn);
                _currentGame = _gameRepository.Games.First(g => g.Id == gameId);
            }

            // Add game players
            InitPlayerCardsList(gameId, turn);
        }
    }
}
