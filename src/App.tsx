import { useEffect, useRef } from "react";
import { GameScene } from "./scenes/game.scene.ts";

function App() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current?.childNodes.length === 0) {
      new Phaser.Game({
        type: Phaser.AUTO,
        parent: `game-scene`,
        width: 800,
        height: 600,
        scene: [GameScene],
      });
    }
  }, []);

  return (
    <div style={{ display: `flex`, gap: 15 }}>
      <div
        style={{
          display: `flex`,
          flexDirection: `column`,
          alignItems: `center`,
          gap: 15,
        }}
      >
        <p>player 1</p>
        <ul style={{ listStyle: `none`, margin: 0, padding: 0 }}>
          <li>W to go up</li>
          <li>S to go down</li>
          <li>D to speed up</li>
          <li>P to pause</li>
          <li>shift + R to restart</li>
        </ul>
      </div>
      <div id="game-scene" ref={ref}></div>
      <div
        style={{
          display: `flex`,
          flexDirection: `column`,
          alignItems: `center`,
          gap: 15,
        }}
      >
        <p>player 2</p>
        <ul style={{ listStyle: `none`, margin: 0, padding: 0 }}>
          <li>↑ to go up</li>
          <li>↓ to go down</li>
          <li>→ to speed up</li>
          <li>P to pause</li>
          <li>shift + R to restart</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
