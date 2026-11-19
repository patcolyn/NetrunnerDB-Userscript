// ==UserScript==
// @name         NetrunnerDB Helper
// @version      1.0
// @description  Show card images by default on NetrunnerDB decklists
// @author       Patty
// @match        https://netrunnerdb.com/en/decklist/*
// ==/UserScript==
(function () {
	'use strict';
	const IMAGE_BASE = 'https://card-images.netrunnerdb.com/v2';
	const TILE_WIDTH = 140; // px

	const style = document.createElement('style');
	style.textContent = `
		#deck-content [class^="deck-"] { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
		#deck-content .tm-card { width: ${TILE_WIDTH}px; font-size: 12px; line-height: 1.3; }
		#deck-content .tm-img-link { position: relative; display: block; margin-bottom: 2px; }
		#deck-content .tm-img-link img { display: block; width: 100%; border-radius: 4.5%; }
		#deck-content .tm-qty {
			position: absolute; top: 4px; right: 4px; padding: 1px 6px; border-radius: 8px;
			background: rgba(0,0,0,.75); color: #fff; font-weight: bold;
		}
	`;
	document.head.appendChild(style);

	function addImages() {
		document.querySelectorAll('#deck-content a.card[data-index]').forEach((link) => {
			const line = link.parentElement;
			if (line.classList.contains('tm-card')) return;
			line.classList.add('tm-card');

      // remove popup
			const imgLink = link.cloneNode(false);
			imgLink.classList.add('tm-img-link', 'no-popup');

			const img = document.createElement('img');
      
			// Fallback, only NSG cards support xlarge
			const sources = [
				`${IMAGE_BASE}/xlarge/${link.dataset.index}.webp`,
				`${IMAGE_BASE}/large/${link.dataset.index}.jpg`,
			];
			img.src = sources.shift();
			img.alt = link.textContent;
			img.loading = 'lazy';
			img.onerror = () => (sources.length ? (img.src = sources.shift()) : imgLink.remove());
			imgLink.appendChild(img);

			const qty = line.textContent.match(/^\s*(\d+)x/);
			if (qty) imgLink.insertAdjacentHTML('beforeend', `<span class="tm-qty">${qty[1]}x</span>`);

			line.prepend(imgLink);
		});
	}

	addImages();
	new MutationObserver(addImages).observe(document.body, { childList: true, subtree: true });
})();
