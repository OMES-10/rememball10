import { useEffect, useState } from "react";
import "./App.css";

const THEMES = {
  equipment: {
    name: "Équipements",
    cards: [
      "⚽",
      "🥅",
      "👕",
      "👟",
      "🧤",
      "🚩",
      "🟨",
      "🟥",
      "📣",
      "🧢",
      "🎽",
      "🧦",
      "⏱️",
      "🩹",
      "🎒",
      "🥤",
      "📋",
      "🔔",
    ],
  },

  trophies: {
    name: "Trophées & symboles",
    cards: [
      "🏆",
      "🥇",
      "🥈",
      "🥉",
      "⭐",
      "👑",
      "🎖️",
      "🏅",
      "💎",
      "🔥",
      "🎯",
      "⚡",
      "🌟",
      "🎉",
      "👏",
      "💪",
      "🦁",
      "🌍",
    ],
  },
};

function shuffleCards(array) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[i],
    ];
  }

  return shuffled;
}

function createDeck(theme, level) {
  const pairCount = level === "easy" ? 8 : 18;
  const selectedCards = THEMES[theme].cards.slice(0, pairCount);

  const doubledCards = selectedCards.flatMap((symbol, index) => [
    {
      id: index,
      uniqueId: `${index}-a`,
      symbol,
      matched: false,
    },
    {
      id: index,
      uniqueId: `${index}-b`,
      symbol,
      matched: false,
    },
  ]);

  return shuffleCards(doubledCards);
}

function App() {
  const [screen, setScreen] = useState("config");

  const [theme, setTheme] = useState("trophies");
  const [level, setLevel] = useState("hard");
  const [sound, setSound] = useState(true);

  const [cards, setCards] = useState([]);
  const [firstCard, setFirstCard] = useState(null);
  const [secondCard, setSecondCard] = useState(null);

  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState("");

  const pairCount = level === "easy" ? 8 : 18;

  useEffect(() => {
    if (screen !== "playing") {
      return undefined;
    }

    const timer = setInterval(() => {
      setSeconds((previousSeconds) => previousSeconds + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [screen]);

  useEffect(() => {
    if (screen === "playing" && matchedPairs === pairCount) {
      const finishDelay = setTimeout(() => {
        setScreen("finished");
      }, 700);

      return () => clearTimeout(finishDelay);
    }

    return undefined;
  }, [matchedPairs, pairCount, screen]);

  function startGame() {
    const newDeck = createDeck(theme, level);

    setCards(newDeck);
    setFirstCard(null);
    setSecondCard(null);
    setMoves(0);
    setMatchedPairs(0);
    setSeconds(0);
    setLocked(false);
    setMessage("");
    setScreen("playing");
  }

  function chooseCard(card) {
    if (
      locked ||
      card.matched ||
      card.uniqueId === firstCard?.uniqueId ||
      card.uniqueId === secondCard?.uniqueId
    ) {
      return;
    }

    if (!firstCard) {
      setFirstCard(card);
      return;
    }

    setSecondCard(card);
    setLocked(true);
    setMoves((previousMoves) => previousMoves + 1);

    if (firstCard.id === card.id) {
      setCards((previousCards) =>
        previousCards.map((currentCard) =>
          currentCard.id === card.id
            ? { ...currentCard, matched: true }
            : currentCard
        )
      );

      setMatchedPairs((previousPairs) => previousPairs + 1);
      setMessage("✅ Paire trouvée !");

      setTimeout(() => {
        resetSelectedCards();
      }, 600);
    } else {
      setMessage("❌ Ce n’est pas une paire.");

      setTimeout(() => {
        resetSelectedCards();
      }, 1000);
    }
  }

  function resetSelectedCards() {
    setFirstCard(null);
    setSecondCard(null);
    setLocked(false);
    setMessage("");
  }

  function isCardVisible(card) {
    return (
      card.matched ||
      card.uniqueId === firstCard?.uniqueId ||
      card.uniqueId === secondCard?.uniqueId
    );
  }

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  const score = Math.max(
    0,
    pairCount * 100 - moves * 5 - seconds
  );

  if (screen === "config") {
    return (
      <main className="app">
        <section className="game-panel">
          <div className="logo">⚽</div>

          <h1>REMEMBALL</h1>
          <p className="subtitle">Choisis ton défi football</p>

          <div className="section">
            <h2>Thème</h2>

            <div className="options-grid">
              <button
                className={`option-card ${
                  theme === "equipment" ? "selected" : ""
                }`}
                onClick={() => setTheme("equipment")}
              >
                <span className="option-icon">👕</span>
                <span>Équipements</span>
              </button>

              <button
                className={`option-card ${
                  theme === "trophies" ? "selected" : ""
                }`}
                onClick={() => setTheme("trophies")}
              >
                <span className="option-icon">🏆</span>
                <span>Trophées & symboles</span>
              </button>
            </div>
          </div>

          <div className="section">
            <h2>Niveau</h2>

            <div className="options-grid">
              <button
                className={`level-card ${
                  level === "easy" ? "selected" : ""
                }`}
                onClick={() => setLevel("easy")}
              >
                Débutant
                <small>4 × 4 — 8 paires</small>
              </button>

              <button
                className={`level-card ${
                  level === "hard" ? "selected" : ""
                }`}
                onClick={() => setLevel("hard")}
              >
                Avancé
                <small>6 × 6 — 18 paires</small>
              </button>
            </div>
          </div>

          <button
            className="sound-row"
            onClick={() => setSound((previousSound) => !previousSound)}
          >
            <span>{sound ? "🔊" : "🔇"} Son</span>

            <span className={`toggle ${sound ? "toggle-on" : "toggle-off"}`}>
              <span className="toggle-circle"></span>
            </span>
          </button>

          <button className="start-button" onClick={startGame}>
            COMMENCER
          </button>
        </section>
      </main>
    );
  }

  if (screen === "playing") {
    return (
      <main className="app">
        <section className="game-panel playing-panel">
          <div className="game-header">
            <div>
              <h1 className="small-title">REMEMBALL</h1>
              <p className="game-theme">{THEMES[theme].name}</p>
            </div>

            <button
              className="secondary-button"
              onClick={() => setScreen("config")}
            >
              Quitter
            </button>
          </div>

          <div className="stats">
            <div className="stat">
              <strong>{formatTime(seconds)}</strong>
              <span>Temps</span>
            </div>

            <div className="stat">
              <strong>{moves}</strong>
              <span>Mouvements</span>
            </div>

            <div className="stat">
              <strong>
                {matchedPairs}/{pairCount}
              </strong>
              <span>Paires</span>
            </div>

            <div className="stat">
              <strong>{score}</strong>
              <span>Score</span>
            </div>
          </div>

          <p className="feedback-message">{message || "Trouve les paires !"}</p>

          <div
            className={`card-grid ${
              level === "easy" ? "easy-grid" : "hard-grid"
            }`}
          >
            {cards.map((card) => {
              const visible = isCardVisible(card);

              return (
                <button
                  key={card.uniqueId}
                  className={`memory-card ${
                    visible ? "flipped" : ""
                  } ${card.matched ? "matched" : ""}`}
                  onClick={() => chooseCard(card)}
                  aria-label={visible ? card.symbol : "Carte cachée"}
                >
                  <span className="card-inner">
                    <span className="card-back">?</span>
                    <span className="card-front">{card.symbol}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <button className="restart-button" onClick={startGame}>
            🔄 Recommencer
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <section className="game-panel final-panel">
        <div className="final-trophy">🏆</div>

        <h1>VICTOIRE !</h1>
        <p className="subtitle">Tu as retrouvé toutes les paires.</p>

        <div className="final-score">
          <span>Score final</span>
          <strong>{score}</strong>
        </div>

        <div className="final-stats">
          <p>
            Temps : <strong>{formatTime(seconds)}</strong>
          </p>

          <p>
            Mouvements : <strong>{moves}</strong>
          </p>

          <p>
            Paires : <strong>{pairCount}/{pairCount}</strong>
          </p>
        </div>

        <button className="start-button" onClick={startGame}>
          REJOUER
        </button>

        <button
          className="secondary-button full-button"
          onClick={() => setScreen("config")}
        >
          Changer les options
        </button>
      </section>
    </main>
  );
}

export default App;