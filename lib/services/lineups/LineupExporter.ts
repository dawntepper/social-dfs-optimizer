export class LineupExporter {
  exportToCSV(lineups: any[]): string {
    // Header row with position columns
    const headers = ['QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'TE', 'FLEX', 'DST'];
    
    // Convert lineups to rows
    const rows = lineups.map(lineup => {
      const positions = [...headers]; // Copy header positions
      const row = new Array(positions.length).fill(''); // Initialize empty row
      
      // Map players to their positions
      lineup.players.forEach(player => {
        const playerStr = `${player.name} (${player.id})`; // Format: "Name (ID)"
        
        // Find the appropriate position slot
        if (player.position === 'QB') {
          row[0] = playerStr;
        } else if (player.position === 'RB') {
          const rbIndex = row[1] ? 2 : 1; // Fill first empty RB slot
          row[rbIndex] = playerStr;
        } else if (player.position === 'WR') {
          const wrIndex = row[3] ? row[4] ? 5 : 4 : 3; // Fill first empty WR slot
          row[wrIndex] = playerStr;
        } else if (player.position === 'TE') {
          row[6] = playerStr;
        } else if (player.position === 'DST') {
          row[8] = playerStr;
        }
        
        // Handle FLEX position
        if (row[7] === '' && ['RB', 'WR', 'TE'].includes(player.position)) {
          // Check if this player isn't already used in their primary position
          const isUnused = !row.includes(`${player.name} (${player.id})`);
          if (isUnused) {
            row[7] = playerStr;
          }
        }
      });
      
      return row;
    });
    
    // Combine headers and rows with tabs and newlines
    return [headers.join('\t'), ...rows.map(row => row.join('\t'))].join('\n');
  }
}

export const lineupExporter = new LineupExporter();