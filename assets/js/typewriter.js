document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.terminal-container');
  const hidden = document.querySelector('#hidden-markdown');

  if (!container || !hidden) {
    console.error("Éléments manquants");
    return;
  }

  const blocks = Array.from(hidden.children);
  hidden.remove();

  let blockIndex = 0;

  function processNextBlock() {
    if (blockIndex >= blocks.length) {
      container.classList.add('finished');
      return;
    }

    const block = blocks[blockIndex];
    const tag = block.tagName.toLowerCase();

    // Détection blocs avec images (ou contenant des images)
    const containsImage = block.querySelector('img, picture, figure') || tag === 'img';

    if (containsImage) {
      // Image → on ajoute le bloc entier d'un coup (pas de typewriter dessus)
      const clone = block.cloneNode(true);
      container.appendChild(clone);
      container.scrollTop = container.scrollHeight;

      // Pause un peu plus longue pour laisser voir l'image
      setTimeout(() => {
        blockIndex++;
        processNextBlock();
      }, 1800); // ← ajuste ici si trop long/court (1500–2500 ms)

    } else {
      // Bloc texte normal → clone + typewriter sur le texte
      const cloned = block.cloneNode(true);
      container.appendChild(cloned);
      container.scrollTop = container.scrollHeight;

      const textNodes = getTextNodes(cloned);
      let nodeIdx = 0;
      let charIdx = 0;

      function typeChar() {
        while (nodeIdx < textNodes.length) {
          const node = textNodes[nodeIdx];
          const txt = node.originalText || node.textContent;

          if (charIdx < txt.length) {
            node.textContent = txt.substring(0, charIdx + 1);
            charIdx++;
            container.scrollTop = container.scrollHeight;
            setTimeout(typeChar, 22);
            return;
          }
          charIdx = 0;
          nodeIdx++;
        }

        // Bloc texte fini
        setTimeout(() => {
          blockIndex++;
          processNextBlock();
        }, 800);
      }

      // Sauvegarde texte original avant de vider
      textNodes.forEach(n => n.originalText = n.textContent);
      textNodes.forEach(n => n.textContent = '');

      setTimeout(typeChar, 300);
    }
  }

  // Helper : récupérer les nœuds texte
  function getTextNodes(element) {
    const nodes = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.trim()) nodes.push(node);
    }
    return nodes;
  }

  // Démarrage
  setTimeout(processNextBlock, 700);
});