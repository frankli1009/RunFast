using RunFast.Domain.Abstract;
using RunFast.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RunFast.Domain.Helpers;
using System.Web;

namespace RunFast.Domain.Concrete
{
    public class GameProcessor
    {
        private IGameRepository _gameRepository;
        private DomainPlayer _player;
        private Game _currentGame;
        private List<PlayerCards> _playerCardsList = new List<PlayerCards>();
        private string[] _animalPortrait = {"bear", "civitcat", "deer", "dog", "donkey", "elephant", "fox",
            "kitty", "monkey", "ox", "panda", "pony", "rabbit", "sheep", "squirrel", "tiger"};

        public List<Card> GameCards
        {
            get
            {
                List<Card> cards = new List<Card>();
                var game_cards = _gameRepository.Game_Cards.Where(g => g.GameId == _currentGame.Id).ToList();
                while(game_cards.Count > 0)
                {
                    Card card = ExtractOneCard(game_cards);
                    cards.Add(card);
                }
                return cards;
            }
        }
        public Game CurrentGame { get { return _currentGame; } }
        public List<PlayerCards> PlayerCardsList { get { return _playerCardsList; } }
        public int CurrentTurn { get; set; }

        public GameProcessor(IGameRepository repository, DomainPlayer player)
        {
            _gameRepository = repository;
            _player = player;
        }

        public void NewLocalGame()
        {
            // Add a new game
            _currentGame = _gameRepository.NewGame(true, "Table", 0);

            // Add game players
            AddLocalGamePlayers();
        }

        private void AddLocalGamePlayers()
        {
            _gameRepository.NewGamePlayer(_currentGame.Id, _player.Id, 1, 0);

            _gameRepository.NewGamePlayer(_currentGame.Id, -1, 3, 1);
            _gameRepository.NewGamePlayer(_currentGame.Id, -2, 2, 1);
            InitPlayerCardsList();
        }

        private void InitPlayerCardsList()
        {
            var playerType = "";
            PlayerTypes.Types.TryGetValue(_player.Type, out playerType);
            _playerCardsList.Add(new PlayerCards
            {
                PlayerId = _player.Id,
                UniqueId = _player.UniqueId,
                Turn = 1,
                Portrait = _animalPortrait[0],
                PlayerName = "You",
                Score = _player.Score ?? 100,
                GameCount = _player.GameCount ?? 0,
                AidedTime = _player.AidedTime ?? DateTime.MinValue,
                PlayerType = playerType
            });
            _playerCardsList.Add(new PlayerCards
            {
                PlayerId = -1,
                UniqueId = "",
                Turn = 3,
                Portrait = _animalPortrait[1],
                PlayerName = "Dannil"
            });
            _playerCardsList.Add(new PlayerCards
            {
                PlayerId = -2,
                UniqueId = "",
                Turn = 2,
                Portrait = _animalPortrait[2],
                PlayerName = "Mary"
            });
        }

        public void StartGame(int gameId)
        {
            _currentGame = _gameRepository.Games.First(g => g.Id == gameId);
            InitPlayerCardsList();
            ShuffleAndDispatchCards();
        }

        private void ShuffleAndDispatchCards()
        {
            // Prepare game cards
            InitGameCards();

            // Current player will always take the index of 0 in _playerCardsList
            // Dispatch cards
            DispatchGameCards();
        }

        private void DispatchGameCards()
        {
            List<Game_Card> gameCards = _gameRepository.Game_Cards.Where(g => g.GameId == _currentGame.Id).ToList();
            bool bAddSpades3 = false;
            Pip pip3 = _gameRepository.Pips.Where(p => p.Name == "3").First();
            CardSuit suitSpades = _gameRepository.Suits.Where(s => s.Name == "Spades").First();
            Card cardSpades3 = new Card { Pip = pip3.Id, Suit = suitSpades.Id };
            while (gameCards.Count > 0)
            {
                foreach(var playerCards in _playerCardsList)
                {
                    if (bAddSpades3)
                        playerCards.Cards.Add(ExtractOneCard(gameCards));
                    else if (playerCards.Cards.AddCard(ExtractOneCard(gameCards), cardSpades3))
                    {
                        bAddSpades3 = true;
                        playerCards.CurrentTurn = true;
                        CurrentTurn = playerCards.Turn;
                    }
                }
            }
        }

        private void InitGameCards()
        {
            List<Card> cards = new List<Card>();
            var pipSuits = GetPipSuits();
            foreach(var pipSuit in pipSuits)
            {
                foreach(var suit in pipSuit.SuitIds)
                {
                    Card card = new Card { Pip = pipSuit.PipId, Suit = suit };
                    cards.Add(card);
                }
            }
            _gameRepository.InsertGameCards(_currentGame.Id, cards);
        }

        private Card ExtractOneCard(List<Game_Card> cards)
        {
            int cardIndex = 0;
            Random random = new Random();
            if(cards.Count > 1)
            {
                cardIndex = random.Next(0, cards.Count);
            }

            // Create the card to return and remove the data of the card from the available list data
            Pip pip = _gameRepository.Pips.Where(p => p.Id == cards.ElementAt(cardIndex).PipId).First();
            CardSuit cardSuit = _gameRepository.Suits.Where(s => s.Id == cards.ElementAt(cardIndex).SuitId).First();
            Card card = new Card { Pip = pip.Id, PipRank = pip.Rank, Suit = cardSuit.Id, SuitRank = cardSuit.Rank };
            cards.RemoveAt(cardIndex);

            return card;
        }

        private List<PipSuit> GetPipSuits()
        {
            IEnumerable<Pip> pips = _gameRepository.Pips;
            IEnumerable<CardSuit> suits = _gameRepository.Suits;

            var pipSuits = new List<PipSuit>();
            foreach (var pip in pips)
            {
                var pipSuit = new PipSuit { PipId = pip.Id };
                switch (pip.Name)
                {
                    case "A":
                        IEnumerable<CardSuit> suitsA = suits.Where(s => s.Name != "Spades");
                        foreach (var suit in suitsA)
                        {
                            pipSuit.SuitIds.Add(suit.Id);
                        }
                        break;
                    case "2":
                        CardSuit suit1 = suits.First(s => s.Name == "Spades");
                        pipSuit.SuitIds.Add(suit1.Id);
                        break;
                    default: // other pips
                        foreach (var suit in suits)
                        {
                            pipSuit.SuitIds.Add(suit.Id);
                        }
                        break;
                }
                pipSuits.Add(pipSuit);
            }

            return pipSuits;
        }

        public void GetOnlineGame()
        {
            // Auto dispatch game tables for a online game
        }
    }
}
