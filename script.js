document.addEventListener('DOMContentLoaded', () => {
    const playerSetup = document.getElementById('player-setup');
    const gameArea = document.getElementById('game-area');
    const startGameButton = document.getElementById('start-game-button');
    const preneurSelect = document.getElementById('preneur');
    const partenaireSelect = document.getElementById('partenaire');
    const pointsInput = document.getElementById('points');
    const addRoundButton = document.getElementById('add-round-button');
    const scoreBody = document.getElementById('score-body');
    const contractSelect = document.getElementById('contract');
    const bonusPlayerSelect = document.getElementById('bonusPlayer');
    const bonusSelect = document.getElementById('bonus');
    const showStatsButton = document.getElementById('show-stats-button');
    const showHistoryButton = document.getElementById('show-history-button');
    const historyArea = document.getElementById('history-area');
    const historyContent = document.getElementById('history-content');
    const backToGameFromHistoryButton = document.getElementById('back-to-game-from-history-button');
    const statsArea = document.getElementById('stats-area');
    const statsContent = document.getElementById('stats-content');
    const backToGameFromStatsButton = document.getElementById('back-to-game-from-stats-button');
    const preneurSuccesCheckbox = document.getElementById('preneur-succes');
    const playerInputs = Array.from(document.querySelectorAll('#player-setup input[type="text"]'));
    const playerErrors = Array.from(document.querySelectorAll('#player-setup .error'));
    const pointsError = document.getElementById('points-error');


    let players = [];
    let scores = {};
    let roundsData = [];

    // Chargement des données depuis le localStorage
    const savedData = localStorage.getItem('gameData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        players = parsedData.players || [];
        scores = parsedData.scores || {};
        roundsData = parsedData.roundsData || [];

        if (players.length > 0) {
            playerSetup.style.display = 'none';
            gameArea.style.display = 'block';
            players.forEach(player => {
                const optionPreneur = document.createElement('option');
                optionPreneur.value = player;
                optionPreneur.textContent = player;
                preneurSelect.appendChild(optionPreneur);

                const optionPartenaire = document.createElement('option');
                optionPartenaire.value = player;
                optionPartenaire.textContent = player;
                partenaireSelect.appendChild(optionPartenaire);

                const optionBonusPlayer = document.createElement('option');
                optionBonusPlayer.value = player;
                optionBonusPlayer.textContent = player;
                bonusPlayerSelect.appendChild(optionBonusPlayer);

            });
            updateScoreTable();
            updateHistoryTable();
        }
    }

    startGameButton.addEventListener('click', () => {
        let isValid = true; // Variable pour suivre la validité du formulaire

        playerErrors.forEach(error => error.textContent = "");
        players = playerInputs.map((input, index) => {
            const inputValue = input.value.trim();
            if (!inputValue) {
                playerErrors[index].textContent = "Le nom du joueur est obligatoire.";
                isValid = false; // Marquer comme invalide si un champ est vide
            }
            return inputValue;
        });

        if (!isValid) {
            return; // Ne pas continuer si le formulaire est invalide
        }

        players.forEach(player => {
            scores[player] = 0;
            const optionPreneur = document.createElement('option');
            optionPreneur.value = player;
            optionPreneur.textContent = player;
            preneurSelect.appendChild(optionPreneur);

            const optionPartenaire = document.createElement('option');
            optionPartenaire.value = player;
            optionPartenaire.textContent = player;
            partenaireSelect.appendChild(optionPartenaire);

            const optionBonusPlayer = document.createElement('option');
            optionBonusPlayer.value = player;
            optionBonusPlayer.textContent = player;
            bonusPlayerSelect.appendChild(optionBonusPlayer);
        });

        updateScoreTable();
        saveGameData();
        playerSetup.style.display = 'none';
        gameArea.style.display = 'block';
    });


    addRoundButton.addEventListener('click', () => {
        pointsError.textContent = "";
        const points = parseInt(pointsInput.value, 10);
        if (isNaN(points)) {
            pointsError.textContent = "Veuillez entrer un nombre valide de points.";
            return;
        }
        const preneur = preneurSelect.value;
        const partenaire = partenaireSelect.value === 'none' ? null : partenaireSelect.value;
        const contrat = contractSelect.value;
        const bonusPlayer = bonusPlayerSelect.value === 'none' ? null : bonusPlayerSelect.value;
        const bonus = parseInt(bonusSelect.value, 10);
        const preneurSucces = preneurSuccesCheckbox.checked;


        if (!preneur) {
            alert("Veuillez sélectionner un preneur.");
            return;
        }

        let roundScores = {};
        let bonusPoints = 0;
        if (bonusPlayer) {
            bonusPoints = bonus * 4;
            players.forEach(player => {
                if (player === bonusPlayer) {
                    roundScores[player] = bonusPoints
                }
                else {
                    roundScores[player] = -bonus;
                }
            });
        }
        else {
            if (preneurSucces) {
                roundScores[preneur] = points * 2;
                if (partenaire) {
                    roundScores[partenaire] = points;
                }
            } else {
                roundScores[preneur] = -points * 2;
                if (partenaire) {
                    roundScores[partenaire] = -points;
                }
            }
            players.forEach(player => {
                if (!roundScores[player]) {
                    roundScores[player] = preneurSucces ? -points : points;
                }
            });
        }

        roundsData.push({
            preneur: preneur,
            partenaire: partenaire,
            points: points,
            contrat: contrat,
            bonusPlayer: bonusPlayer,
            bonus: bonus,
            preneurSucces: preneurSucces
        });

        players.forEach(player => {
            scores[player] += roundScores[player]
        });

        updateScoreTable();
        updateHistoryTable();
        saveGameData();
        pointsInput.value = '0';
        bonusSelect.value = '0';
        bonusPlayerSelect.value = 'none';

    });

    showHistoryButton.addEventListener('click', () => {
        gameArea.style.display = 'none';
        historyArea.style.display = 'block';

    });
    backToGameFromHistoryButton.addEventListener('click', () => {
        historyArea.style.display = 'none';
        gameArea.style.display = 'block';
    });

    function updateScoreTable() {
        scoreBody.innerHTML = '';
        players.forEach(player => {
            const row = document.createElement('tr');
            const nameCell = document.createElement('td');
            nameCell.textContent = player;
            const scoreCell = document.createElement('td');
            scoreCell.textContent = scores[player];
            row.appendChild(nameCell);
            row.appendChild(scoreCell);
            scoreBody.appendChild(row);
        });
    }
    function updateHistoryTable() {
        historyContent.innerHTML = '';
        if (roundsData.length === 0) {
            historyContent.innerHTML = '<p>Aucune manche jouée.</p>';
            return;
        }

        const historyList = document.createElement('ul');
        roundsData.forEach((round, index) => {
            const listItem = document.createElement('li');
            let partenaireText = round.partenaire ? `, Partenaire: ${round.partenaire}` : '';
            let bonusText = round.bonusPlayer ? `, Bonus: ${round.bonus} pour ${round.bonusPlayer}` : '';
            const succesText = round.preneurSucces ? 'Succès' : 'Echec';
            listItem.textContent = `Manche ${index + 1}: Preneur: ${round.preneur}${partenaireText}, Points: ${round.points}, contrat: ${round.contrat} (${succesText}) ${bonusText}.`;
            historyList.appendChild(listItem);
        });

        historyContent.appendChild(historyList);
    }


    showStatsButton.addEventListener('click', () => {
        gameArea.style.display = 'none';
        statsArea.style.display = 'block';
        generateStats();
    });

    backToGameFromStatsButton.addEventListener('click', () => {
        statsArea.style.display = 'none';
        gameArea.style.display = 'block';
    });

    function generateStats() {
        let preneurCounts = {};
        let partenaireCounts = {};
        let bonusCounts = {};
        let bonusPoints = {};


        roundsData.forEach(round => {
            if (round.preneur) {
                preneurCounts[round.preneur] = (preneurCounts[round.preneur] || 0) + 1;
            }
            if (round.partenaire) {
                partenaireCounts[round.partenaire] = (partenaireCounts[round.partenaire] || 0) + 1;
            }
            if (round.bonusPlayer) {
                bonusCounts[round.bonusPlayer] = (bonusCounts[round.bonusPlayer] || 0) + 1;
            }
        });
        players.forEach(player => {
            bonusPoints[player] = scores[player];
        });

        // Tri par ordre décroissant du nombre de preneurs
        const sortedPreneurs = Object.entries(preneurCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 3); // Top 3

        const sortedPartenaires = Object.entries(partenaireCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 3);

        const sortedBonusPlayers = Object.entries(bonusCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 3);

        const sortedBonusPoints = Object.entries(bonusPoints)
            .sort(([, pointsA], [, pointsB]) => pointsB - pointsA)
            .slice(0, 3);


        let html = '<h2>Top Preneurs</h2><ul>';
        sortedPreneurs.forEach(([player, count]) => {
            html += `<li>${player}: ${count} fois</li>`;
        });
        html += '</ul>';

        html += '<h2>Top Partenaires</h2><ul>';
        sortedPartenaires.forEach(([player, count]) => {
            html += `<li>${player}: ${count} fois</li>`;
        });
        html += '</ul>';


        html += '<h2>Top Bonus</h2><ul>';
        sortedBonusPlayers.forEach(([player, count]) => {
            html += `<li>${player}: ${count} fois</li>`;
        });
        html += '</ul>';

        html += '<h2>Top Points Bonus</h2><ul>';
        sortedBonusPoints.forEach(([player, points]) => {
            html += `<li>${player}: ${points} points</li>`;
        });
        html += '</ul>';

        statsContent.innerHTML = html;
    }

    function saveGameData() {
        const gameData = {
            players: players,
            scores: scores,
            roundsData: roundsData
        };
        localStorage.setItem('gameData', JSON.stringify(gameData));
    }


});